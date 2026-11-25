const { sequelize } = require('../config/db');
const { DataTypes, id, ref, createdAt } = require('./_columns');

/**
 * FEE MODEL
 * Every fee must have a `collegeId` so College A never sees College B's fees.
 */
const Fee = sequelize.define('fees', {
  ...id(),
  title: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  feeType: ref(),
  assignedToGroup: ref(),
  assignedToUser: ref(),
  collegeId: ref(false),
  deadlineDate: { type: DataTypes.DATE },
  lateFeeFine: { type: DataTypes.DOUBLE, defaultValue: 0 },
  lateFeeFineType: { type: DataTypes.ENUM('per day', 'per month', 'total'), defaultValue: 'total' },
  ...createdAt(),
});

module.exports = Fee;
