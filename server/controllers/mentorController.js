const { Op } = require('sequelize');
const Group = require('../models/Group');
const User = require('../models/User');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const Fee = require('../models/Fee');
const Scholarship = require('../models/Scholarship');
const { calculateDynamicFeeAmount } = require('../utils/feeUtils');
const { populate, toPlain, isUUID } = require('../utils/populate');

// Get assigned groups for mentor
const getMentorGroups = async (req, res) => {
  try {
    const rawUser = await User.findByPk(req.user._id);
    if (!rawUser) return res.status(404).json({ message: 'User not found' });
    const user = await populate(toPlain(rawUser), 'groups', Group);
    res.json(user.groups || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reusing the same logic from adminController for fetching group dashboard data,
// but ensuring the mentor actually has access to the requested group
const getGroupDashboardDataForMentor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUUID(id)) return res.status(404).json({ message: 'Group not found' });

    const [rawGroup, rawAllGroups] = await Promise.all([
      Group.findByPk(id, { raw: true }),
      Group.findAll({ attributes: ['_id', 'name', 'parentGroups', 'description'], raw: true })
    ]);

    if (!rawGroup) return res.status(404).json({ message: 'Group not found' });

    const [group, allGroups] = await Promise.all([
      populate(rawGroup, 'parentGroups', Group, ['name']),
      populate(rawAllGroups, 'parentGroups', Group, ['name'])
    ]);

    // Check access: user has the group directly, OR user has one of its parent groups
    const userGroups = req.user.groups || [];
    const hasDirectAccess = userGroups.some(gId => String(gId) === String(id));
    const hasParentAccess = group.parentGroups && group.parentGroups.some(parent =>
      userGroups.some(gId => String(gId) === String(parent._id))
    );

    if (!hasDirectAccess && !hasParentAccess && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to view this group' });
    }

    const rawUsers = await User.findAll({
      where: { groups: { [Op.contains]: [id] } },
      attributes: { exclude: ['password'] },
      raw: true
    });
    const users = await populate(rawUsers, 'scholarship', Scholarship, ['name']);

    const studentIds = users.map(u => u._id);
    let studentFeeWhere, paymentWhere;

    if (group.isGlobal) {
      studentFeeWhere = { studentId: { [Op.in]: studentIds } };
      paymentWhere = { user: { [Op.in]: studentIds } };
    } else {
      studentFeeWhere = {
        [Op.or]: [
          { groupId: id },
          { studentId: { [Op.in]: studentIds }, groupId: null }
        ]
      };
      paymentWhere = {
        [Op.or]: [
          { group: id },
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

    let studentFees = studentFeesRaw.map(sf => {
      sf.finalAmount = calculateDynamicFeeAmount(sf);
      return sf;
    });

    const totalAssignedValue = studentFees.reduce((sum, sf) => sum + sf.finalAmount, 0);
    const amountCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const amountPending = Math.max(0, totalAssignedValue - amountCollected);

    // Aggregate ledger data for frontend table
    const ledgerByStudent = {};

    // Initialize ledger for all users in the group so they always appear in the table
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

    // Add payments
    for (const p of payments) {
      if (!p.user) continue;
      const sId = String(p.user);
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
      users,
      studentLedgers,
      totalAssignedValue,
      amountCollected,
      amountPending
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMentorGroups,
  getGroupDashboardDataForMentor
};
