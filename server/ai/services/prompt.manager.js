const systemPromptLoader = require('./system-prompt.loader');
const knowledgeEngine = require('../knowledge/knowledge.engine');
const knowledgeCache = require('../knowledge/knowledge.cache');
const businessRules = require('../rules/business.rules.engine');
const policyEngine = require('../rules/policy.engine');
const permissionContext = require('../context/permission.context');

class PromptManager {
  /**
   * Assembles the final, context-enriched message array.
   */
  async buildPrompt(history, userMessage, rawUserObj, executionState = null) {
    const baseSystemPrompt = systemPromptLoader.getPrompt();
    
    // Knowledge & Rules Context Enrichment
    const domainDict = knowledgeEngine.getDomainDictionary();
    const rules = businessRules.getRules();
    const policies = policyEngine.getPolicies();
    
    // Cached Portal Context
    const portalData = await knowledgeCache.getActiveContext();
    const portalStr = `[PORTAL CONTEXT]\\n${JSON.stringify(portalData, null, 2)}`;
    
    // Permission Context
    const permData = permissionContext.resolveContext(rawUserObj);
    const permStr = permissionContext.formatForPrompt(permData);

    let enrichedSystemPrompt = `
${baseSystemPrompt}

${domainDict}

${rules}

${policies}

${portalStr}

${permStr}
    `.trim();

    if (executionState) {
      enrichedSystemPrompt += `\\n\\n[EXECUTION STATE]\\nCurrent Status: ${executionState.currentState}\\nRecent Action: ${JSON.stringify(executionState.lastAction || {})}`;
    }

    const messages = [
      { role: 'system', content: enrichedSystemPrompt },
      ...history,
      { role: 'user', content: userMessage }
    ];

    return messages;
  }
}

module.exports = new PromptManager();
