const User = require('../models/User');
const Group = require('../models/Group');
const Fee = require('../models/Fee');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const StudentFee = require('../models/StudentFee');
const FeeType = require('../models/FeeType');
const Scholarship = require('../models/Scholarship');
const FeeRequest = require('../models/FeeRequest');
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
        collegeId: req.user.collegeId,
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
    const { name, description, studentIds, isGlobal } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    // Create group
    const group = await Group.create({ 
      name, 
      description,
      isGlobal: isGlobal || false,
      collegeId: req.user.collegeId
    });

    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      await User.updateMany(
        { _id: { $in: studentIds }, collegeId: req.user.collegeId },
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

// Update Group
const updateGroup = async (req, res) => {
  try {
    const { name, description, isGlobal } = req.body;
    const group = await Group.findOne({ _id: req.params.id, collegeId: req.user.collegeId });
    if (!group) return res.status(404).json({ message: 'Group not found or unauthorized' });
    
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (isGlobal !== undefined) group.isGlobal = isGlobal;
    
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Mentor for a Group
const createGroupMentor = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, username, password } = req.body;

    const group = await Group.findOne({ _id: groupId, collegeId: req.user.collegeId });
    if (!group) return res.status(404).json({ message: 'Group not found or unauthorized' });

    const userExists = await User.findOne({ username });
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
    const groups = await Group.find({ collegeId: req.user.collegeId }).populate('parentGroups', 'name');
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
      const user = await User.findOne({ _id: id, collegeId: req.user.collegeId });
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

    const childGroup = await Group.findOne({ _id: childId, collegeId: req.user.collegeId });
    if (!childGroup) return res.status(404).json({ message: 'Child group not found or unauthorized' });

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

// Assign Fee to User
const assignFeeToUser = async (req, res) => {
  try {
    const { title, amount, feeType, userId, groupId } = req.body;
    
    if (!title || !amount || !feeType || !userId) {
       return res.status(400).json({ message: 'Title, amount, feeType, and userId are required' });
    }

    const user = await User.findOne({ _id: userId, collegeId: req.user.collegeId }).populate('scholarship');
    if (!user) return res.status(404).json({ message: 'User not found or unauthorized' });

    const fee = await Fee.create({
      title,
      amount,
      feeType,
      assignedToUser: userId,
      assignedToGroup: groupId || null,
      collegeId: req.user.collegeId
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
    const { title, amount, feeType, groupId } = req.body;
    
    if (!title || !amount || !feeType || !groupId) {
       return res.status(400).json({ message: 'Title, amount, feeType, and groupId are required' });
    }

    const group = await Group.findOne({ _id: groupId, collegeId: req.user.collegeId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const fee = await Fee.create({
      title,
      amount,
      feeType,
      assignedToGroup: groupId,
      collegeId: req.user.collegeId
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
        status: 'PENDING',
        collegeId: req.user.collegeId
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
    const users = await User.find({ collegeId: req.user.collegeId }).select('-password').populate('groups', 'name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Fees
const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find({ collegeId: req.user.collegeId }).populate('assignedToGroup', 'name').populate('feeType', 'name');
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
    
    const user = await User.findOne({ _id: id, collegeId: req.user.collegeId });
    if (!user) return res.status(404).json({ message: 'User not found or unauthorized' });
    
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
    
    const group = await Group.findOne({ _id: id, collegeId: req.user.collegeId }).populate('parentGroups', 'name');
    if (!group) return res.status(404).json({ message: 'Group not found or unauthorized' });
    
    const users = await User.find({ groups: id }).select('-password').populate('scholarship', 'name');
    const fees = await Fee.find({ assignedToGroup: id }).populate('feeType', 'name');
    
    let payments, studentFees;
    
    if (group.isGlobal) {
      const studentIds = users.map(u => u._id);
      studentFees = await StudentFee.find({ studentId: { $in: studentIds } }).populate({
        path: 'studentId',
        select: 'name username academicScore scholarship',
        populate: { path: 'scholarship', select: 'name' }
      });
      payments = await Payment.find({ user: { $in: studentIds } });
    } else {
      studentFees = await StudentFee.find({ groupId: id }).populate({
        path: 'studentId',
        select: 'name username academicScore scholarship',
        populate: { path: 'scholarship', select: 'name' }
      });
      payments = await Payment.find({ group: id });
    }
    
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
          amountPaid: 0,
          amountPending: 0,
          status: 'PENDING'
        };
      }
      ledgerByStudent[sId].baseTotal += sf.baseAmount;
      ledgerByStudent[sId].discountTotal += sf.discountAmount;
      ledgerByStudent[sId].netPayable += sf.finalAmount;
    }

    // Add payments
    for (const p of payments) {
      if (!p.user) continue;
      const sId = p.user.toString();
      if (ledgerByStudent[sId]) {
        ledgerByStudent[sId].amountPaid += p.amount;
      }
    }

    // Calculate outstanding and status
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
    const feeType = await FeeType.create({ name, description, collegeId: req.user.collegeId });
    res.status(201).json(feeType);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create fee type' });
  }
};

const getFeeTypes = async (req, res) => {
  try {
    const types = await FeeType.find({ collegeId: req.user.collegeId });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee types' });
  }
};

const deleteFeeType = async (req, res) => {
  try {
    await FeeType.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
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
    const scholarships = await Scholarship.find({ collegeId: req.user.collegeId }).populate('applicableFeeTypes', 'name');
    res.json(scholarships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteScholarship = async (req, res) => {
  try {
    await Scholarship.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
    res.json({ message: 'Scholarship deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Fee
const deleteFee = async (req, res) => {
  try {
    const feeId = req.params.id;

    const fee = await Fee.findOne({ _id: feeId, collegeId: req.user.collegeId });
    if (!fee) return res.status(404).json({ message: 'Fee not found or unauthorized' });

    const paidStudentFees = await StudentFee.find({ feeId, status: 'PAID' });
    if (paidStudentFees.length > 0) {
      return res.status(400).json({ message: 'Cannot delete fee because one or more students have already paid this fee.' });
    }

    await StudentFee.deleteMany({ feeId });
    await Fee.findByIdAndDelete(feeId);

    res.json({ message: 'Fee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeeRequests = async (req, res) => {
  try {
    const requests = await FeeRequest.find({ collegeId: req.user.collegeId })
      .populate('studentId', 'name username registerNumber studentClass section year')
      .populate('feeType', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFeeRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await FeeRequest.findOne({ _id: req.params.id, collegeId: req.user.collegeId });
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
    
    // Default to viewing current college if admin, or requested college if superadmin
    let targetCollegeId = null;
    if (req.user.role === 'admin' || req.user.role === 'cashier' || req.user.role === 'mentor') {
      targetCollegeId = req.user.collegeId;
    } else if (req.user.role === 'superadmin' && collegeId) {
      targetCollegeId = collegeId;
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide both startDate and endDate' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Using aggregation to filter payments by the user's college
    const pipeline = [
      {
        $match: {
          paidAt: { $gte: start, $lte: end },
          status: 'SUCCESS'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' }
    ];

    if (targetCollegeId) {
      const mongoose = require('mongoose');
      pipeline.push({
        $match: {
          'userDetails.collegeId': new mongoose.Types.ObjectId(targetCollegeId)
        }
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'fees',
          localField: 'fee',
          foreignField: '_id',
          as: 'feeDetails'
        }
      },
      {
        $unwind: {
          path: '$feeDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          amount: 1,
          status: 1,
          paymentMethod: 1,
          paidAt: 1,
          'userDetails.name': 1,
          'userDetails.registerNumber': 1,
          'feeDetails.title': 1
        }
      },
      {
        $sort: { paidAt: -1 }
      }
    );

    const Payment = require('../models/Payment');
    const payments = await Payment.aggregate(pipeline);
    
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
    const College = require('../models/College');
    const college = await College.findById(req.user.collegeId);
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
    
    // Only Admin (or SuperAdmin acting as Admin) can change this
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can update payment settings' });
    }

    const College = require('../models/College');
    const collegeId = req.user.collegeId || req.body.collegeId;

    if (!collegeId) {
      return res.status(400).json({ message: 'College ID not found' });
    }

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    college.paymentType = paymentType;
    if (paymentType === 'DECENTRALIZED' && paymentCredentials) {
      college.paymentCredentials = {
        merchantId: paymentCredentials.merchantId,
        saltIndex: paymentCredentials.saltIndex || 1,
        env: paymentCredentials.env || 'SANDBOX'
      };
      // Only update saltKey if it's provided and not the dummy mask
      if (paymentCredentials.saltKey && paymentCredentials.saltKey !== '********') {
        college.paymentCredentials.saltKey = encrypt(paymentCredentials.saltKey);
      } else {
        // preserve old salt key
        const oldCollege = await College.findById(req.user.collegeId);
        if (oldCollege && oldCollege.paymentCredentials && oldCollege.paymentCredentials.saltKey) {
          college.paymentCredentials.saltKey = oldCollege.paymentCredentials.saltKey;
        }
      }
    }

    await college.save();
    res.json({ message: 'Payment settings updated successfully', paymentType: college.paymentType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bulkCreateUsers,
  createGroup,
  updateGroup,
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
  getPaymentSettings
};
