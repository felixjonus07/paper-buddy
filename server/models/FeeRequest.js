const { sequelize } = require('../config/db');
const { DataTypes, id, ref, createdAt } = require('./_columns');

const FeeRequest = sequelize.define('fee_requests', {
  ...id(),
  studentId: ref(false),
  requestedFeeTitle: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  feeType: ref(false),
  reason: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  collegeId: ref(false),
  ...createdAt(),
});

module.exports = FeeRequest;
