const { sequelize } = require('../config/db');
const { DataTypes, id, ref } = require('./_columns');

const StudentFee = sequelize.define('student_fees', {
  ...id(),
  studentId: ref(false),
  groupId: ref(),
  feeId: ref(false),
  baseAmount: { type: DataTypes.DOUBLE, allowNull: false },
  discountAmount: { type: DataTypes.DOUBLE, defaultValue: 0 },
  finalAmount: { type: DataTypes.DOUBLE, allowNull: false }, // baseAmount - discountAmount
  status: { type: DataTypes.ENUM('PENDING', 'PAID'), defaultValue: 'PENDING' },
  collegeId: ref(false),
}, { timestamps: true }); // createdAt + updatedAt

module.exports = StudentFee;
