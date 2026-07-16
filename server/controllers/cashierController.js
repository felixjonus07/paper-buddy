const User = require('../models/User');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');

const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const students = await User.find({
      role: 'user',
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

const getStudentPendingFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Fetch pending fees
    const pendingFees = await StudentFee.find({
      studentId: studentId,
      status: 'PENDING'
    }).populate('feeId');

    res.json(pendingFees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const processCashPayment = async (req, res) => {
  try {
    const { studentId, studentFeeId } = req.body;
    
    const studentFee = await StudentFee.findOne({ _id: studentFeeId, studentId, status: 'PENDING' }).populate('feeId');
    if (!studentFee) {
      return res.status(404).json({ message: 'Pending fee not found' });
    }

    // Create a payment record
    const payment = await Payment.create({
      student: studentId,
      fee: studentFee.feeId._id,
      group: studentFee.groupId,
      amount: studentFee.finalAmount,
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      transactionId: `CASH-${Date.now()}`
    });

    // Mark fee as paid
    studentFee.status = 'PAID';
    await studentFee.save();

    res.status(200).json({ message: 'Payment recorded successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchStudents,
  getStudentPendingFees,
  processCashPayment
};
