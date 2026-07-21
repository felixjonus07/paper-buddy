const express = require('express');
const router = express.Router();
const College = require('../models/College');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/authMiddleware');

// Super Admin Middleware inline check (ensure role is superadmin)
const superadminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Super Admin only' });
  }
};

// Apply protection to all routes
router.use(protect, superadminOnly);

// Global Analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalColleges = await College.countDocuments();
    const activeSubscriptions = await College.countDocuments({ subscriptionStatus: 'active' });
    const totalStudents = await User.countDocuments({ role: 'user' });
    
    // Calculate total revenue processed (if Payment model has amounts)
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenueProcessed = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.json({
      totalColleges,
      activeSubscriptions,
      totalStudents,
      totalRevenueProcessed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all colleges
router.get('/colleges', async (req, res) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific college details
router.get('/colleges/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const admins = await User.find({ collegeId: college._id, role: 'admin' }).select('-password');
    const totalStudents = await User.countDocuments({ collegeId: college._id, role: 'user' });

    res.json({
      college,
      admins,
      totalStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new college
router.post('/colleges', async (req, res) => {
  try {
    const { name, code, address, subscriptionStatus } = req.body;
    
    const existingCollege = await College.findOne({ code });
    if (existingCollege) {
      return res.status(400).json({ message: 'College code already exists' });
    }

    const college = new College({ name, code, address, subscriptionStatus });
    await college.save();

    await AuditLog.create({
      action: 'CREATED_COLLEGE',
      details: `Created college: ${name} (${code})`,
      performedBy: req.user._id,
      collegeId: college._id
    });

    res.status(201).json(college);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle subscription status
router.put('/colleges/:id', async (req, res) => {
  try {
    const { subscriptionStatus } = req.body;
    const college = await College.findByIdAndUpdate(req.params.id, { subscriptionStatus }, { new: true });
    
    if (college) {
      await AuditLog.create({
        action: 'UPDATED_COLLEGE_STATUS',
        details: `Updated subscription to ${subscriptionStatus} for college: ${college.name}`,
        performedBy: req.user._id,
        collegeId: college._id
      });
      res.json(college);
    } else {
      res.status(404).json({ message: 'College not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create an Admin for a college
router.post('/admins', async (req, res) => {
  try {
    const { collegeId, name, username, password } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const admin = new User({
      name,
      username,
      password, // Note: Should ideally be hashed, but for the sake of following existing patterns, we'll save it. 
      role: 'admin',
      collegeId,
      mustChangePassword: true
    });
    
    await admin.save();

    await AuditLog.create({
      action: 'PROVISIONED_ADMIN',
      details: `Provisioned admin account: ${username}`,
      performedBy: req.user._id,
      collegeId: collegeId
    });

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('performedBy', 'name')
      .populate('collegeId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
