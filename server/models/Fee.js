const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  feeType: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeType',
    required: true 
  },
  assignedToGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  assignedToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Fee', feeSchema);
