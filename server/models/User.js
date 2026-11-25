const { sequelize } = require('../config/db');
const { DataTypes, id, ref, refArray, createdAt } = require('./_columns');

const User = sequelize.define('users', {
  ...id(),
  name: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  mustChangePassword: { type: DataTypes.BOOLEAN, defaultValue: false },
  groups: refArray(), // UUID[] of Group._id
  scholarship: ref(),
  academicScore: { type: DataTypes.DOUBLE, defaultValue: 0 },
  phoneNumber: { type: DataTypes.STRING },
  studentClass: { type: DataTypes.STRING },
  section: { type: DataTypes.STRING },
  year: { type: DataTypes.STRING },
  personalEmail: { type: DataTypes.STRING },
  collegeEmail: { type: DataTypes.STRING },
  registerNumber: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'cashier', 'mentor', 'superadmin'),
    defaultValue: 'user',
  },
  collegeId: ref(),
  ...createdAt(),
});

module.exports = User;
