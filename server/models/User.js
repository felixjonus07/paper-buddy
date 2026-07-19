const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  mustChangePassword: {
    type: Boolean,
    default: false,
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship'
  },
  academicScore: {
    type: Number,
    default: 0
  },
  phoneNumber: { type: String },
  studentClass: { type: String },
  section: { type: String },
  year: { type: String },
  personalEmail: { type: String },
  collegeEmail: { type: String },
  registerNumber: { type: String },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'cashier', 'mentor'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('User', userSchema);
