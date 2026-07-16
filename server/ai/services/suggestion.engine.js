class SuggestionEngine {
  /**
   * Analyzes the completed workflow and proposes next best actions.
   */
  async generateSuggestions(userMessage, timeline, provider) {
    console.log(`[SuggestionEngine] Generating proactive suggestions...`);
    
    const prompt = [
      { 
        role: 'system', 
        content: `You are a proactive AI assistant. The user just completed a workflow. 
Here is the timeline of what was done: ${JSON.stringify(timeline.events.filter(e => e.type === 'tool_execution'))}.
Based on typical enterprise workflows, suggest 1 or 2 logical next steps as a helpful follow-up question. 
Output strictly JSON: { "suggestions": ["string"] }` 
      }
    ];

    const schema = {
      type: 'OBJECT',
      properties: {
        suggestions: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['suggestions']
    };

    try {
      const responseText = await provider.generateResponse(prompt, { temperature: 0.3, responseSchema: schema });
      return JSON.parse(responseText).suggestions || [];
    } catch (error) {
      console.error('[SuggestionEngine] Failed suggestion generation:', error);
      return [];
    }
  }
}

module.exports = new SuggestionEngine();
