// Loads every model so sequelize.sync() creates all tables.
module.exports = {
  AuditLog: require('./AuditLog'),
  College: require('./College'),
  Fee: require('./Fee'),
  FeeRequest: require('./FeeRequest'),
  FeeType: require('./FeeType'),
  Group: require('./Group'),
  Loan: require('./Loan'),
  Message: require('./Message'),
  Payment: require('./Payment'),
  Scholarship: require('./Scholarship'),
  Settlement: require('./Settlement'),
  StudentFee: require('./StudentFee'),
  User: require('./User'),
};
