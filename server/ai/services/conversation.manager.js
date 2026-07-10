const promptManager = require('./prompt.manager');
const memoryManager = require('./memory.manager');

class ConversationManager {
  async processMessage(conversationId, userMessage, rawUserObj) {
    // Save user message
    await memoryManager.addMessage(conversationId, 'user', userMessage);
    
    // Retrieve history
    const history = await memoryManager.getHistory(conversationId);
    
    // Build context
    const previousHistory = history.slice(0, -1); 
    const messages = await promptManager.buildPrompt(previousHistory, userMessage, rawUserObj);
    
    return messages;
  }

  async saveAssistantResponse(conversationId, responseText) {
    await memoryManager.addMessage(conversationId, 'assistant', responseText);
  }
}

module.exports = new ConversationManager();
