const toolRegistry = require('../tools/tool.registry');

class PlanningEngine {
  /**
   * Generates a DAG plan based on intent and parameters.
   */
  async createPlan(reasoningResult, provider) {
    console.log(`[PlanningEngine] Creating DAG plan for intent: ${reasoningResult.intent}`);
    
    // Pass the available tools and their dependencies to the LLM to help it structure the DAG
    const toolsContext = toolRegistry.getAllTools().map(t => ({
      name: t.name,
      dependencies: t.dependencies || [],
      description: t.description
    }));

    const planningPrompt = [
      { 
        role: 'system', 
        content: `Based on intent: "${reasoningResult.intent}" and parameters: ${JSON.stringify(reasoningResult.parameters)}, generate a directed acyclic graph (DAG) execution plan.
Tools available: ${JSON.stringify(toolsContext)}
Output strictly JSON matching the schema. The 'dependsOn' array allows parallel execution. If a step has empty dependsOn, it can run immediately. If step B depends on step A, step B runs after A finishes.` 
      }
    ];

    const responseSchema = {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING', description: 'Unique step ID, e.g., step1' },
          action: { type: 'STRING' },
          tool: { type: 'STRING' },
          arguments: { type: 'OBJECT' },
          dependsOn: { type: 'ARRAY', items: { type: 'STRING' }, description: 'IDs of steps that must complete first' }
        },
        required: ['id', 'action', 'tool', 'arguments', 'dependsOn']
      }
    };

    try {
      const startTime = Date.now();
      const responseText = await provider.generateResponse(planningPrompt, { temperature: 0.2, responseSchema });
      const healthMonitor = require('../core/health.monitor');
      healthMonitor.recordLLMLatency(Date.now() - startTime);

      return JSON.parse(responseText);
    } catch (error) {
      console.error('[PlanningEngine] Failed to generate DAG plan', error);
      return [];
    }
  }

  async replan(currentPlan, failedStepId, failedResult, provider) {
    console.log(`[PlanningEngine] Dynamic Replanning after failure at step ${failedStepId}`);
    // Simplified: Just returns empty to trigger rollback for now. In a real impl, ask LLM for alternative steps.
    return [];
  }
}

module.exports = new PlanningEngine();
