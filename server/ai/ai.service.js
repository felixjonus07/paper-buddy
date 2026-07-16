const conversationManager = require('./services/conversation.manager');
const memoryManager = require('./services/memory.manager');
const workflowEngine = require('./core/workflow.engine');
const validationEngine = require('./rules/validation.engine');
const explanationEngine = require('./services/explanation.engine');
const terminologyEngine = require('./knowledge/terminology.engine');
const eventSystem = require('./events/event.system');
const GeminiProvider = require('./providers/gemini-provider');
const GrokProvider = require('./providers/grok-provider');
const permissionContext = require('./context/permission.context');

class AIService {
  constructor() {
    this.provider = null;
  }

  _getProvider() {
    if (this.provider) return this.provider;
    const providerType = process.env.AI_PROVIDER || 'gemini';
    if (providerType === 'gemini') {
      this.provider = new GeminiProvider(process.env.GEMINI_API_KEY);
    } else {
      this.provider = new GrokProvider(process.env.GROK_API_KEY);
    }
    this.provider.initialize();
    return this.provider;
  }

  /**
   * Main workflow for processing an AI request
   */
  async processRequest(conversationId, userMessage, reqUser) {
    const provider = this._getProvider();
    
    // 1. Terminology Normalization
    const normalizedMessage = terminologyEngine.normalize(userMessage);

    // 2. Pre-execution Business Validation
    const userContext = permissionContext.resolveContext(reqUser);
    const validation = await validationEngine.validate(normalizedMessage, userContext.role);
    
    if (!validation.valid) {
      const explanation = await explanationEngine.explainFailure(validation.message, 'Pre-validation', provider);
      return { response: explanation, error: true };
    }

    const messages = await conversationManager.processMessage(conversationId, normalizedMessage, reqUser);
    
    // 3. Workflow Engine Execution
    const result = await workflowEngine.run({
      conversationId,
      userMessage: normalizedMessage,
      messages,
      userContext,
      provider
    });

    if (result.status === 'success') {
      eventSystem.emitEvent('WorkflowCompleted', { conversationId });
      await conversationManager.saveAssistantResponse(conversationId, result.summaryContext[result.summaryContext.length - 1].content);
      return { response: 'Workflow completed successfully.', trace: result.trace };
    }

    return { response: result.error || 'Failed', trace: result.trace, error: true };
  }

  /**
   * Streaming version for SSE
   */
  async processRequestStream(conversationId, userMessage, reqUser, onEvent) {
    const provider = this._getProvider();
    
    const normalizedMessage = terminologyEngine.normalize(userMessage);
    const userContext = permissionContext.resolveContext(reqUser);
    
    const validation = await validationEngine.validate(normalizedMessage, userContext.role);
    if (!validation.valid) {
      const explanation = await explanationEngine.explainFailure(validation.message, 'Pre-validation', provider);
      onEvent('error', { message: explanation });
      return;
    }

    const messages = await conversationManager.processMessage(conversationId, normalizedMessage, reqUser);

    const result = await workflowEngine.run({
      conversationId,
      userMessage: normalizedMessage,
      messages,
      userContext,
      provider,
      onProgress: (payload) => onEvent('progress', payload)
    });

    if (result.status === 'waiting_confirmation') {
      onEvent('confirmation', result.pendingStep);
      return;
    }

    if (result.status === 'failed') {
      const explanation = await explanationEngine.explainFailure(result.error, 'Execution', provider);
      onEvent('error', { message: explanation });
      return;
    }

    onEvent('progress', { state: 'Finalizing', message: 'Writing response...' });
    const stream = await provider.generateStream(result.summaryContext || messages);
    let fullResponse = '';
    
    for await (const chunk of stream) {
      fullResponse += chunk;
      onEvent('message', { text: chunk });
    }
    
    eventSystem.emitEvent('WorkflowCompleted', { conversationId });
    await conversationManager.saveAssistantResponse(conversationId, fullResponse);
  }
}

module.exports = new AIService();
