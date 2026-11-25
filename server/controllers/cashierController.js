const { Op } = require('sequelize');
const User = require('../models/User');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const Fee = require('../models/Fee');
const FeeType = require('../models/FeeType');
const { calculateDynamicFeeAmount } = require('../utils/feeUtils');
const { populate, likeEscape, isUUID } = require('../utils/populate');

// Search students by name / username / register number (live search)
const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 1) return res.json([]);

    const pattern = `%${likeEscape(query.trim())}%`;
    const students = await User.findAll({
      where: {
        role: 'user',
        collegeId: req.user.collegeId,
        [Op.or]: [
          { name: { [Op.iLike]: pattern } },
          { username: { [Op.iLike]: pattern } },
          { registerNumber: { [Op.iLike]: pattern } }
        ]
      },
      attributes: { exclude: ['password'] },
      limit: 200,
      raw: true
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending (unpaid) fees for a student
const getStudentPendingFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isUUID(studentId)) return res.json([]);

    const rawFees = await StudentFee.findAll({
      where: {
        studentId: studentId,
        status: 'PENDING'
      },
      raw: true
    });
    const pendingFees = await populate(rawFees, 'feeId', Fee);

    const updatedPendingFees = pendingFees.map(sf => {
      sf.finalAmount = calculateDynamicFeeAmount(sf);
      return sf;
    });

    res.json(updatedPendingFees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get past payments for a student
const getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isUUID(studentId)) return res.json([]);

    const rawPayments = await Payment.findAll({
      where: {
        user: studentId,
        status: 'SUCCESS'
      },
      order: [['paidAt', 'DESC']],
      raw: true
    });

    let payments = await populate(rawPayments, 'user', User, ['name', 'username', 'registerNumber']);
    payments = await populate(payments, 'fee', Fee, ['title']);

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record a cash payment for a student fee
const processCashPayment = async (req, res) => {
  try {
    const { studentId, studentFeeId } = req.body;
    if (!isUUID(studentId) || !isUUID(studentFeeId)) {
      return res.status(404).json({ message: 'Pending fee not found' });
    }

    const studentFeeInstance = await StudentFee.findOne({
      where: { _id: studentFeeId, studentId, status: 'PENDING' }
    });
    if (!studentFeeInstance) {
      return res.status(404).json({ message: 'Pending fee not found' });
    }

    const populatedSf = await populate(studentFeeInstance, 'feeId', Fee);
    const dynamicFinalAmount = calculateDynamicFeeAmount(populatedSf);

    const payment = await Payment.create({
      user: studentId,
      fee: populatedSf.feeId._id,
      group: populatedSf.groupId,
      amount: dynamicFinalAmount,
      paymentMethod: 'CASH',
      status: 'SUCCESS',
      collegeId: req.user.collegeId,
      processedBy: req.user._id,
      paidAt: new Date()
    });

    studentFeeInstance.status = 'PAID';
    studentFeeInstance.finalAmount = dynamicFinalAmount;
    await studentFeeInstance.save();

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

    const rawPayments = await Payment.findAll({
      where: {
        collegeId: req.user.collegeId,
        paymentMethod: 'CASH',
        status: 'SUCCESS',
        paidAt: { [Op.gte]: startOfDay, [Op.lte]: endOfDay }
      },
      order: [['paidAt', 'DESC']],
      raw: true
    });

    let payments = await populate(rawPayments, 'user', User, ['name', 'username', 'registerNumber']);
    payments = await populate(payments, 'fee', Fee, ['title']);

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

    const rawPayments = await Payment.findAll({
      where: {
        collegeId: req.user.collegeId,
        status: 'SUCCESS',
        paidAt: { [Op.gte]: start, [Op.lte]: end }
      },
      order: [['paidAt', 'DESC']],
      raw: true
    });

    let payments = await populate(rawPayments, 'user', User, ['name', 'username', 'registerNumber']);
    payments = await populate(payments, 'fee', Fee, ['title']);

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
    if (!isUUID(studentId)) return res.status(404).json({ message: 'Student not found' });

    const student = await User.findOne({ where: { _id: studentId, collegeId: req.user.collegeId }, raw: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Create a one-off fee record for this college
    const fee = await Fee.create({
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
    const feeTypes = await FeeType.findAll({ where: { collegeId: req.user.collegeId }, raw: true });
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
