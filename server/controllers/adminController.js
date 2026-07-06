const User = require('../models/User');
const Group = require('../models/Group');
const Fee = require('../models/Fee');
const Loan = require('../models/Loan');
const bcrypt = require('bcryptjs');

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
    const { name, description } = req.body;
    const group = await Group.create({ name, description });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Groups
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign Fee to Group
const assignFeeToGroup = async (req, res) => {
  try {
    const { title, amount, groupId } = req.body;
    
    if (!title || !amount || !groupId) {
       return res.status(400).json({ message: 'Title, amount, and groupId are required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const fee = await Fee.create({
      title,
      amount,
      assignedToGroup: groupId
    });

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
    const fees = await Fee.find().populate('assignedToGroup', 'name').populate('assignedToUser', 'name');
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

module.exports = {
  bulkCreateUsers,
  createGroup,
  getGroups,
  assignFeeToGroup,
  getUsers,
  getAllFees,
  getLoans,
  updateLoanStatus
};
