const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING_ADMIN_CONFIRMATION', 'COMPLETED'],
    default: 'PENDING_ADMIN_CONFIRMATION'
  },
  reference: {
    type: String
  },
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Settlement', settlementSchema);
