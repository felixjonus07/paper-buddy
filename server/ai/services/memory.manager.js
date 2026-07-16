const mongoose = require('mongoose');

// Simple Mongoose schema for persisting conversations later
const MessageSchema = new mongoose.Schema({
  conversationId: String,
  role: String, // system, user, assistant
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

class MemoryManager {
  constructor() {
    // Fallback in-memory cache
    this.cache = new Map();
  }

  async addMessage(conversationId, role, content) {
    try {
      if (mongoose.connection.readyState === 1) {
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
    if (mongoose.connection.readyState === 1) {
      const msgs = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();
      if (msgs.length > 0) {
        return msgs.map(m => ({ role: m.role, content: m.content }));
      }
    }
    return this.cache.get(conversationId) || [];
  }

  async clearHistory(conversationId) {
    if (mongoose.connection.readyState === 1) {
      await Message.deleteMany({ conversationId });
    }
    this.cache.delete(conversationId);
  }
}

module.exports = new MemoryManager();
