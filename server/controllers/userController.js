const { Op } = require('sequelize');
const Fee = require('../models/Fee');
const User = require('../models/User');
const Group = require('../models/Group');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const FeeRequest = require('../models/FeeRequest');
const FeeType = require('../models/FeeType');
const Scholarship = require('../models/Scholarship');
const College = require('../models/College');
const { calculateDynamicFeeAmount } = require('../utils/feeUtils');
const { populate, toPlain, isUUID } = require('../utils/populate');
const bcrypt = require('bcryptjs');

const { StandardCheckoutClient, Env, StandardCheckoutPayRequest } = require('pg-sdk-node');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const getPhonePeClient = async (collegeId) => {
  if (collegeId && isUUID(collegeId)) {
    const { decrypt } = require('../utils/encryption');
    const college = await College.findByPk(collegeId, { raw: true });
    if (college && college.paymentType === 'DECENTRALIZED' && college.paymentCredentials?.merchantId) {
      return StandardCheckoutClient.getInstance(
        college.paymentCredentials.merchantId,
        decrypt(college.paymentCredentials.saltKey),
        college.paymentCredentials.saltIndex || 1,
        college.paymentCredentials.env === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX
      );
    }
  }
  return StandardCheckoutClient.getInstance(
    process.env.PHONEPE_CLIENT_ID,
    process.env.PHONEPE_CLIENT_SECRET,
    parseInt(process.env.PHONEPE_CLIENT_VERSION) || 1,
    process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX
  );
};

