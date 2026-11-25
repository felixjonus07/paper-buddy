const Message = require('../../models/Message');
const { isConnected } = require('../../config/db');

class MemoryManager {
  constructor() {
    // Fallback in-memory cache
    this.cache = new Map();
  }

  async addMessage(conversationId, role, content) {
    try {
      if (isConnected()) {
        await Message.create({ conversationId, role, content });
      }
    } catch (e) {
      console.error('Error saving message to DB', e);
    }

    if (!this.cache.has(conversationId)) {
      this.cache.set(conversationId, []);
    }
    this.cache.get(conversationId).push({ role, content });
  }

  async getHistory(conversationId, limit = 50) {
    if (isConnected()) {
      const msgs = await Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']],
        limit,
        raw: true,
      });
      if (msgs.length > 0) {
        return msgs.map(m => ({ role: m.role, content: m.content }));
      }
    }
    return this.cache.get(conversationId) || [];
  }

  async clearHistory(conversationId) {
    if (isConnected()) {
      await Message.destroy({ where: { conversationId } });
    }
    this.cache.delete(conversationId);
  }
}

module.exports = new MemoryManager();
