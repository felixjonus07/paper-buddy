const { sequelize } = require('../config/db');
const { DataTypes, id, createdAt } = require('./_columns');

// Chat history for the AI assistant
const Message = sequelize.define('messages', {
  ...id(),
  conversationId: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING }, // system, user, assistant
  content: { type: DataTypes.TEXT },
  ...createdAt(),
});

module.exports = Message;
