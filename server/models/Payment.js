const { sequelize } = require('../config/db');
const { DataTypes, id, ref } = require('./_columns');

const Payment = sequelize.define('payments', {
  ...id(),
  user: ref(false),
  group: ref(),
  fee: ref(false),
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  merchantTransactionId: { type: DataTypes.STRING, defaultValue: null },
  providerTransactionId: { type: DataTypes.STRING, defaultValue: null },
  paymentMethod: { type: DataTypes.ENUM('PHONEPE', 'CASH', 'OTHER'), defaultValue: 'OTHER' },
  status: { type: DataTypes.ENUM('SUCCESS', 'PENDING', 'FAILED'), defaultValue: 'SUCCESS' },
  paidAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  processedBy: { type: DataTypes.UUID, defaultValue: null },
  collegeId: ref(false),
});

module.exports = Payment;
