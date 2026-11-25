const { sequelize } = require('../config/db');
const { DataTypes, id, ref, createdAt } = require('./_columns');

const AuditLog = sequelize.define('audit_logs', {
  ...id(),
  action: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT, allowNull: false },
  performedBy: ref(),
  collegeId: ref(),
  ...createdAt(),
});

module.exports = AuditLog;
