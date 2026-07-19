const express = require('express');
const router = express.Router();
const { getMyFees, getProfile, updateProfile, getStudentFees, payFee, payNewFee, createPaymentOrder, verifyPayment, phonepeCallback, createFeeRequest, getMyFeeRequests, getFeeTypes } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// PhonePe server-to-server callback (unprotected — PhonePe hits this directly)
router.post('/phonepe-callback', phonepeCallback);

router.get('/fees', protect, getMyFees);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/student-fees', protect, getStudentFees);
router.post('/pay-fee/:id', protect, payFee);
router.post('/pay-fee/new/:id', protect, payNewFee);
router.post('/create-payment-order', protect, createPaymentOrder);
router.post('/verify-payment', protect, verifyPayment);

router.post('/fee-requests', protect, createFeeRequest);
router.get('/fee-requests', protect, getMyFeeRequests);
router.get('/fee-types', protect, getFeeTypes);

module.exports = router;
