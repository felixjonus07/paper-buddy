const toolRegistry = require('../tools/tool.registry');
const cacheManager = require('../core/workflow.cache');
const healthMonitor = require('../core/health.monitor');

class ToolOrchestrator {
  /**
   * Executes a single step.
   */
  async executeStep(step, userContext, state, timeline, provider) {
    console.log(`[ToolOrchestrator] Executing step: ${step.id} - ${step.tool}`);
    
    const tool = toolRegistry.getTool(step.tool);
    if (!tool) {
      return { success: false, error: `Tool ${step.tool} not found.` };
    }

    if (tool.permissions.length > 0) {
      const hasPermission = tool.permissions.some(p => userContext.permissions.includes(p));
      if (!hasPermission) return { success: false, error: `Unauthorized` };
    }

    if (tool.confirmationRequired) {
      return { 
        status: 'needs_confirmation', 
        confirmationData: { tool: tool.name, args: step.arguments, riskLevel: tool.riskLevel, message: `Confirm ${tool.name}` }
      };
    }

    // Check Cache
    const cachedResult = cacheManager.get(tool.name, step.arguments);
    if (cachedResult) {
      timeline.addEvent('tool_execution', { stepId: step.id, tool: tool.name, result: cachedResult, cached: true, status: 'success' });
      return { success: true, result: cachedResult, cached: true };
    }

    let attempts = 0;
    const maxRetries = 3;
    let lastError = null;

    while (attempts < maxRetries) {
      try {
        attempts++;
        const startTime = Date.now();
        const result = await tool.executor(step.arguments, userContext);
        const duration = Date.now() - startTime;
        
        timeline.addEvent('tool_execution', { stepId: step.id, tool: tool.name, attempt: attempts, args: step.arguments, result, duration, status: 'success' });
        healthMonitor.recordToolResult(true);
        cacheManager.set(tool.name, step.arguments, result);
        
        return { success: true, result };
      } catch (error) {
        lastError = error;
        console.error(`[ToolOrchestrator] ${tool.name} failed (Attempt ${attempts}):`, error.message);
        timeline.addEvent('tool_error', { stepId: step.id, tool: tool.name, attempt: attempts, error: error.message });
      }
    }

    healthMonitor.recordToolResult(false);
    timeline.addEvent('tool_execution', { stepId: step.id, tool: tool.name, status: 'failed', error: lastError.message });
    return { success: false, error: `Failed after ${maxRetries} attempts.` };
  }

  /**
   * Triggers compensation logic for all completed tools in reverse order.
   */
  async rollback(timeline, userContext) {
    console.log(`[ToolOrchestrator] Initiating Rollback...`);
    const completedTools = timeline.getCompletedTools().reverse();

    for (const event of completedTools) {
      const tool = toolRegistry.getTool(event.tool);
      if (tool && tool.canRollback) {
        try {
          console.log(`[ToolOrchestrator] Rolling back ${tool.name}`);
          await tool.rollbackHandler(event.args, event.result, userContext);
          timeline.addEvent('tool_rollback', { stepId: event.stepId, tool: tool.name, status: 'success' });
        } catch (error) {
          console.error(`[ToolOrchestrator] Failed to rollback ${tool.name}`, error);
          timeline.addEvent('tool_rollback', { stepId: event.stepId, tool: tool.name, status: 'failed', error: error.message });
        }
      }
    }
  }
}

module.exports = new ToolOrchestrator();
