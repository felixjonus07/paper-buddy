const User = require('../models/User');
const Group = require('../models/Group');
const Fee = require('../models/Fee');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const StudentFee = require('../models/StudentFee');
const FeeType = require('../models/FeeType');
const Scholarship = require('../models/Scholarship');
const bcrypt = require('bcryptjs');

// Helper function to apply scholarship rules
const applyFeeRules = async (student, fee) => {
  let discountAmount = 0;
  
  if (student.scholarship) {
    const scholarship = await Scholarship.findById(student.scholarship);
    if (scholarship && student.academicScore >= scholarship.minAcademicScore) {
      // Check applicable fee types
      if (!scholarship.applicableFeeTypes || scholarship.applicableFeeTypes.length === 0 || scholarship.applicableFeeTypes.some(typeId => typeId.equals(fee.feeType))) {
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

// Bulk Create Users
const bulkCreateUsers = async (req, res) => {
  try {
    const { prefix, startRange, endRange, suffix, initialPassword } = req.body;
    
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
      // Pad number to 3 digits (e.g. 001) - can be adjusted if needed
      const paddedNum = i.toString().padStart(3, '0');
      const username = `${prefix}${paddedNum}${suffix || ''}`;
      
      newUsers.push({
        name: `Student ${username}`,
        username,
        password: hashedPassword,
        role: 'user',
        mustChangePassword: true
      });
    }

    // Insert ignoring duplicates (if someone already exists, we can use ordered: false to continue inserting the rest)
    const result = await User.insertMany(newUsers, { ordered: false });
    
    res.status(201).json({ message: `Successfully created ${result.length} users.`, users: result });
  } catch (error) {
    if (error.code === 11000) {
       // Duplicate key error from insertMany(ordered: false)
       res.status(201).json({ message: `Bulk creation finished, but some users were skipped because they already existed.`, insertedCount: error.insertedDocs?.length || 0 });
    } else {
       res.status(500).json({ message: error.message });
    }
  }
};

// Create Group
const createGroup = async (req, res) => {
  try {
    const { name, description, studentIds } = req.body;
    const group = await Group.create({ name, description });

    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      await User.updateMany(
        { _id: { $in: studentIds } },
        { $addToSet: { groups: group._id } }
      );
      
      // If there are any fees already assigned to this group, we need to generate StudentFees
      const fees = await Fee.find({ assignedToGroup: group._id });
      if (fees.length > 0) {
        const students = await User.find({ _id: { $in: studentIds } });
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
              status: 'PENDING'
            });
          }
        }
        
        if (studentFees.length > 0) {
          await StudentFee.insertMany(studentFees);
        }
      }
    }

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Groups
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('parentGroups', 'name');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign Student(s) to Group
const assignStudentToGroup = async (req, res) => {
  try {
    const { userId, userIds, groupId } = req.body;
    
    // Support both single userId (legacy) or array of userIds
    let idsToProcess = [];
    if (userIds && Array.isArray(userIds)) {
      idsToProcess = userIds;
    } else if (userId) {
      idsToProcess = [userId];
    }

    if (idsToProcess.length === 0 || !groupId) {
      return res.status(400).json({ message: 'User ID(s) and Group ID are required' });
    }
    
    const fees = await Fee.find({ assignedToGroup: groupId });
    const allNewStudentFees = [];
    
    for (const id of idsToProcess) {
      const user = await User.findById(id);
      if (!user) continue; // Skip if user not found
      
      if (!user.groups.includes(groupId)) {
        user.groups.push(groupId);
        await user.save();
        
        // Generate StudentFee records for existing fees in this group
        for (const fee of fees) {
          const { baseAmount, discountAmount, finalAmount } = await applyFeeRules(user, fee);
          allNewStudentFees.push({
            studentId: user._id,
            groupId: groupId,
            feeId: fee._id,
            baseAmount,
            discountAmount,
            finalAmount,
            status: 'PENDING'
          });
        }
      }
    }
    
    if (allNewStudentFees.length > 0) {
      await StudentFee.insertMany(allNewStudentFees);
    }
    
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

    const childGroup = await Group.findById(childId);
    if (!childGroup) return res.status(404).json({ message: 'Child group not found' });

    if (!childGroup.parentGroups) {
      childGroup.parentGroups = [];
    }
    if (!childGroup.parentGroups.includes(parentId)) {
      childGroup.parentGroups.push(parentId);
      await childGroup.save();
    }

    res.status(200).json({ message: 'Subgroup assigned successfully', childGroup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign Fee to Group
const assignFeeToGroup = async (req, res) => {
  try {
    const { title, amount, feeType, groupId } = req.body;
    
    if (!title || !amount || !feeType || !groupId) {
       return res.status(400).json({ message: 'Title, amount, feeType, and groupId are required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const fee = await Fee.create({
      title,
      amount,
      feeType,
      assignedToGroup: groupId
    });

    // Generate StudentFee records for all students in this group
    const students = await User.find({ groups: groupId });
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
        status: 'PENDING'
      });
    }
    
    if (studentFees.length > 0) {
      await StudentFee.insertMany(studentFees);
    }

    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Users (excluding passwords)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('groups', 'name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Fees
const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find().populate('assignedToGroup', 'name').populate('feeType', 'name');
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Loans
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('user', 'name username').sort({ appliedAt: -1 });
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
    
    const loan = await Loan.findByIdAndUpdate(loanId, { status }, { new: true });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User (Edit Profile)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { scholarship, academicScore } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (scholarship !== undefined) {
       user.scholarship = scholarship === 'NONE' ? null : scholarship;
    }
    if (academicScore !== undefined) user.academicScore = academicScore;
    
    await user.save();
    
    // Note: In a full system, you might want to retroactively recalculate existing StudentFees here
    // But for this exercise, we'll assume it applies to future fee assignments or we keep it simple.
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Group Dashboard Data
const getGroupDashboardData = async (req, res) => {
  try {
    const { id } = req.params;
    
    const group = await Group.findById(id).populate('parentGroups', 'name');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    const users = await User.find({ groups: id }).select('-password').populate('scholarship', 'name');
    const fees = await Fee.find({ assignedToGroup: id }).populate('feeType', 'name');
    const payments = await Payment.find({ group: id });
    const studentFees = await StudentFee.find({ groupId: id }).populate({
      path: 'studentId',
      select: 'name username academicScore scholarship',
      populate: { path: 'scholarship', select: 'name' }
    });
    
    const totalAssignedValue = studentFees.reduce((sum, sf) => sum + sf.finalAmount, 0);
    
    const amountCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const amountPending = Math.max(0, totalAssignedValue - amountCollected);
    
    const allGroups = await Group.find().populate('parentGroups', 'name');
    
    // Aggregate ledger data for frontend table
    const ledgerByStudent = {};
    for (const sf of studentFees) {
      if (!sf.studentId) continue;
      const sId = sf.studentId._id.toString();
      if (!ledgerByStudent[sId]) {
        ledgerByStudent[sId] = {
          student: sf.studentId,
          baseTotal: 0,
          discountTotal: 0,
          netPayable: 0,
          status: 'PENDING'
        };
      }
      ledgerByStudent[sId].baseTotal += sf.baseAmount;
      ledgerByStudent[sId].discountTotal += sf.discountAmount;
      ledgerByStudent[sId].netPayable += sf.finalAmount;
    }
    
    const studentLedgers = Object.values(ledgerByStudent);
    
    res.json({
      group,
      allGroups,
      users, // raw users for other stats
      fees,
      studentLedgers, // formatted for the table
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
    const feeType = await FeeType.create({ name, description });
    res.status(201).json(feeType);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create fee type' });
  }
};

const getFeeTypes = async (req, res) => {
  try {
    const types = await FeeType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee types' });
  }
};

const deleteFeeType = async (req, res) => {
  try {
    await FeeType.findByIdAndDelete(req.params.id);
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
      name, description, discountPercentage, applicableFeeTypes, minAcademicScore
    });
    res.status(201).json(scholarship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find().populate('applicableFeeTypes', 'name');
    res.json(scholarships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteScholarship = async (req, res) => {
  try {
    await Scholarship.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scholarship deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bulkCreateUsers,
  createGroup,
  getGroups,
  assignFeeToGroup,
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
  deleteScholarship
};
