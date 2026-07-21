const express = require('express');
const router = express.Router();
const { searchStudents, getStudentPendingFees, getStudentPayments, processCashPayment, getTodayLog, getReport, addFeeToStudent, getFeeTypes } = require('../controllers/cashierController');
const { protect, cashier } = require('../middleware/authMiddleware');

// All cashier routes are protected and require cashier (or admin) role
router.use(protect, cashier);

router.get('/students/search', searchStudents);
router.get('/students/:studentId/fees', getStudentPendingFees);
router.get('/students/:studentId/payments', getStudentPayments);
router.post('/fees/pay', processCashPayment);
router.post('/fees/add', addFeeToStudent);
router.get('/fee-types', getFeeTypes);
router.get('/log/today', getTodayLog);
router.get('/report', getReport);

module.exports = router;
