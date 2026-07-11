class ExplanationEngine {
  /**
   * Generates a business-friendly explanation for failures or rollbacks.
   */
  async explainFailure(failedReason, state, provider) {
    const prompt = [
      { role: 'system', content: `Translate this technical failure into a polite, business-friendly explanation for an administrator. Keep it concise. Failure: "${failedReason}". Current State: ${state}` }
    ];
    try {
      return await provider.generateResponse(prompt, { temperature: 0.3 });
    } catch {
      return "The operation failed due to a business rule violation or technical error.";
    }
  }
}

module.exports = new ExplanationEngine();
