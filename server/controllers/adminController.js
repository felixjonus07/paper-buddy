const { Op, fn, col } = require('sequelize');
const User = require('../models/User');
const Group = require('../models/Group');
const Fee = require('../models/Fee');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const StudentFee = require('../models/StudentFee');
const FeeType = require('../models/FeeType');
const Scholarship = require('../models/Scholarship');
const FeeRequest = require('../models/FeeRequest');
const College = require('../models/College');
const Settlement = require('../models/Settlement');
const { calculateDynamicFeeAmount } = require('../utils/feeUtils');
const { populate, toPlain, isUUID } = require('../utils/populate');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');

/**
 * ============================================================================
 * ADMIN CONTROLLER - SIMPLE EXPLANATION
 * ============================================================================
 * This file handles all the actions that a College Admin can perform.
 *
 * IMPORTANT RULE: DATA SEPARATION (Multi-Tenancy)
 * ----------------------------------------------------------------------------
 * This system is used by many colleges. To make sure one college cannot see
 * or change another college's data, we use a rule called "Data Separation".
 * ============================================================================
 */

// Helper function to apply scholarship rules and calculate discounts
const applyFeeRules = async (student, fee) => {
  let discountAmount = 0;

  if (student.scholarship) {
    const scholarshipId = typeof student.scholarship === 'object' ? student.scholarship._id : student.scholarship;
    const scholarship = isUUID(String(scholarshipId))
      ? await Scholarship.findByPk(scholarshipId, { raw: true })
      : null;
    if (scholarship && student.academicScore >= scholarship.minAcademicScore) {
      if (
        !scholarship.applicableFeeTypes ||
        scholarship.applicableFeeTypes.length === 0 ||
        scholarship.applicableFeeTypes.some(typeId => String(typeId) === String(fee.feeType))
      ) {
        discountAmount = (fee.amount * scholarship.discountPercentage) / 100;
      }
    }
  }

  return {
    baseAmount: fee.amount,
    discountAmount: discountAmount,
    finalAmount: Math.max(0, fee.amount - discountAmount)
  };
};

const getAllAncestorGroups = async (groupId) => {
  const ancestors = new Set();
  const queue = [String(groupId)];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!isUUID(currentId)) continue;
    const group = await Group.findByPk(currentId, { attributes: ['_id', 'parentGroups'], raw: true });
    if (group && group.parentGroups && group.parentGroups.length > 0) {
      for (const p of group.parentGroups) {
        const pid = String(p);
        if (!ancestors.has(pid)) {
          ancestors.add(pid);
          queue.push(pid);
        }
      }
    }
  }
  return Array.from(ancestors);
};

const assignGroupsAndFeesToUsers = async (userIds, targetGroupId, collegeId) => {
  if (!targetGroupId || userIds.length === 0) return;

  const ancestorGroupIds = await getAllAncestorGroups(targetGroupId);
  const allGroupIds = [String(targetGroupId), ...ancestorGroupIds];

  const fees = await Fee.findAll({
    where: { assignedToGroup: { [Op.in]: allGroupIds }, collegeId },
    raw: true
  });
  const allNewStudentFees = [];

  for (const userId of userIds) {
    if (!isUUID(String(userId))) continue;
    const user = await User.findByPk(userId);
    if (!user) continue;

    const currentGroups = (user.groups || []).map(String);
    let userModified = false;
    for (const gid of allGroupIds) {
      if (!currentGroups.includes(gid)) {
        currentGroups.push(gid);
        userModified = true;
      }
    }
    if (userModified) {
      user.groups = currentGroups;
      await user.save();
    }

    const userPlain = await populate(toPlain(user), 'scholarship', Scholarship);
    for (const fee of fees) {
      const existingStudentFee = await StudentFee.findOne({
        where: { studentId: user._id, feeId: fee._id },
        raw: true
      });
      if (!existingStudentFee) {
        const { baseAmount, discountAmount, finalAmount } = await applyFeeRules(userPlain, fee);
        allNewStudentFees.push({
          studentId: user._id,
          groupId: fee.assignedToGroup,
          feeId: fee._id,
          baseAmount,
          discountAmount,
          finalAmount,
          status: 'PENDING',
          collegeId
        });
      }
    }
  }

  if (allNewStudentFees.length > 0) {
    await StudentFee.bulkCreate(allNewStudentFees, { ignoreDuplicates: true }).catch(() => {});
  }
};

