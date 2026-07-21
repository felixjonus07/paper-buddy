const User = require('../models/User');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const Fee = require('../models/Fee');
const FeeType = require('../models/FeeType');

// Search students by name / username / register number (live search)
const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 1) return res.json([]);

    const students = await User.find({
      role: 'user',
      collegeId: req.user.collegeId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { registerNumber: { $regex: query, $options: 'i' } }
      ]
    }).select('-password').limit(10);

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending (unpaid) fees for a student
const getStudentPendingFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const pendingFees = await StudentFee.find({
      studentId: studentId,
      status: 'PENDING'
    }).populate('feeId');

    res.json(pendingFees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get past payments for a student
const getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const payments = await Payment.find({
      user: studentId,
      status: 'SUCCESS'
    })
      .populate('user', 'name username registerNumber')
      .populate('fee', 'title')
      .sort({ paidAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record a cash payment for a student fee
const processCashPayment = async (req, res) => {
  try {
    const { studentId, studentFeeId } = req.body;

    const studentFee = await StudentFee.findOne({ _id: studentFeeId, studentId, status: 'PENDING' }).populate('feeId');
    if (!studentFee) {
      return res.status(404).json({ message: 'Pending fee not found' });
    }

    const payment = await Payment.create({
      user: studentId,
      fee: studentFee.feeId._id,
      group: studentFee.groupId,
      amount: studentFee.finalAmount,
      paymentMethod: 'CASH',
      status: 'SUCCESS',
      collegeId: req.user.collegeId,
      paidAt: new Date()
    });

    studentFee.status = 'PAID';
    await studentFee.save();

    res.status(200).json({ message: 'Payment recorded successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get today's payment log for the cashier
const getTodayLog = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      collegeId: req.user.collegeId,
      paymentMethod: 'CASH',
      status: 'SUCCESS',
      paidAt: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('user', 'name username registerNumber')
      .populate('fee', 'title')
      .sort({ paidAt: -1 });

    const totalToday = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({ payments, totalToday });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get report data for a date range (used for monthly/quarterly/yearly etc.)
const getReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      collegeId: req.user.collegeId,
      status: 'SUCCESS',
      paidAt: { $gte: start, $lte: end }
    })
      .populate('user', 'name username registerNumber')
      .populate('fee', 'title')
      .sort({ paidAt: -1 });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({ payments, total, count: payments.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manually assign a fee to a student (from cashier screen)
const addFeeToStudent = async (req, res) => {
  try {
    const { studentId, title, amount, feeType } = req.body;
    if (!studentId || !title || !amount || !feeType) {
      return res.status(400).json({ message: 'studentId, title, amount and feeType are required' });
    }

    const student = await User.findOne({ _id: studentId, collegeId: req.user.collegeId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Create a one-off fee record for this college
    let fee = await Fee.create({
      title,
      amount: parseFloat(amount),
      collegeId: req.user.collegeId,
      feeType: feeType,
      assignedToUser: studentId,
    });

    // Create the student fee assignment
    const studentFee = await StudentFee.create({
      studentId,
      feeId: fee._id,
      collegeId: req.user.collegeId,
      baseAmount: parseFloat(amount),
      discountAmount: 0,
      finalAmount: parseFloat(amount),
      status: 'PENDING'
    });

    res.status(201).json({ message: 'Fee added successfully', studentFee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all fee types for the college
const getFeeTypes = async (req, res) => {
  try {
    const feeTypes = await FeeType.find({ collegeId: req.user.collegeId });
    res.json(feeTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchStudents,
  getStudentPendingFees,
  getStudentPayments,
  processCashPayment,
  getTodayLog,
  getReport,
  addFeeToStudent,
  getFeeTypes
};
