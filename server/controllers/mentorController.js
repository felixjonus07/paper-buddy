const Group = require('../models/Group');
const User = require('../models/User');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const { calculateDynamicFeeAmount } = require('../utils/feeUtils');

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
    
    const [group, allGroups] = await Promise.all([
      Group.findById(id).populate('parentGroups', 'name').lean(),
      Group.find().select('_id name parentGroups description').populate('parentGroups', 'name').lean()
    ]);

    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check access: user has the group directly, OR user has one of its parent groups
    const hasDirectAccess = req.user.groups.some(gId => gId.toString() === id);
    const hasParentAccess = group.parentGroups && group.parentGroups.some(parent => 
      req.user.groups.some(gId => gId.toString() === parent._id.toString())
    );
    
    if (!hasDirectAccess && !hasParentAccess && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to view this group' });
    }
    
    const users = await User.find({ groups: id }).select('-password').populate('scholarship', 'name').lean();
    
    const studentIds = users.map(u => u._id);
    let studentFeesQuery, paymentsQuery;
    
    if (group.isGlobal) {
      studentFeesQuery = StudentFee.find({ studentId: { $in: studentIds } });
      paymentsQuery = Payment.find({ user: { $in: studentIds } });
    } else {
      studentFeesQuery = StudentFee.find({ 
        $or: [
          { groupId: id },
          { studentId: { $in: studentIds }, groupId: null }
        ]
      });
      paymentsQuery = Payment.find({ 
        $or: [
          { group: id },
          { user: { $in: studentIds }, group: null }
        ]
      });
    }

    const [studentFeesRaw, payments] = await Promise.all([
      studentFeesQuery.populate({
        path: 'studentId',
        select: 'name username academicScore scholarship',
        populate: { path: 'scholarship', select: 'name' }
      }).populate('feeId').lean(),
      paymentsQuery.lean()
    ]);

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
      const sId = u._id.toString();
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
      const sId = (sf.studentId._id || sf.studentId).toString();
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
