const aiService = require('../ai/ai.service');

const aiController = {
  /**
   * Handle standard chat requests
   */
  async chat(req, res) {
    try {
      const { message, conversationId = 'default' } = req.body;
      if (!message) return res.status(400).json({ error: 'Message is required' });

      const response = await aiService.processRequest(conversationId, message, req.user);
      res.json(response);
    } catch (error) {
      console.error('[AIController] Error in chat:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  /**
   * Handle confirmation for high-risk tools
   */
  async confirm(req, res) {
    try {
      const { conversationId, action, tool, args } = req.body;
      // In a real scenario, this would resume the state machine.
      // For now, we return a mock success that the frontend can use to re-trigger execution.
      res.json({ success: true, message: `Confirmed ${action} for ${tool}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Handle streaming chat requests with Progress/Trace events
   */
  async chatStream(req, res) {
    try {
      const { message, conversationId = 'default' } = req.body;
      if (!message) return res.status(400).json({ error: 'Message is required' });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // Callback to push events to the client
      const onEvent = (type, payload) => {
        // e.g., type: 'progress', payload: { state: 'Planning', message: '...' }
        // or type: 'message', payload: { text: 'Hello' }
        res.write(`data: ${JSON.stringify({ type, ...payload })}\\n\\n`);
      };

      await aiService.processRequestStream(conversationId, message, req.user, onEvent);
      
      res.write(`data: [DONE]\\n\\n`);
      res.end();
    } catch (error) {
      console.error('[AIController] Error in chatStream:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
      } else {
        res.write(`data: {"type": "error", "message": "${error.message}"}\\n\\n`);
        res.end();
      }
    }
  }
};

module.exports = aiController;
