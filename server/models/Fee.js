const mongoose = require('mongoose');

/**
 * ============================================================================
 * FEE MODEL - SIMPLE EXPLANATION
 * ============================================================================
 * This file defines how a "Fee" (like a tuition fee or exam fee) is saved 
 * in our database. 
 * 
 * IMPORTANT: Every fee must have a `collegeId`. This ensures that when College A 
 * creates a fee, College B cannot see it or use it. This is called "Data Separation".
 * ============================================================================
 */

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
    required: false 
  },
  assignedToGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  assignedToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Fee', feeSchema);
