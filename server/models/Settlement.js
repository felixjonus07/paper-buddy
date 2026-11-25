const { sequelize } = require('../config/db');
const { DataTypes, id, ref } = require('./_columns');

const Settlement = sequelize.define('settlements', {
  ...id(),
  collegeId: ref(false),
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  status: {
    type: DataTypes.ENUM('PENDING_ADMIN_CONFIRMATION', 'COMPLETED'),
    defaultValue: 'PENDING_ADMIN_CONFIRMATION',
  },
  reference: { type: DataTypes.STRING },
  initiatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  completedAt: { type: DataTypes.DATE },
});

module.exports = Settlement;
