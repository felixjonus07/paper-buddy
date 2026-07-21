const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: false,
  },
  fee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fee',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  merchantTransactionId: {
    type: String,
    default: null,
  },
  providerTransactionId: {
    type: String,
    default: null,
  },
  paymentMethod: {
    type: String,
    enum: ['PHONEPE', 'CASH', 'OTHER'],
    default: 'OTHER',
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'PENDING', 'FAILED'],
    default: 'SUCCESS',
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
