class ConfidenceEngine {
  /**
   * Pre-checks the user's intent to determine if it is unambiguous.
   */
  async evaluate(userMessage, contextMessages, provider) {
    console.log(`[ConfidenceEngine] Evaluating confidence for: "${userMessage}"`);
    const prompt = [
      ...contextMessages,
      { role: 'user', content: userMessage },
      { 
        role: 'system', 
        content: `Analyze the user's latest request for clarity, ambiguity, and completeness.
Output strictly JSON: { "confidenceScore": number (0-100), "isAmbiguous": boolean, "clarificationQuestion": string | null }
If the request uses acronyms that could mean multiple things (e.g. CS = Computer Science or Cyber Security) or is missing critical context (e.g., "delete it"), score it below 80.` 
      }
    ];

    const schema = {
      type: 'OBJECT',
      properties: {
        confidenceScore: { type: 'NUMBER' },
        isAmbiguous: { type: 'BOOLEAN' },
        clarificationQuestion: { type: 'STRING', description: 'Question to ask if ambiguous, else null' }
      },
      required: ['confidenceScore', 'isAmbiguous']
    };

    try {
      const startTime = Date.now();
      const responseText = await provider.generateResponse(prompt, { temperature: 0.1, responseSchema: schema });
      const duration = Date.now() - startTime;
      
      // Update health monitor via global or passed instance
      const healthMonitor = require('../core/health.monitor');
      healthMonitor.recordLLMLatency(duration);

      return JSON.parse(responseText);
    } catch (error) {
      console.error('[ConfidenceEngine] Failed evaluation:', error);
      // Fail open if the LLM fails to parse, so we don't block execution permanently
      return { confidenceScore: 100, isAmbiguous: false, clarificationQuestion: null };
    }
  }
}

module.exports = new ConfidenceEngine();
