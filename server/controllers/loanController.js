const Loan = require('../models/Loan');

// User: Apply for a loan
const applyLoan = async (req, res) => {
  try {
    const { amount, purpose } = req.body;
    
    if (!amount || !purpose) {
      return res.status(400).json({ message: 'Amount and purpose are required' });
    }

    const loan = await Loan.create({
      user: req.user._id,
      amount,
      purpose,
    });

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Get their own loans
const getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user._id }).sort({ appliedAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all loans
const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('user', 'name email').sort({ appliedAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update loan status
const updateLoanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    loan.status = status;
    const updatedLoan = await loan.save();

    res.json(updatedLoan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyLoan,
  getMyLoans,
  getAllLoans,
  updateLoanStatus
};
