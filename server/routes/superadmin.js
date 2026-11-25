const express = require('express');
const router = express.Router();
const College = require('../models/College');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Settlement = require('../models/Settlement');
const { protect } = require('../middleware/authMiddleware');
const { populate, toPlain, isUUID } = require('../utils/populate');
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
    const [totalColleges, activeSubscriptions, totalStudents, totalRevenue] = await Promise.all([
      College.count(),
      College.count({ where: { subscriptionStatus: 'active' } }),
      User.count({ where: { role: 'user' } }),
      Payment.sum('amount', { where: { status: 'SUCCESS' } })
    ]);

    const totalRevenueProcessed = totalRevenue || 0;

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
    const colleges = await College.findAll({ order: [['createdAt', 'DESC']], raw: true });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific college details
router.get('/colleges/:id', async (req, res) => {
  try {
    if (!isUUID(req.params.id)) {
      return res.status(404).json({ message: 'College not found' });
    }
    const college = await College.findByPk(req.params.id, { raw: true });
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const admins = await User.findAll({
      where: { collegeId: college._id, role: 'admin' },
      attributes: { exclude: ['password'] },
      raw: true
    });
    const totalStudents = await User.count({ where: { collegeId: college._id, role: 'user' } });

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
    const { name, code, address, phone, email, administratorName, strength, subscriptionStatus } = req.body;

    const existingCollege = await College.findOne({ where: { code }, raw: true });
    if (existingCollege) {
      return res.status(400).json({ message: 'College code already exists' });
    }

    const college = await College.create({
      name, code, address, phone, email, administratorName, strength, subscriptionStatus
    });

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
    if (!isUUID(req.params.id)) {
      return res.status(404).json({ message: 'College not found' });
    }
    const { subscriptionStatus } = req.body;
    const college = await College.findByPk(req.params.id);

    if (college) {
      await college.update({ subscriptionStatus });
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
    if (!isUUID(req.params.id)) {
      return res.status(404).json({ message: 'College not found' });
    }
    const { aiAccess } = req.body;
    const college = await College.findByPk(req.params.id);

    if (college) {
      await college.update({ aiAccess });
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
    if (!isUUID(req.params.id)) {
      return res.status(404).json({ message: 'College not found' });
    }
    const college = await College.findByPk(req.params.id);
    if (college) {
      await college.update({ promptCount: 0, tokenCount: 0 });
      res.json(college);
    } else {
      res.status(404).json({ message: 'College not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all provisioned admins
router.get('/admins', async (req, res) => {
  try {
    const rawAdmins = await User.findAll({
      where: { role: 'admin' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      raw: true
    });
    const admins = await populate(rawAdmins, 'collegeId', College, ['name', 'code']);
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an Admin
router.delete('/admins/:id', async (req, res) => {
  try {
    if (!isUUID(req.params.id)) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    const admin = await User.findByPk(req.params.id);
    if (admin) {
      const username = admin.username;
      const collegeId = admin.collegeId;
      await admin.destroy();
      await AuditLog.create({
        action: 'DELETED_ADMIN',
        details: `Deleted admin account: ${username}`,
        performedBy: req.user._id,
        collegeId
      });
      res.json({ message: 'Admin deleted successfully' });
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create an Admin for a college
router.post('/admins', async (req, res) => {
  try {
    const { collegeId, name, username, password } = req.body;

    const existingUser = await User.findOne({ where: { username }, raw: true });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      username,
      password: hashedPassword,
      role: 'admin',
      collegeId,
      mustChangePassword: true
    });

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
    const rawLogs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50,
      raw: true
    });
    let logs = await populate(rawLogs, 'performedBy', User, ['name']);
    logs = await populate(logs, 'collegeId', College, ['name']);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Billing Overview - centralized vs decentralized payments per college
router.get('/billing-overview', async (req, res) => {
  try {
    const colleges = await College.findAll({ order: [['createdAt', 'DESC']], raw: true });

    const overviewData = await Promise.all(colleges.map(async (college) => {
      const isCentralized = (college.paymentType || 'CENTRALIZED') === 'CENTRALIZED';

      const allPayments = await Payment.findAll({
        where: {
          collegeId: college._id,
          status: 'SUCCESS'
        },
        raw: true
      });

      const onlinePayments = allPayments.filter(p => p.paymentMethod !== 'CASH');
      const cashPayments = allPayments.filter(p => p.paymentMethod === 'CASH');

      const onlineTotal = onlinePayments.reduce((sum, p) => sum + p.amount, 0);
      const cashTotal = cashPayments.reduce((sum, p) => sum + p.amount, 0);
      const total = onlineTotal + cashTotal;

      const platformAmount = isCentralized ? onlineTotal : 0;
      const ownGatewayAmount = !isCentralized ? onlineTotal : 0;

      const settlements = await Settlement.findAll({ where: { collegeId: college._id }, raw: true });
      const totalSettled = settlements.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + s.amount, 0);
      const pendingSettlement = settlements.filter(s => s.status === 'PENDING_ADMIN_CONFIRMATION').reduce((sum, s) => sum + s.amount, 0);

      return {
        _id: college._id,
        name: college.name,
        code: college.code,
        paymentType: college.paymentType || 'CENTRALIZED',
        subscriptionStatus: college.subscriptionStatus,
        totalCollected: total,
        platformAmount,
        totalSettled,
        pendingSettlement,
        balanceOwed: platformAmount - totalSettled - pendingSettlement,
        platformCount: isCentralized ? onlinePayments.length : 0,
        ownGatewayAmount,
        ownGatewayCount: !isCentralized ? onlinePayments.length : 0,
        cashAmount: cashTotal,
        cashCount: cashPayments.length,
        transactionCount: allPayments.length
      };
    }));

    const grandTotal = overviewData.reduce((sum, c) => sum + c.totalCollected, 0);
    const grandPlatform = overviewData.reduce((sum, c) => sum + c.platformAmount, 0);
    const grandOwnGateway = overviewData.reduce((sum, c) => sum + c.ownGatewayAmount, 0);
    const grandCash = overviewData.reduce((sum, c) => sum + c.cashAmount, 0);

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
