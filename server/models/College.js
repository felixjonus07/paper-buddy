const { sequelize } = require('../config/db');
const { DataTypes, id, createdAt } = require('./_columns');

const College = sequelize.define('colleges', {
  ...id(),
  name: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  address: { type: DataTypes.TEXT, allowNull: false },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  administratorName: { type: DataTypes.STRING },
  strength: { type: DataTypes.INTEGER },
  subscriptionStatus: { type: DataTypes.ENUM('active', 'suspended'), defaultValue: 'active' },
  paymentType: { type: DataTypes.ENUM('CENTRALIZED', 'DECENTRALIZED'), defaultValue: 'CENTRALIZED' },
  // { merchantId, saltKey: { iv, encryptedData }, saltIndex, env }
  paymentCredentials: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: { saltIndex: 1, env: 'SANDBOX' },
  },
  aiAccess: { type: DataTypes.BOOLEAN, defaultValue: true },
  promptCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  tokenCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  ...createdAt(),
});

module.exports = College;