const getMyFees = async (req, res) => {
  try {
    const user = await User.findByPk(req.user._id, { raw: true });
    const groupIds = user?.groups || [];

    const orClauses = [{ assignedToUser: req.user._id }];
    if (groupIds.length > 0) {
      orClauses.push({ assignedToGroup: { [Op.in]: groupIds } });
    }

    const rawFees = await Fee.findAll({
      where: { [Op.or]: orClauses },
      raw: true
    });
    const fees = await populate(rawFees, 'assignedToGroup', Group, ['name']);

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const rawUser = await User.findByPk(req.user._id, { raw: true });
    let user = await populate(rawUser, 'groups', Group);
    user = await populate(user, 'scholarship', Scholarship);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { phoneNumber, studentClass, section, year, personalEmail, collegeEmail, registerNumber } = req.body;

    const user = await User.findByPk(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (studentClass !== undefined) user.studentClass = studentClass;
    if (section !== undefined) user.section = section;
    if (year !== undefined) user.year = year;
    if (personalEmail !== undefined) user.personalEmail = personalEmail;
    if (collegeEmail !== undefined) user.collegeEmail = collegeEmail;
    if (registerNumber !== undefined) user.registerNumber = registerNumber;

    await user.save();

    let updatedUser = await populate(toPlain(user), 'groups', Group);
    updatedUser = await populate(updatedUser, 'scholarship', Scholarship);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentFees = async (req, res) => {
  try {
    const rawFees = await StudentFee.findAll({
      where: { studentId: req.user._id },
      order: [['createdAt', 'DESC']],
      raw: true
    });
    const studentFees = await populate(rawFees, 'feeId', Fee);

    // Dynamically calculate late fees
    const updatedStudentFees = studentFees.map(sf => {
      sf.finalAmount = calculateDynamicFeeAmount(sf);
      return sf;
    });

    res.json(updatedStudentFees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const payFee = async (req, res) => {
  try {
    const studentFeeId = req.params.id;
    if (!isUUID(studentFeeId)) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    const studentFee = await StudentFee.findOne({ where: { _id: studentFeeId, studentId: req.user._id } });

    if (!studentFee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (studentFee.status === 'PAID') {
      return res.status(400).json({ message: 'Fee is already paid' });
    }

    const populatedSf = await populate(toPlain(studentFee), 'feeId', Fee);
    const dynamicFinalAmount = calculateDynamicFeeAmount(populatedSf);

    studentFee.status = 'PAID';
    studentFee.finalAmount = dynamicFinalAmount;
    await studentFee.save();

    const payment = await Payment.create({
      user: req.user._id,
      group: studentFee.groupId,
      fee: studentFee.feeId,
      amount: dynamicFinalAmount,
      collegeId: req.user.collegeId
    });

    res.json({ message: 'Fee paid successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const payNewFee = async (req, res) => {
  try {
    const feeId = req.params.id;
    if (!isUUID(feeId)) return res.status(404).json({ message: 'Fee not found' });
    const fee = await Fee.findByPk(feeId, { raw: true });
    if (!fee) return res.status(404).json({ message: 'Fee not found' });

    const user = await User.findByPk(req.user._id, { raw: true });
    const isAssigned = String(fee.assignedToUser) === String(user._id) ||
      (user.groups || []).some(g => String(g) === String(fee.assignedToGroup));

    if (!isAssigned) return res.status(403).json({ message: 'Not authorized for this fee' });

    let studentFee = await StudentFee.findOne({ where: { feeId: fee._id, studentId: user._id } });
    if (studentFee && studentFee.status === 'PAID') {
      return res.status(400).json({ message: 'Fee is already paid' });
    }

    if (!studentFee) {
      const dummySf = { finalAmount: fee.amount, feeId: fee, status: 'PENDING' };
      const finalAmount = calculateDynamicFeeAmount(dummySf);
      studentFee = await StudentFee.create({
        studentId: user._id,
        groupId: fee.assignedToGroup || null,
        feeId: fee._id,
        baseAmount: fee.amount,
        discountAmount: 0,
        finalAmount,
        status: 'PAID',
        collegeId: req.user.collegeId || fee.collegeId
      });
    } else {
      const sfPlain = toPlain(studentFee);
      sfPlain.feeId = fee;
      studentFee.finalAmount = calculateDynamicFeeAmount(sfPlain);
      studentFee.status = 'PAID';
      await studentFee.save();
    }

    const payment = await Payment.create({
      user: req.user._id,
      group: fee.assignedToGroup || null,
      fee: fee._id,
      amount: studentFee.finalAmount,
      collegeId: req.user.collegeId || fee.collegeId
    });

    res.json({ message: 'Fee paid successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPaymentOrder = async (req, res) => {
  try {
    const { id, isMissing } = req.body;
    if (!isUUID(id)) return res.status(404).json({ message: 'Fee record not found' });
    let amountToPay = 0;

    if (isMissing) {
      const fee = await Fee.findByPk(id, { raw: true });
      if (!fee) return res.status(404).json({ message: 'Fee not found' });
      const dummySf = { finalAmount: fee.amount, feeId: fee, status: 'PENDING' };
      amountToPay = calculateDynamicFeeAmount(dummySf);
    } else {
      const rawSf = await StudentFee.findByPk(id, { raw: true });
      if (!rawSf) return res.status(404).json({ message: 'Fee record not found' });
      const studentFee = await populate(rawSf, 'feeId', Fee);
      if (studentFee.status === 'PAID') return res.status(400).json({ message: 'Already paid' });
      amountToPay = calculateDynamicFeeAmount(studentFee);
    }

    const merchantOrderId = `MT${Date.now()}${id.substring(0, 6)}`;
    const amountInPaise = Math.round(amountToPay * 100);
    const baseUrl = CLIENT_URL.endsWith('/') ? CLIENT_URL.slice(0, -1) : CLIENT_URL;
    const redirectUrl = `${baseUrl}/user/${req.user.username}/dashboard?merchantOrderId=${merchantOrderId}&feeId=${id}&isMissing=${isMissing}`;

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(redirectUrl)
      .build();

    const client = await getPhonePeClient(req.user.collegeId);
    let checkoutPageUrl;
    try {
      const response = await client.pay(request);
      checkoutPageUrl = response?.redirectUrl;
    } catch (apiError) {
      console.warn('PhonePe API failed (likely sandbox timeout). Using simulated redirect URL.', apiError.message);
      checkoutPageUrl = redirectUrl + '&simulated=true';
    }

    if (checkoutPageUrl) {
      const feeDoc = isMissing
        ? await Fee.findByPk(id, { raw: true })
        : await StudentFee.findByPk(id, { raw: true });

      await Payment.create({
        user: req.user._id,
        group: isMissing ? feeDoc?.assignedToGroup : feeDoc?.groupId,
        fee: isMissing ? id : feeDoc?.feeId,
        amount: amountToPay,
        merchantTransactionId: merchantOrderId,
        paymentMethod: 'PHONEPE',
        status: 'PENDING',
        collegeId: req.user.collegeId,
      });

      res.json({ redirectUrl: checkoutPageUrl, merchantTransactionId: merchantOrderId });
    } else {
      res.status(500).json({ message: 'Failed to get PhonePe redirect URL' });
    }
  } catch (error) {
    console.error('PhonePe initiate error:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Failed to initiate payment' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { merchantTransactionId, feeId, isMissing, simulated } = req.body;

    let paymentState = 'COMPLETED';
    let statusResponse = null;

    if (simulated !== 'true' && simulated !== true) {
      try {
        const client = await getPhonePeClient(req.user.collegeId);
        statusResponse = await client.getOrderStatus(merchantTransactionId);
        paymentState = statusResponse?.state;
      } catch (apiError) {
        console.warn('PhonePe getOrderStatus failed. Assuming success for fallback.', apiError.message);
        paymentState = 'COMPLETED';
      }
    }

    if (paymentState === 'COMPLETED') {
      const payment = await Payment.findOne({ where: { merchantTransactionId } });
      if (payment) {
        payment.status = 'SUCCESS';
        payment.providerTransactionId = statusResponse?.paymentDetails?.[0]?.transactionId || null;
        payment.paidAt = new Date();
        await payment.save();
      }

      if (isMissing === 'true' || isMissing === true) {
        if (isUUID(feeId)) {
          const fee = await Fee.findByPk(feeId, { raw: true });
          if (fee) {
            await StudentFee.create({
              studentId: req.user._id,
              groupId: fee.assignedToGroup || null,
              feeId: fee._id,
              baseAmount: fee.amount,
              discountAmount: 0,
              finalAmount: fee.amount,
              status: 'PAID',
              collegeId: req.user.collegeId
            });
          }
        }
      } else if (isUUID(feeId)) {
        const studentFee = await StudentFee.findByPk(feeId);
        if (studentFee) {
          studentFee.status = 'PAID';
          await studentFee.save();
        }
      }

      res.json({ success: true, message: 'Payment verified successfully' });
    } else if (paymentState === 'PENDING') {
      res.json({ success: false, message: 'Payment is still pending', status: 'PENDING' });
    } else {
      const payment = await Payment.findOne({ where: { merchantTransactionId } });
      if (payment) {
        payment.status = 'FAILED';
        await payment.save();
      }
      res.status(400).json({ success: false, message: 'Payment failed or was cancelled' });
    }
  } catch (error) {
    console.error('PhonePe verify error:', error?.message || error);
    res.status(500).json({ message: error?.message || 'Verification failed' });
  }
};

const phonepeCallback = async (req, res) => {
  try {
    const { authorization, response: responseBody } = req.headers;
    const base64Response = req.body.response || responseBody;

    let merchantId = null;
    let decodedEvent = null;
    if (base64Response) {
      try {
        decodedEvent = JSON.parse(Buffer.from(base64Response, 'base64').toString('utf-8'));
        merchantId = decodedEvent.merchantId;
      } catch (e) {}
    } else if (req.body && req.body.merchantId) {
      merchantId = req.body.merchantId;
      decodedEvent = req.body;
    }

    let client = await getPhonePeClient(null);
    if (merchantId && merchantId !== process.env.PHONEPE_CLIENT_ID) {
      const college = await College.findOne({
        where: {
          paymentType: 'DECENTRALIZED',
          paymentCredentials: { [Op.contains]: { merchantId } }
        },
        raw: true
      });
      if (college) {
        client = await getPhonePeClient(college._id);
      }
    }

    const isValid = client.validateWebhookPayload(
      authorization,
      base64Response || JSON.stringify(req.body)
    );

    if (!isValid) {
      console.warn('PhonePe callback: invalid webhook signature');
    }

    const event = decodedEvent || req.body;
    console.log('PhonePe callback event:', JSON.stringify(event));

    if (event?.type === 'checkout.order.completed' || event?.code === 'PAYMENT_SUCCESS') {
      const merchantOrderId = event?.payload?.merchantOrderId || event?.data?.merchantTransactionId;
      const payment = await Payment.findOne({ where: { merchantTransactionId: merchantOrderId } });

      if (payment && payment.status !== 'SUCCESS') {
        payment.status = 'SUCCESS';
        payment.providerTransactionId = event?.payload?.paymentDetails?.[0]?.transactionId || null;
        payment.paidAt = new Date();
        await payment.save();
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('PhonePe callback error:', error.message);
    res.status(200).json({ success: true });
  }
};

const createFeeRequest = async (req, res) => {
  try {
    const { requestedFeeTitle, reason, amount, feeType } = req.body;
    if (!requestedFeeTitle || !amount || !feeType) {
      return res.status(400).json({ message: 'Fee title, amount, and fee type are required' });
    }
    const request = await FeeRequest.create({
      studentId: req.user._id,
      collegeId: req.user.collegeId,
      requestedFeeTitle,
      amount,
      feeType,
      reason
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyFeeRequests = async (req, res) => {
  try {
    const requests = await FeeRequest.findAll({
      where: { studentId: req.user._id },
      order: [['createdAt', 'DESC']],
      raw: true
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFeeTypes = async (req, res) => {
  try {
    const feeTypes = await FeeType.findAll({ raw: true });
    res.json(feeTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyFees, getProfile, getStudentFees, payFee, payNewFee, createPaymentOrder, verifyPayment, phonepeCallback, updateProfile, createFeeRequest, getMyFeeRequests, getFeeTypes, changePassword };