// Create multiple student users at once
const bulkCreateUsers = async (req, res) => {
  try {
    const { prefix, startRange, endRange, suffix, initialPassword, groupId } = req.body;

    if (!prefix || startRange === undefined || endRange === undefined || !initialPassword) {
      return res.status(400).json({ message: 'Missing required fields for bulk creation' });
    }

    const start = parseInt(startRange, 10);
    const end = parseInt(endRange, 10);

    if (start > end) {
      return res.status(400).json({ message: 'Start range cannot be greater than end range' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(initialPassword, salt);

    const newUsers = [];
    for (let i = start; i <= end; i++) {
      const paddedNum = i.toString().padStart(3, '0');
      const username = `${prefix}${paddedNum}${suffix || ''}`;

      newUsers.push({
        name: `Student ${username}`,
        username,
        password: hashedPassword,
        role: 'user',
        collegeId: req.user.collegeId,
        mustChangePassword: true,
        groups: []
      });
    }

    const createdUsers = await User.bulkCreate(newUsers, {
      ignoreDuplicates: true,
      returning: true
    });

    if (groupId && createdUsers.length > 0) {
      const createdUserIds = createdUsers.map(u => u._id);
      await assignGroupsAndFeesToUsers(createdUserIds, groupId, req.user.collegeId);
    }

    res.status(201).json({ message: `Successfully created ${createdUsers.length} users.`, users: createdUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload Users via Excel/CSV
const uploadBulkUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { commonPassword, groupId } = req.body;

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'The uploaded file is empty' });
    }

    const salt = await bcrypt.genSalt(10);
    const newUsers = [];
    let skippedCount = 0;

    for (const row of rows) {
      const name = row['Name'] || row['name'] || row['Full Name'];
      const username = row['Username'] || row['username'] || row['Register Number'] || row['Reg No'] || row['regno'];
      let password = row['Password'] || row['password'];

      if (!username) {
        skippedCount++;
        continue;
      }

      if (!password) {
        password = commonPassword || String(username);
      }

      const hashedPassword = await bcrypt.hash(String(password), salt);

      newUsers.push({
        name: name || `Student ${username}`,
        username: String(username),
        registerNumber: String(username),
        password: hashedPassword,
        phoneNumber: row['Phone Number'] || row['phone'] || '',
        studentClass: row['Class'] || row['class'] || '',
        section: row['Section'] || row['section'] || '',
        year: row['Year'] || row['year'] || '',
        personalEmail: row['Personal Email'] || row['email'] || '',
        collegeEmail: row['College Email'] || '',
        academicScore: Number(row['Academic Score']) || 0,
        role: 'user',
        collegeId: req.user.collegeId,
        mustChangePassword: true,
        groups: []
      });
    }

    if (newUsers.length === 0) {
      return res.status(400).json({ message: 'No valid users found in the file. Make sure you have a "Username" column.' });
    }

    const createdUsers = await User.bulkCreate(newUsers, {
      ignoreDuplicates: true,
      returning: true
    });

    if (groupId && createdUsers.length > 0) {
      const createdUserIds = createdUsers.map(u => u._id);
      await assignGroupsAndFeesToUsers(createdUserIds, groupId, req.user.collegeId);
    }

    res.status(201).json({
      message: `Successfully created ${createdUsers.length} users. ${skippedCount > 0 ? `Skipped ${skippedCount} invalid rows.` : ''}`,
      users: createdUsers
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create Group
const createGroup = async (req, res) => {
  try {
    const { name, description, studentIds, isGlobal } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const group = await Group.create({
      name,
      description,
      isGlobal: isGlobal || false,
      collegeId: req.user.collegeId
    });

    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      const students = await User.findAll({
        where: { _id: { [Op.in]: studentIds }, collegeId: req.user.collegeId }
      });
      for (const s of students) {
        const cur = s.groups || [];
        if (!cur.some(id => String(id) === String(group._id))) {
          s.groups = [...cur, group._id];
          await s.save();
        }
      }

      const fees = await Fee.findAll({ where: { assignedToGroup: group._id }, raw: true });
      if (fees.length > 0) {
        const studentFees = [];
        for (const student of students) {
          for (const fee of fees) {
            const { baseAmount, discountAmount, finalAmount } = await applyFeeRules(student, fee);
            studentFees.push({
              studentId: student._id,
              groupId: group._id,
              feeId: fee._id,
              baseAmount,
              discountAmount,
              finalAmount,
              status: 'PENDING',
              collegeId: req.user.collegeId
            });
          }
        }

        if (studentFees.length > 0) {
          await StudentFee.bulkCreate(studentFees);
        }
      }
    }

    res.status(201).json(group);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'A group with this name already exists. Please choose a different name.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update Group
const updateGroup = async (req, res) => {
  try {
    if (!isUUID(req.params.id)) return res.status(404).json({ message: 'Group not found or unauthorized' });
    const { name, description, isGlobal, parentId } = req.body;
    const group = await Group.findOne({ where: { _id: req.params.id, collegeId: req.user.collegeId } });
    if (!group) return res.status(404).json({ message: 'Group not found or unauthorized' });

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (isGlobal !== undefined) group.isGlobal = isGlobal;
    if (parentId !== undefined) {
      if (parentId === '') {
        group.parentGroups = [];
      } else {
        group.parentGroups = [parentId];
      }
    }

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Group
const deleteGroup = async (req, res) => {
  try {
    if (!isUUID(req.params.id)) return res.status(404).json({ message: 'Group not found or unauthorized' });
    const group = await Group.findOne({ where: { _id: req.params.id, collegeId: req.user.collegeId } });
    if (!group) return res.status(404).json({ message: 'Group not found or unauthorized' });

    await group.destroy();

    await User.update(
      { groups: fn('array_remove', col('groups'), req.params.id) },
      { where: { groups: { [Op.contains]: [req.params.id] }, collegeId: req.user.collegeId } }
    );

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Mentor for a Group
const createGroupMentor = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, username, password } = req.body;
    if (!isUUID(groupId)) return res.status(404).json({ message: 'Group not found or unauthorized' });

    const group = await Group.findOne({ where: { _id: groupId, collegeId: req.user.collegeId }, raw: true });
    if (!group) return res.status(404).json({ message: 'Group not found or unauthorized' });

    const userExists = await User.findOne({ where: { username }, raw: true });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const mentor = await User.create({
      name,
      username,
      password: hashedPassword,
      role: 'mentor',
      collegeId: req.user.collegeId,
      groups: [groupId]
    });

    res.status(201).json({ _id: mentor._id, name: mentor.name, username: mentor.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Groups
const getGroups = async (req, res) => {
  try {
    const rawGroups = await Group.findAll({ where: { collegeId: req.user.collegeId }, raw: true });
    const groups = await populate(rawGroups, 'parentGroups', Group, ['name']);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign Student(s) to Group
const assignStudentToGroup = async (req, res) => {
  try {
    const { userId, userIds, groupId } = req.body;

    let idsToProcess = [];
    if (userIds && Array.isArray(userIds)) {
      idsToProcess = userIds;
    } else if (userId) {
      idsToProcess = [userId];
    }

    if (idsToProcess.length === 0 || !groupId) {
      return res.status(400).json({ message: 'User ID(s) and Group ID are required' });
    }

    await assignGroupsAndFeesToUsers(idsToProcess, groupId, req.user.collegeId);

    res.status(200).json({ message: 'Student(s) assigned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign Subgroup
const assignSubGroup = async (req, res) => {
  try {
    const { parentId, childId } = req.body;
    if (!parentId || !childId) {
      return res.status(400).json({ message: 'Parent ID and Child ID are required' });
    }
    if (parentId === childId) {
      return res.status(400).json({ message: 'A group cannot be its own subgroup' });
    }
    if (!isUUID(childId) || !isUUID(parentId)) {
      return res.status(404).json({ message: 'Child group not found or unauthorized' });
    }

    const childGroup = await Group.findOne({ where: { _id: childId, collegeId: req.user.collegeId } });
    if (!childGroup) return res.status(404).json({ message: 'Child group not found or unauthorized' });

    const currentParents = (childGroup.parentGroups || []).map(String);
    if (!currentParents.includes(String(parentId))) {
      childGroup.parentGroups = [...currentParents, parentId];
      await childGroup.save();
    }

    res.status(200).json({ message: 'Subgroup assigned successfully', childGroup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign Fee to User
const assignFeeToUser = async (req, res) => {
  try {
    const { title, amount, feeType, userId, groupId, deadlineDate, lateFeeFine, lateFeeFineType } = req.body;

    if (!title || !amount || !feeType || !userId) {
      return res.status(400).json({ message: 'Title, amount, feeType, and userId are required' });
    }
    if (!isUUID(userId)) return res.status(404).json({ message: 'User not found or unauthorized' });

    const rawUser = await User.findOne({ where: { _id: userId, collegeId: req.user.collegeId }, raw: true });
    if (!rawUser) return res.status(404).json({ message: 'User not found or unauthorized' });
    const user = await populate(rawUser, 'scholarship', Scholarship);

    const fee = await Fee.create({
      title,
      amount,
      feeType,
      assignedToUser: userId,
      assignedToGroup: groupId || null,
      collegeId: req.user.collegeId,
      deadlineDate: deadlineDate || null,
      lateFeeFine: lateFeeFine || 0,
      lateFeeFineType: lateFeeFineType || 'total'
    });

    const { baseAmount, discountAmount, finalAmount } = await applyFeeRules(user, fee);
    await StudentFee.create({
      studentId: userId,
      groupId: groupId || null,
      feeId: fee._id,
      baseAmount,
      discountAmount,
      finalAmount,
      status: 'PENDING',
      collegeId: req.user.collegeId
    });

    res.status(201).json({ message: 'Fee assigned to user successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign Fee to Group
const assignFeeToGroup = async (req, res) => {
  try {
    const { title, amount, feeType, groupId, deadlineDate, lateFeeFine, lateFeeFineType } = req.body;

    if (!title || !amount || !feeType || !groupId) {
      return res.status(400).json({ message: 'Title, amount, feeType, and groupId are required' });
    }
    if (!isUUID(groupId)) return res.status(404).json({ message: 'Group not found' });

    const group = await Group.findOne({ where: { _id: groupId, collegeId: req.user.collegeId }, raw: true });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const fee = await Fee.create({
      title,
      amount,
      feeType,
      assignedToGroup: groupId,
      collegeId: req.user.collegeId,
      deadlineDate: deadlineDate || null,
      lateFeeFine: lateFeeFine || 0,
      lateFeeFineType: lateFeeFineType || 'total'
    });

    const students = await User.findAll({ where: { groups: { [Op.contains]: [groupId] } }, raw: true });
    const studentFees = [];

    for (const student of students) {
      const { baseAmount, discountAmount, finalAmount } = await applyFeeRules(student, fee);
      studentFees.push({
        studentId: student._id,
        groupId: groupId,
        feeId: fee._id,
        baseAmount,
        discountAmount,
        finalAmount,
        status: 'PENDING',
        collegeId: req.user.collegeId
      });
    }

    if (studentFees.length > 0) {
      await StudentFee.bulkCreate(studentFees);
    }

    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users that belong to the admin's college (passwords are hidden for security)
const getUsers = async (req, res) => {
  try {
    const rawUsers = await User.findAll({
      where: { collegeId: req.user.collegeId, role: { [Op.in]: ['user', 'mentor', 'cashier'] } },
      attributes: { exclude: ['password'] },
      raw: true
    });
    const users = await populate(rawUsers, 'groups', Group, ['name']);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Fees
const getAllFees = async (req, res) => {
  try {
    const rawFees = await Fee.findAll({ where: { collegeId: req.user.collegeId }, raw: true });
    let fees = await populate(rawFees, 'assignedToGroup', Group, ['name']);
    fees = await populate(fees, 'feeType', FeeType, ['name']);
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Loans
const getLoans = async (req, res) => {
  try {
    const rawLoans = await Loan.findAll({ order: [['appliedAt', 'DESC']], raw: true });
    const loans = await populate(rawLoans, 'user', User, ['name', 'username']);
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Loan Status
const updateLoanStatus = async (req, res) => {
  try {
    const { loanId, status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    if (!isUUID(loanId)) return res.status(404).json({ message: 'Loan not found' });

    const loan = await Loan.findByPk(loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    await loan.update({ status });
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User (Edit Profile)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUUID(id)) return res.status(404).json({ message: 'User not found or unauthorized' });
    const { scholarship, academicScore } = req.body;

    const user = await User.findOne({ where: { _id: id, collegeId: req.user.collegeId } });
    if (!user) return res.status(404).json({ message: 'User not found or unauthorized' });

    if (scholarship !== undefined) {
      user.scholarship = scholarship === 'NONE' ? null : scholarship;
    }
    if (academicScore !== undefined) user.academicScore = academicScore;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUUID(id)) return res.status(404).json({ message: 'User not found or unauthorized' });
    const user = await User.findOne({ where: { _id: id, collegeId: req.user.collegeId } });
    if (!user) return res.status(404).json({ message: 'User not found or unauthorized' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Group Dashboard Data
const getGroupDashboardData = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUUID(id)) return res.status(404).json({ message: 'Group not found or unauthorized' });

    const [rawGroup, rawAllGroups] = await Promise.all([
      Group.findOne({ where: { _id: id, collegeId: req.user.collegeId }, raw: true }),
      Group.findAll({
        where: { collegeId: req.user.collegeId },
        attributes: ['_id', 'name', 'parentGroups', 'description'],
        raw: true
      })
    ]);

    if (!rawGroup) return res.status(404).json({ message: 'Group not found or unauthorized' });

    const [group, allGroups] = await Promise.all([
      populate(rawGroup, 'parentGroups', Group, ['name']),
      populate(rawAllGroups, 'parentGroups', Group, ['name'])
    ]);

    // Find child groups to aggregate data
    const childGroups = await Group.findAll({
      where: { parentGroups: { [Op.contains]: [id] } },
      attributes: ['_id'],
      raw: true
    });
    const allGroupIds = [id, ...childGroups.map(g => g._id)];

    const [rawUsers, rawFees] = await Promise.all([
      User.findAll({
        where: { groups: { [Op.overlap]: allGroupIds } },
        attributes: { exclude: ['password'] },
        raw: true
      }),
      Fee.findAll({
        where: { assignedToGroup: { [Op.in]: allGroupIds } },
        raw: true
      })
    ]);

    const [users, fees] = await Promise.all([
      populate(rawUsers, 'scholarship', Scholarship, ['name']),
      populate(rawFees, 'feeType', FeeType, ['name'])
    ]);

    const studentIds = users.map(u => u._id);
    let studentFeeWhere, paymentWhere;

    if (group.isGlobal) {
      studentFeeWhere = { studentId: { [Op.in]: studentIds } };
      paymentWhere = { user: { [Op.in]: studentIds } };
    } else {
      studentFeeWhere = {
        [Op.or]: [
          { groupId: { [Op.in]: allGroupIds } },
          { studentId: { [Op.in]: studentIds }, groupId: null }
        ]
      };
      paymentWhere = {
        [Op.or]: [
          { group: { [Op.in]: allGroupIds } },
          { user: { [Op.in]: studentIds }, group: null }
        ]
      };
    }

    const [studentFeesRows, payments] = await Promise.all([
      StudentFee.findAll({ where: studentFeeWhere, raw: true }),
      Payment.findAll({ where: paymentWhere, raw: true })
    ]);

    let studentFeesRaw = await populate(studentFeesRows, 'studentId', User, ['name', 'username', 'academicScore', 'scholarship']);
    const populatedStudents = studentFeesRaw.map(sf => sf.studentId).filter(Boolean);
    await populate(populatedStudents, 'scholarship', Scholarship, ['name']);
    studentFeesRaw = await populate(studentFeesRaw, 'feeId', Fee);

    const studentFees = studentFeesRaw.map(sf => {
      sf.finalAmount = calculateDynamicFeeAmount(sf);
      return sf;
    });

    const totalAssignedValue = studentFees.reduce((sum, sf) => sum + sf.finalAmount, 0);
    const amountCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const amountPending = Math.max(0, totalAssignedValue - amountCollected);

    const ledgerByStudent = {};

    for (const u of users) {
      const sId = String(u._id);
      ledgerByStudent[sId] = {
        student: u,
        baseTotal: 0,
        discountTotal: 0,
        netPayable: 0,
        amountPaid: 0,
        amountPending: 0,
        status: 'NONE'
      };
    }

    for (const sf of studentFees) {
      if (!sf.studentId) continue;
      const sId = String(sf.studentId._id || sf.studentId);
      if (!ledgerByStudent[sId]) {
        ledgerByStudent[sId] = {
          student: sf.studentId,
          baseTotal: 0,
          discountTotal: 0,
          netPayable: 0,
          amountPaid: 0,
          amountPending: 0,
          status: 'PENDING'
        };
      }
      ledgerByStudent[sId].baseTotal += sf.baseAmount;
      ledgerByStudent[sId].discountTotal += sf.discountAmount;
      ledgerByStudent[sId].netPayable += sf.finalAmount;
    }

    for (const p of payments) {
      if (!p.user) continue;
      const sId = String(p.user);
      if (ledgerByStudent[sId]) {
        ledgerByStudent[sId].amountPaid += p.amount;
      }
    }

    for (const sId in ledgerByStudent) {
      const ledger = ledgerByStudent[sId];
      ledger.amountPending = Math.max(0, ledger.netPayable - ledger.amountPaid);
      if (ledger.amountPending === 0 && ledger.netPayable > 0) {
        ledger.status = 'PAID';
      } else if (ledger.amountPaid > 0) {
        ledger.status = 'PARTIAL';
      }
    }

    const studentLedgers = Object.values(ledgerByStudent);

    res.json({
      group,
      allGroups,
      users,
      fees,
      studentLedgers,
      totalAssignedValue,
      amountCollected,
      amountPending
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Master Data: Fee Types

const createFeeType = async (req, res) => {
  try {
    const { name, description } = req.body;
    const feeType = await FeeType.create({ name, description, collegeId: req.user.collegeId });
    res.status(201).json(feeType);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create fee type' });
  }
};

const getFeeTypes = async (req, res) => {
  try {
    const types = await FeeType.findAll({ where: { collegeId: req.user.collegeId }, raw: true });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee types' });
  }
};

const deleteFeeType = async (req, res) => {
  try {
    if (!isUUID(req.params.id)) return res.json({ message: 'Fee type deleted' });
    await FeeType.destroy({ where: { _id: req.params.id, collegeId: req.user.collegeId } });
    res.json({ message: 'Fee type deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete fee type' });
  }
};

// --- SCHOLARSHIP MASTERS ---

const createScholarship = async (req, res) => {
  try {
    const { name, description, discountPercentage, applicableFeeTypes, minAcademicScore } = req.body;
    const scholarship = await Scholarship.create({
      name, description, discountPercentage, applicableFeeTypes, minAcademicScore, collegeId: req.user.collegeId
    });
    res.status(201).json(scholarship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getScholarships = async (req, res) => {
  try {
    const rawScholarships = await Scholarship.findAll({ where: { collegeId: req.user.collegeId }, raw: true });
    const scholarships = await populate(rawScholarships, 'applicableFeeTypes', FeeType, ['name']);
    res.json(scholarships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteScholarship = async (req, res) => {
  try {
    if (!isUUID(req.params.id)) return res.json({ message: 'Scholarship deleted' });
    await Scholarship.destroy({ where: { _id: req.params.id, collegeId: req.user.collegeId } });
    res.json({ message: 'Scholarship deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Fee
const deleteFee = async (req, res) => {
  try {
    const feeId = req.params.id;
    if (!isUUID(feeId)) return res.status(404).json({ message: 'Fee not found or unauthorized' });

    const fee = await Fee.findOne({ where: { _id: feeId, collegeId: req.user.collegeId } });
    if (!fee) return res.status(404).json({ message: 'Fee not found or unauthorized' });

    const paidCount = await StudentFee.count({ where: { feeId, status: 'PAID' } });
    if (paidCount > 0) {
      return res.status(400).json({ message: 'Cannot delete fee because one or more students have already paid this fee.' });
    }

    await StudentFee.destroy({ where: { feeId } });
    await fee.destroy();

    res.json({ message: 'Fee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeeRequests = async (req, res) => {
  try {
    const rawRequests = await FeeRequest.findAll({
      where: { collegeId: req.user.collegeId },
      order: [['createdAt', 'DESC']],
      raw: true
    });
    let requests = await populate(rawRequests, 'studentId', User, ['name', 'username', 'registerNumber', 'studentClass', 'section', 'year']);
    requests = await populate(requests, 'feeType', FeeType, ['name']);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFeeRequestStatus = async (req, res) => {
  try {
    if (!isUUID(req.params.id)) return res.status(404).json({ message: 'Fee request not found or unauthorized' });
    const { status } = req.body;
    const request = await FeeRequest.findOne({ where: { _id: req.params.id, collegeId: req.user.collegeId } });
    if (!request) {
      return res.status(404).json({ message: 'Fee request not found or unauthorized' });
    }
    request.status = status;
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentReports = async (req, res) => {
  try {
    const { startDate, endDate, collegeId } = req.query;
    const targetCollegeId = req.user.collegeId || collegeId;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide both startDate and endDate' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const rawPayments = await Payment.findAll({
      where: {
        paidAt: { [Op.gte]: start, [Op.lte]: end },
        status: 'SUCCESS'
      },
      attributes: ['_id', 'amount', 'status', 'paymentMethod', 'paidAt', 'user', 'fee'],
      order: [['paidAt', 'DESC']],
      raw: true
    });

    const withUser = await populate(rawPayments, 'user', User, ['name', 'registerNumber', 'collegeId']);
    const filtered = withUser.filter(p => {
      if (!p.user) return false;
      if (targetCollegeId && String(p.user.collegeId) !== String(targetCollegeId)) return false;
      return true;
    });

    const withFee = await populate(filtered, 'fee', Fee, ['title']);

    const payments = withFee.map(p => ({
      _id: p._id,
      amount: p.amount,
      status: p.status,
      paymentMethod: p.paymentMethod,
      paidAt: p.paidAt,
      userDetails: {
        name: p.user.name,
        registerNumber: p.user.registerNumber
      },
      ...(p.fee ? { feeDetails: { title: p.fee.title } } : {})
    }));

    const totalCollected = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      payments,
      totalCollected,
      count: payments.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentSettings = async (req, res) => {
  try {
    if (!isUUID(req.user.collegeId)) return res.status(404).json({ message: 'College not found' });
    const college = await College.findByPk(req.user.collegeId, { raw: true });
    if (!college) return res.status(404).json({ message: 'College not found' });

    res.json({
      paymentType: college.paymentType || 'CENTRALIZED',
      paymentCredentials: {
        merchantId: college.paymentCredentials?.merchantId || '',
        saltIndex: college.paymentCredentials?.saltIndex || 1,
        env: college.paymentCredentials?.env || 'SANDBOX',
        hasSaltKey: !!college.paymentCredentials?.saltKey?.encryptedData
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePaymentSettings = async (req, res) => {
  try {
    const { paymentType, paymentCredentials } = req.body;
    const { encrypt } = require('../utils/encryption');

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can update payment settings' });
    }

    const collegeId = req.user.collegeId || req.body.collegeId;
    if (!collegeId || !isUUID(collegeId)) {
      return res.status(400).json({ message: 'College ID not found' });
    }

    const college = await College.findByPk(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    college.paymentType = paymentType;
    if (paymentType === 'DECENTRALIZED' && paymentCredentials) {
      const nextCreds = {
        merchantId: paymentCredentials.merchantId,
        saltIndex: paymentCredentials.saltIndex || 1,
        env: paymentCredentials.env || 'SANDBOX'
      };
      if (paymentCredentials.saltKey && paymentCredentials.saltKey !== '********') {
        nextCreds.saltKey = encrypt(paymentCredentials.saltKey);
      } else if (college.paymentCredentials?.saltKey) {
        nextCreds.saltKey = college.paymentCredentials.saltKey;
      }
      college.paymentCredentials = nextCreds;
      college.changed('paymentCredentials', true);
    }

    await college.save();
    res.json({ message: 'Payment settings updated successfully', paymentType: college.paymentType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all cashiers for the college
const getCashiers = async (req, res) => {
  try {
    const cashiers = await User.findAll({
      where: {
        collegeId: req.user.collegeId,
        role: 'cashier'
      },
      attributes: ['_id', 'name', 'username', 'personalEmail', 'phoneNumber'],
      raw: true
    });
    res.json(cashiers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment logs for a specific cashier on a given date
const getCashierLogs = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUUID(id)) return res.json({ logs: [], totalCollected: 0 });
    const { date } = req.query;

    const where = { collegeId: req.user.collegeId, processedBy: id, status: 'SUCCESS' };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.paidAt = { [Op.gte]: startOfDay, [Op.lte]: endOfDay };
    }

    const rawLogs = await Payment.findAll({
      where,
      order: [['paidAt', 'DESC']],
      raw: true
    });
    let logs = await populate(rawLogs, 'user', User, ['name', 'username', 'registerNumber']);
    logs = await populate(logs, 'fee', Fee, ['title']);

    const totalCollected = logs.reduce((sum, p) => sum + p.amount, 0);

    res.json({ logs, totalCollected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLedger = async (req, res) => {
  try {
    if (!isUUID(req.user.collegeId)) return res.status(404).json({ message: 'College not found' });
    const college = await College.findByPk(req.user.collegeId, { raw: true });
    const isCentralized = (college?.paymentType || 'CENTRALIZED') === 'CENTRALIZED';

    const onlinePayments = await Payment.findAll({
      where: {
        collegeId: req.user.collegeId,
        status: 'SUCCESS',
        paymentMethod: { [Op.ne]: 'CASH' }
      },
      raw: true
    });

    const totalOnlineCollected = isCentralized ? onlinePayments.reduce((sum, p) => sum + p.amount, 0) : 0;

    const settlements = await Settlement.findAll({
      where: { collegeId: req.user.collegeId },
      order: [['initiatedAt', 'DESC']],
      raw: true
    });

    const totalSettled = settlements.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + s.amount, 0);
    const pendingSettlement = settlements.filter(s => s.status === 'PENDING_ADMIN_CONFIRMATION').reduce((sum, s) => sum + s.amount, 0);
    const balanceOwed = totalOnlineCollected - totalSettled - pendingSettlement;

    res.json({
      totalOnlineCollected,
      totalSettled,
      pendingSettlement,
      balanceOwed,
      settlements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmSettlement = async (req, res) => {
  try {
    if (!isUUID(req.params.id)) return res.status(404).json({ message: 'Settlement not found' });
    const settlement = await Settlement.findOne({ where: { _id: req.params.id, collegeId: req.user.collegeId } });

    if (!settlement) {
      return res.status(404).json({ message: 'Settlement not found' });
    }

    if (settlement.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Settlement already confirmed' });
    }

    settlement.status = 'COMPLETED';
    settlement.completedAt = new Date();
    await settlement.save();

    res.json(settlement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bulkCreateUsers,
  uploadBulkUsers,
  createGroup,
  updateGroup,
  deleteGroup,
  createGroupMentor,
  getGroups,
  assignFeeToGroup,
  assignFeeToUser,
  getUsers,
  updateUser,
  getAllFees,
  getLoans,
  updateLoanStatus,
  assignStudentToGroup,
  assignSubGroup,
  getGroupDashboardData,
  createFeeType,
  getFeeTypes,
  deleteFeeType,
  createScholarship,
  getScholarships,
  deleteScholarship,
  deleteFee,
  getFeeRequests,
  updateFeeRequestStatus,
  getPaymentReports,
  updatePaymentSettings,
  getPaymentSettings,
  getCashiers,
  getCashierLogs,
  deleteUser,
  getLedger,
  confirmSettlement
};
