class ReasoningEngine {
  /**
   * Analyzes intent and extracts parameters using LLM.
   */
  async analyze(userMessage, contextMessages, provider) {
    console.log(`[ReasoningEngine] Analyzing request: ${userMessage}`);
    
    // We append a system prompt forcing the LLM to output a JSON schema
    const reasoningPrompt = [
      ...contextMessages,
      { role: 'user', content: userMessage },
      { role: 'system', content: `Analyze the user's latest request. Output JSON with strictly this format: { "intent": "string", "parameters": { "key": "value" }, "missingInfo": "string or null if nothing missing", "confidence": "0.0 to 1.0" }` }
    ];

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        intent: { type: 'STRING' },
        parameters: { type: 'OBJECT', description: 'Extracted entities/parameters' },
        missingInfo: { type: 'STRING', description: 'Describe what info is missing to proceed, or null' },
        confidence: { type: 'NUMBER' }
      },
      required: ['intent', 'parameters', 'confidence']
    };

    try {
      const responseText = await provider.generateResponse(reasoningPrompt, {
        temperature: 0.1,
        responseSchema
      });
      return JSON.parse(responseText);
    } catch (error) {
      console.error('[ReasoningEngine] Failed to parse LLM response', error);
      // Fallback
      return { intent: 'unknown', parameters: {}, missingInfo: null, confidence: 0 };
    }
  }
}

module.exports = new ReasoningEngine();
