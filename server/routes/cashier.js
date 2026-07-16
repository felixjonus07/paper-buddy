const express = require('express');
const router = express.Router();
const { searchStudents, getStudentPendingFees, processCashPayment } = require('../controllers/cashierController');
const { protect, cashier } = require('../middleware/authMiddleware');

// All cashier routes are protected and require cashier (or admin) role
router.use(protect, cashier);

router.get('/students/search', searchStudents);
router.get('/students/:studentId/fees', getStudentPendingFees);
router.post('/fees/pay', processCashPayment);

module.exports = router;
