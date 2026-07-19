const Fee = require('../models/Fee');
const User = require('../models/User');
const StudentFee = require('../models/StudentFee');
const Payment = require('../models/Payment');
const FeeRequest = require('../models/FeeRequest');
const FeeType = require('../models/FeeType');

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

const PaytmChecksum = require('paytmchecksum');
const https = require('https');

const PAYTM_MID = process.env.PAYTM_MID || 'dummy_mid';
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY || 'dummy_key';
const PAYTM_WEBSITE = process.env.PAYTM_WEBSITE || 'WEBSTAGING';

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

    const orderId = `ORDER_${id.substring(0, 10)}_${Date.now()}`;
    const amountStr = amountToPay.toFixed(2);

    const paytmParams = {};
    paytmParams.body = {
      "requestType": "Payment",
      "mid": PAYTM_MID,
      "websiteName": PAYTM_WEBSITE,
      "orderId": orderId,
      "callbackUrl": `http://localhost:5000/api/users/payment/verify`, // Usually unused in JS checkout flow
      "txnAmount": {
        "value": amountStr,
        "currency": "INR",
      },
      "userInfo": {
        "custId": req.user._id.toString(),
      },
    };

    let checksum = "";
    try {
      // The paytmchecksum library expects a 16-character string. If the provided key is invalid, this will throw.
      checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), PAYTM_MERCHANT_KEY);
    } catch (e) {
      console.warn("Could not generate Paytm signature (likely invalid key format/length). Proceeding with mock token.");
      checksum = "dummy_checksum";
    }
    
    paytmParams.head = { "signature": checksum };

    const post_data = JSON.stringify(paytmParams);

    const options = {
      hostname: 'securegw-stage.paytm.in',
      port: 443,
      path: `/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${orderId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': post_data.length
      }
    };

    let response = "";
    const post_req = https.request(options, function(post_res) {
      post_res.on('data', function (chunk) {
        response += chunk;
      });

      post_res.on('end', function(){
        try {
          const result = JSON.parse(response);
          if (result.body && result.body.txnToken) {
            res.json({
              txnToken: result.body.txnToken,
              orderId: orderId,
              amount: amountStr,
              mid: PAYTM_MID
            });
          } else {
            // Mock fallback if keys are invalid or absent
            res.json({
              txnToken: "dummy_txn_token",
              orderId: orderId,
              amount: amountStr,
              mid: PAYTM_MID,
              mocked: true
            });
          }
        } catch(e) {
           res.status(500).json({ message: "Error parsing Paytm response" });
        }
      });
    });

    post_req.on('error', (err) => {
       res.status(500).json({ message: err.message });
    });

    post_req.write(post_data);
    post_req.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { orderId, id, isMissing, mocked } = req.body;

    const processPayment = async () => {
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
    };

    if (mocked) {
      // Bypass actual Paytm verification for dummy flow
      await processPayment();
      return;
    }

    const paytmParams = {};
    paytmParams.body = {
        "mid" : PAYTM_MID,
        "orderId" : orderId,
    };

    const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), PAYTM_MERCHANT_KEY);
    paytmParams.head = { "signature" : checksum };

    const post_data = JSON.stringify(paytmParams);

    const options = {
        hostname: 'securegw-stage.paytm.in',
        port: 443,
        path: '/v3/order/status',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    };

    let response = "";
    const post_req = https.request(options, function(post_res) {
        post_res.on('data', function (chunk) {
            response += chunk;
        });

        post_res.on('end', async function(){
            const result = JSON.parse(response);
            if (result.body && result.body.resultInfo && result.body.resultInfo.resultStatus === 'TXN_SUCCESS') {
                await processPayment();
            } else {
                res.status(400).json({ message: 'Payment verification failed at Paytm' });
            }
        });
    });
    
    post_req.write(post_data);
    post_req.end();

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
