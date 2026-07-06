const express = require('express');
const router = express.Router();
const { applyLoan, getMyLoans, getAllLoans, updateLoanStatus } = require('../controllers/loanController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, applyLoan)
  .get(protect, admin, getAllLoans);

router.get('/myloans', protect, getMyLoans);

router.route('/:id/status')
  .put(protect, admin, updateLoanStatus);

module.exports = router;
