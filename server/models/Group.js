const { sequelize } = require('../config/db');
const { DataTypes, id, ref, refArray, createdAt } = require('./_columns');

const Group = sequelize.define('groups', {
  ...id(),
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  parentGroups: refArray(), // UUID[] of Group._id
  isGlobal: { type: DataTypes.BOOLEAN, defaultValue: false },
  collegeId: ref(false),
  ...createdAt(),
});

module.exports = Group;
