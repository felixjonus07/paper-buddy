const { sequelize } = require('../config/db');
const { DataTypes, id, ref, createdAt } = require('./_columns');

const FeeType = sequelize.define('fee_types', {
  ...id(),
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  collegeId: ref(false),
  ...createdAt(),
});

module.exports = FeeType;
