const { sequelize } = require('../config/db');
const { DataTypes, id, ref } = require('./_columns');

const Loan = sequelize.define('loans', {
  ...id(),
  user: ref(false),
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  purpose: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  appliedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

module.exports = Loan;
