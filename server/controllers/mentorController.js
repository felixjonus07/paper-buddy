const Group = require('../models/Group');
const User = require('../models/User');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');

// Get assigned groups for mentor
const getMentorGroups = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('groups');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user.groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reusing the same logic from adminController for fetching group dashboard data,
// but ensuring the mentor actually has access to the requested group
const getGroupDashboardDataForMentor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check access
    const hasAccess = req.user.groups.some(gId => gId.toString() === id);
    if (!hasAccess && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this group' });
    }

    const group = await Group.findById(id).populate('parentGroups', 'name');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    const users = await User.find({ groups: id }).select('-password').populate('scholarship', 'name');
    
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
