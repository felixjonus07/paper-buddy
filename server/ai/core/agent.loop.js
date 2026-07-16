const { AgentState, AgentStates } = require('./agent.state');
const ExecutionTrace = require('./execution.trace');
const reasoningEngine = require('../services/reasoning.engine');
const planningEngine = require('../services/planning.engine');
const observationEngine = require('../services/observation.engine');
const toolOrchestrator = require('../orchestrator/tool.orchestrator');

class AgentLoop {
  /**
   * Executes the full agent loop for a given request.
   * @param {Object} params
   * @param {String} params.conversationId
   * @param {String} params.userMessage
   * @param {Array} params.messages (Context loaded by PromptManager)
   * @param {Object} params.userContext
   * @param {Function} params.onProgress (Callback for SSE streaming)
   * @param {Object} params.provider (LLM Provider)
   */
  async run({ conversationId, userMessage, messages, userContext, onProgress, provider }) {
    const state = new AgentState(conversationId);
    const trace = new ExecutionTrace(conversationId);
    
    // Bind state changes to the progress stream
    state.onStateChange((newState, payload) => {
      if (onProgress) {
        onProgress({ type: 'progress', state: newState, ...payload });
      }
    });

    try {
      state.transition(AgentStates.THINKING, { message: 'Initializing agent loop...' });
      
      // 1. Reasoning
      state.transition(AgentStates.REASONING, { message: 'Understanding intent and extracting parameters...' });
      const reasoningResult = await reasoningEngine.analyze(userMessage, messages, provider);
      trace.addStep('reasoning', { result: reasoningResult });

      if (reasoningResult.missingInfo) {
        state.transition(AgentStates.COMPLETED, { message: 'Waiting for missing information.' });
        // Instead of continuing, the agent will just reply asking for missing info
        const finalResponse = await provider.generateResponse(messages); // It should inherently ask
        return { status: 'needs_info', response: finalResponse, trace: trace.getTrace() };
      }

      // 2. Planning
      state.transition(AgentStates.PLANNING, { message: 'Creating execution plan...' });
      let plan = await planningEngine.createPlan(reasoningResult, provider);
      trace.addStep('planning', { plan });

      // 3. Execution Loop
      let stepIndex = 0;
      let loopCount = 0;
      const MAX_LOOPS = 10;

      while (stepIndex < plan.length && loopCount < MAX_LOOPS) {
        loopCount++;
        const currentStep = plan[stepIndex];
        
        state.transition(AgentStates.EXECUTING, { message: `Executing step ${stepIndex + 1}: ${currentStep.action}` });
        
        const execResult = await toolOrchestrator.executeStep(currentStep, userContext, state, trace, provider);
        
        // 4. Observation
        state.transition(AgentStates.OBSERVING, { message: 'Observing results...' });
        const observation = await observationEngine.evaluate(currentStep, execResult, provider);
        trace.addStep('observation', { step: currentStep, observation });

        if (observation.needsConfirmation) {
          state.transition(AgentStates.WAITING_CONFIRMATION, { confirmationData: observation.confirmationData });
          return { status: 'waiting_confirmation', pendingStep: currentStep, trace: trace.getTrace() };
        }

        if (observation.status === 'success') {
          stepIndex++;
        } else if (observation.status === 'retry') {
          state.transition(AgentStates.RETRYING, { message: `Retrying step ${stepIndex + 1}...` });
          // Loop will naturally repeat this stepIndex
        } else if (observation.status === 'replan') {
          state.transition(AgentStates.PLANNING, { message: 'Replanning based on recent failure...' });
          plan = await planningEngine.replan(plan, stepIndex, execResult, provider);
          // Don't increment stepIndex, continue with new plan from this index
        } else if (observation.status === 'failed') {
          throw new Error(`Execution failed at step ${stepIndex + 1}: ${observation.reason}`);
        }
      }

      if (loopCount >= MAX_LOOPS) {
        throw new Error("Agent loop exceeded maximum iterations.");
      }

      // 5. Final Summary
      state.transition(AgentStates.THINKING, { message: 'Generating final summary...' });
      
      // Inject trace summary into messages for final LLM response
      const summaryContext = [...messages, { role: 'system', content: `Execution Trace Summary:\\n${JSON.stringify(trace.getTrace().steps)}` }];
      
      let finalResponse = '';
      if (onProgress) {
        // We'll yield control to let the controller stream the final response natively if needed,
        // but here we can just return the prompt array to be handled.
      }
      
      state.transition(AgentStates.COMPLETED, { message: 'Workflow completed successfully.' });
      return { status: 'success', summaryContext, trace: trace.getTrace() };

    } catch (error) {
      state.transition(AgentStates.FAILED, { error: error.message });
      trace.addStep('error', { error: error.message, stack: error.stack });
      return { status: 'failed', error: error.message, trace: trace.getTrace() };
    }
  }
}

module.exports = new AgentLoop();
