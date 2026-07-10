const mongoose = require('mongoose');

const StudentFeeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  feeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
  baseAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true }, // baseAmount - discountAmount
  status: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('StudentFee', StudentFeeSchema);
