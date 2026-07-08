const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  applicableFeeTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeType'
  }],
  minAcademicScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);
