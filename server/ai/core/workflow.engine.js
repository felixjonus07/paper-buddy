const { AgentState, AgentStates } = require('./agent.state');
const WorkflowTimeline = require('./workflow.timeline');
const healthMonitor = require('./health.monitor');
const cacheManager = require('./workflow.cache');
const confidenceEngine = require('../services/confidence.engine');
const reasoningEngine = require('../services/reasoning.engine');
const planningEngine = require('../services/planning.engine');
const observationEngine = require('../services/observation.engine');
const suggestionEngine = require('../services/suggestion.engine');
const toolOrchestrator = require('../orchestrator/tool.orchestrator');

class WorkflowEngine {
  /**
   * Executes the DAG-based workflow.
   */
  async run({ conversationId, userMessage, messages, userContext, onProgress, provider }) {
    const state = new AgentState(conversationId);
    const timeline = new WorkflowTimeline(conversationId);
    
    state.onStateChange((newState, payload) => {
      if (onProgress) onProgress({ type: 'progress', state: newState, ...payload });
    });

    try {
      state.transition(AgentStates.THINKING, { message: 'Initializing Enterprise Workflow Engine...' });
      
      // 1. Confidence Pre-check
      const confidence = await confidenceEngine.evaluate(userMessage, messages, provider);
      if (confidence.confidenceScore < 80 || confidence.isAmbiguous) {
        state.transition(AgentStates.COMPLETED, { message: 'Request is ambiguous.' });
        const finalResponse = confidence.clarificationQuestion || "I need more details to safely execute this. Could you clarify?";
        return { status: 'needs_info', response: finalResponse, trace: timeline.getTimeline() };
      }

      // 2. Reasoning
      state.transition(AgentStates.REASONING, { message: 'Understanding intent...' });
      const reasoningResult = await reasoningEngine.analyze(userMessage, messages, provider);

      // 3. Planning (Generates DAG)
      state.transition(AgentStates.PLANNING, { message: 'Building DAG execution plan...' });
      const plan = await planningEngine.createPlan(reasoningResult, provider);
      
      if (!plan || plan.length === 0) {
        throw new Error("Failed to generate a valid execution plan.");
      }

      // 4. DAG Execution Loop
      const stepStatus = new Map(plan.map(step => [step.id, 'pending']));
      const stepResults = new Map();
      
      const executeDAG = async () => {
        let isComplete = false;
        
        while (!isComplete) {
          const pendingSteps = plan.filter(s => stepStatus.get(s.id) === 'pending');
          if (pendingSteps.length === 0) {
            isComplete = true; // All steps are either completed or failed
            break;
          }

          // Find steps where all dependencies are 'success'
          const runnableSteps = pendingSteps.filter(s => {
            if (!s.dependsOn || s.dependsOn.length === 0) return true;
            return s.dependsOn.every(depId => stepStatus.get(depId) === 'success');
          });

          if (runnableSteps.length === 0) {
            // Deadlock or waiting
            const executing = plan.filter(s => stepStatus.get(s.id) === 'executing');
            if (executing.length === 0) {
              throw new Error("Workflow deadlock detected. Unresolved dependencies.");
            }
            // Wait a bit and continue loop
            await new Promise(r => setTimeout(r, 500));
            continue;
          }

          // Execute runnable steps in parallel
          state.transition(AgentStates.EXECUTING, { message: `Executing ${runnableSteps.length} step(s) in parallel...` });
          
          runnableSteps.forEach(s => stepStatus.set(s.id, 'executing'));

          const stepPromises = runnableSteps.map(async (currentStep) => {
            const execResult = await toolOrchestrator.executeStep(currentStep, userContext, state, timeline, provider);
            
            const observation = await observationEngine.evaluate(currentStep, execResult, provider);
            
            if (observation.needsConfirmation) {
              stepStatus.set(currentStep.id, 'waiting');
              return { type: 'confirmation', step: currentStep, data: observation.confirmationData };
            }

            if (observation.status === 'success' || observation.status === 'partial_success') {
              stepStatus.set(currentStep.id, 'success');
              stepResults.set(currentStep.id, execResult.result);
              return { type: 'success' };
            } else {
              stepStatus.set(currentStep.id, 'failed');
              return { type: 'failed', error: observation.reason };
            }
          });

          // Wait for this batch of parallel steps
          const batchResults = await Promise.all(stepPromises);

          // Handle Confirmations or Failures from batch
          const confirmation = batchResults.find(r => r.type === 'confirmation');
          if (confirmation) {
            state.transition(AgentStates.WAITING_CONFIRMATION, { confirmationData: confirmation.data });
            return { status: 'waiting_confirmation', pendingStep: confirmation.step, trace: timeline.getTimeline() };
          }

          const failure = batchResults.find(r => r.type === 'failed');
          if (failure) {
            throw new Error(`Critical failure in workflow: ${failure.error}`);
          }
        }
      };

      await executeDAG();

      // 5. Suggestions
      state.transition(AgentStates.THINKING, { message: 'Generating proactive suggestions...' });
      const suggestions = await suggestionEngine.generateSuggestions(userMessage, timeline, provider);
      
      healthMonitor.recordWorkflowResult(true);
      state.transition(AgentStates.COMPLETED, { message: 'Workflow completed successfully.' });

      // Build context for final LLM summary
      const summaryContext = [
        ...messages,
        { role: 'system', content: `Execution Timeline: ${JSON.stringify(timeline.events)}\\n\\nProvide a helpful summary. Also suggest these next steps if applicable: ${suggestions.join(', ')}` }
      ];

      return { status: 'success', summaryContext, trace: timeline.getTimeline() };

    } catch (error) {
      console.error('[WorkflowEngine] Error:', error);
      healthMonitor.recordWorkflowResult(false);
      state.transition(AgentStates.FAILED, { error: error.message });
      
      // Trigger Rollback
      state.transition('RollingBack', { message: 'Initiating rollback procedures...' });
      await toolOrchestrator.rollback(timeline, userContext);
      state.transition('RollbackComplete', { message: 'Rollback complete.' });

      timeline.addEvent('workflow_error', { error: error.message, stack: error.stack });
      return { status: 'failed', error: error.message, trace: timeline.getTimeline() };
    }
  }
}

module.exports = new WorkflowEngine();
