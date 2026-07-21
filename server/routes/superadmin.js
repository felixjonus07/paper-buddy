const express = require('express');
const router = express.Router();
const College = require('../models/College');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Settlement = require('../models/Settlement');
const { protect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

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

// Toggle AI access for a college
router.put('/colleges/:id/ai-access', async (req, res) => {
  try {
    const { aiAccess } = req.body;
    const college = await College.findByIdAndUpdate(req.params.id, { aiAccess }, { new: true });
    
    if (college) {
      await AuditLog.create({
        action: 'UPDATED_AI_ACCESS',
        details: `AI access ${aiAccess ? 'enabled' : 'disabled'} for college: ${college.name}`,
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

// Reset prompt count for a college
router.put('/colleges/:id/reset-prompts', async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      { promptCount: 0, tokenCount: 0 },
      { new: true }
    );
    if (college) {
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new User({
      name,
      username,
      password: hashedPassword,
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

// Billing Overview — centralized vs decentralized payments per college
router.get('/billing-overview', async (req, res) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });

    const overviewData = await Promise.all(colleges.map(async (college) => {
      const isCentralized = (college.paymentType || 'CENTRALIZED') === 'CENTRALIZED';

      // All SUCCESS payments for this college
      const allPayments = await Payment.find({
        collegeId: college._id,
        status: 'SUCCESS'
      });

      const onlinePayments = allPayments.filter(p => p.paymentMethod !== 'CASH');
      const cashPayments = allPayments.filter(p => p.paymentMethod === 'CASH');

      const onlineTotal = onlinePayments.reduce((sum, p) => sum + p.amount, 0);
      const cashTotal = cashPayments.reduce((sum, p) => sum + p.amount, 0);
      const total = onlineTotal + cashTotal;

      // If CENTRALIZED college: online payments go to platform account
      // If DECENTRALIZED college: online payments go to college's own gateway account
      const platformAmount = isCentralized ? onlineTotal : 0;
      const ownGatewayAmount = !isCentralized ? onlineTotal : 0;

      // Settlement totals
      const settlements = await Settlement.find({ collegeId: college._id });
      const totalSettled = settlements.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + s.amount, 0);
      const pendingSettlement = settlements.filter(s => s.status === 'PENDING_ADMIN_CONFIRMATION').reduce((sum, s) => sum + s.amount, 0);

      return {
        _id: college._id,
        name: college.name,
        code: college.code,
        paymentType: college.paymentType || 'CENTRALIZED',
        subscriptionStatus: college.subscriptionStatus,
        totalCollected: total,
        // Money credited to PLATFORM account (centralized online)
        platformAmount,
        totalSettled,
        pendingSettlement,
        balanceOwed: platformAmount - totalSettled - pendingSettlement,
        platformCount: isCentralized ? onlinePayments.length : 0,
        // Money credited to COLLEGE's OWN gateway (decentralized online)
        ownGatewayAmount,
        ownGatewayCount: !isCentralized ? onlinePayments.length : 0,
        // Cash collected directly by college's cashiers
        cashAmount: cashTotal,
        cashCount: cashPayments.length,
        transactionCount: allPayments.length
      };
    }));

    const grandTotal = overviewData.reduce((sum, c) => sum + c.totalCollected, 0);
    const grandPlatform = overviewData.reduce((sum, c) => sum + c.platformAmount, 0);
    const grandOwnGateway = overviewData.reduce((sum, c) => sum + c.ownGatewayAmount, 0);
    const grandCash = overviewData.reduce((sum, c) => sum + c.cashAmount, 0);

    console.log('--- BILLING OVERVIEW DEBUG ---');
    console.log(JSON.stringify(overviewData, null, 2));

    res.json({
      colleges: overviewData,
      summary: {
        grandTotal,
        grandPlatform,
        grandOwnGateway,
        grandCash,
        totalColleges: colleges.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initiate a payout (Settlement) from Platform to College
router.post('/settlements', async (req, res) => {
  try {
    const { collegeId, amount, reference } = req.body;
    if (!collegeId || !amount) {
      return res.status(400).json({ message: 'collegeId and amount are required' });
    }

    const settlement = await Settlement.create({
      collegeId,
      amount,
      reference,
      status: 'PENDING_ADMIN_CONFIRMATION'
    });

    res.status(201).json(settlement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
