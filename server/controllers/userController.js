const Fee = require('../models/Fee');
const User = require('../models/User');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const FeeRequest = require('../models/FeeRequest');
const FeeType = require('../models/FeeType');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const getMyFees = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('groups');
    const groupIds = user.groups.map(g => g._id);

    // Get fees assigned to the user directly, or assigned to any of their groups
    const fees = await Fee.find({
      $or: [
        { assignedToUser: req.user._id },
        { assignedToGroup: { $in: groupIds } }
      ]
    }).populate('assignedToGroup', 'name');

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('groups')
      .populate('scholarship');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { phoneNumber, studentClass, section, year, personalEmail, collegeEmail, registerNumber } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (studentClass !== undefined) user.studentClass = studentClass;
    if (section !== undefined) user.section = section;
    if (year !== undefined) user.year = year;
    if (personalEmail !== undefined) user.personalEmail = personalEmail;
    if (collegeEmail !== undefined) user.collegeEmail = collegeEmail;
    if (registerNumber !== undefined) user.registerNumber = registerNumber;
    
    await user.save();
    
    // Return populated user
    const updatedUser = await User.findById(req.user._id).populate('groups').populate('scholarship');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentFees = async (req, res) => {
  try {
    const studentFees = await StudentFee.find({ studentId: req.user._id })
      .populate('feeId')
      .sort({ createdAt: -1 });
    res.json(studentFees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const payFee = async (req, res) => {
  try {
    const studentFeeId = req.params.id;
    const studentFee = await StudentFee.findOne({ _id: studentFeeId, studentId: req.user._id });

    if (!studentFee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    
    if (studentFee.status === 'PAID') {
      return res.status(400).json({ message: 'Fee is already paid' });
    }

    studentFee.status = 'PAID';
    await studentFee.save();

    const payment = new Payment({
      user: req.user._id,
      group: studentFee.groupId,
      fee: studentFee.feeId,
      amount: studentFee.finalAmount
    });
    await payment.save();

    res.json({ message: 'Fee paid successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const payNewFee = async (req, res) => {
  try {
    const feeId = req.params.id;
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ message: 'Fee not found' });

    const user = await User.findById(req.user._id);
    const isAssigned = fee.assignedToUser?.toString() === user._id.toString() || 
                       user.groups.some(g => g.toString() === fee.assignedToGroup?.toString());
    
    if (!isAssigned) return res.status(403).json({ message: 'Not authorized for this fee' });

    let studentFee = await StudentFee.findOne({ feeId: fee._id, studentId: user._id });
    if (studentFee && studentFee.status === 'PAID') {
      return res.status(400).json({ message: 'Fee is already paid' });
    }

    if (!studentFee) {
      studentFee = new StudentFee({
        studentId: user._id,
        groupId: fee.assignedToGroup || null,
        feeId: fee._id,
        baseAmount: fee.amount,
        discountAmount: 0,
        finalAmount: fee.amount,
        status: 'PAID'
      });
    } else {
      studentFee.status = 'PAID';
    }
    
    await studentFee.save();

    const payment = new Payment({
      user: req.user._id,
      group: fee.assignedToGroup || null,
      fee: fee._id,
      amount: studentFee.finalAmount
    });
    await payment.save();

    res.json({ message: 'Fee paid successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

const createPaymentOrder = async (req, res) => {
  try {
    const { id, isMissing } = req.body;
    let amountToPay = 0;
    
    if (isMissing) {
      const fee = await Fee.findById(id);
      if (!fee) return res.status(404).json({ message: 'Fee not found' });
      amountToPay = fee.amount;
    } else {
      const studentFee = await StudentFee.findById(id);
      if (!studentFee) return res.status(404).json({ message: 'Fee record not found' });
      if (studentFee.status === 'PAID') return res.status(400).json({ message: 'Already paid' });
      amountToPay = studentFee.finalAmount;
    }

    const options = {
      amount: Math.round(amountToPay * 100),
      currency: 'INR',
      receipt: `rcpt_${id.substring(0, 10)}_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ order_id: order.id, amount: options.amount, currency: options.currency, key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, id, isMissing } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    let paymentAmount = 0;
    let groupId = null;
    let feeId = null;

    if (isMissing) {
      const fee = await Fee.findById(id);
      paymentAmount = fee.amount;
      feeId = fee._id;
      groupId = fee.assignedToGroup || null;
      
      const studentFee = new StudentFee({
        studentId: req.user._id,
        groupId,
        feeId,
        baseAmount: fee.amount,
        discountAmount: 0,
        finalAmount: fee.amount,
        status: 'PAID'
      });
      await studentFee.save();
    } else {
      const studentFee = await StudentFee.findById(id);
      studentFee.status = 'PAID';
      await studentFee.save();
      
      paymentAmount = studentFee.finalAmount;
      feeId = studentFee.feeId;
      groupId = studentFee.groupId;
    }

    const payment = new Payment({
      user: req.user._id,
      group: groupId,
      fee: feeId,
      amount: paymentAmount
    });
    await payment.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createFeeRequest = async (req, res) => {
  try {
    const { requestedFeeTitle, reason, amount, feeType } = req.body;
    if (!requestedFeeTitle || !amount || !feeType) {
      return res.status(400).json({ message: 'Fee title, amount, and fee type are required' });
    }
    const request = new FeeRequest({
      studentId: req.user._id,
      requestedFeeTitle,
      amount,
      feeType,
      reason
    });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyFeeRequests = async (req, res) => {
  try {
    const requests = await FeeRequest.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFeeTypes = async (req, res) => {
  try {
    const feeTypes = await FeeType.find();
    res.json(feeTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyFees, getProfile, getStudentFees, payFee, payNewFee, createPaymentOrder, verifyPayment, updateProfile, createFeeRequest, getMyFeeRequests, getFeeTypes };
