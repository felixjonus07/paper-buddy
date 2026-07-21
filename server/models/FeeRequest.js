const mongoose = require('mongoose');

const feeRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedFeeTitle: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  feeType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeType',
    required: true
  },
  reason: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FeeRequest', feeRequestSchema);
