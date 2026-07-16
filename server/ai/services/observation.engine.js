class ObservationEngine {
  /**
   * Evaluates the outcome of a tool execution step with fine-grained statuses.
   */
  async evaluate(currentStep, execResult, provider) {
    console.log(`[ObservationEngine] Evaluating result of ${currentStep.tool}`);

    if (execResult.status === 'needs_confirmation') {
      return { status: 'waiting', needsConfirmation: true, confirmationData: execResult.confirmationData };
    }

    if (execResult.success) {
      // In advanced implementations, LLM can analyze the actual result object to confirm it meets business expectations
      // For now, if the tool returned success without throwing, it's a success.
      // But we can check for "Partial Success" if count is 0
      if (execResult.result?.count === 0 || execResult.result?.users?.length === 0) {
        return { status: 'partial_success', reason: 'Tool succeeded but returned 0 items.', action: 'replan' };
      }
      return { status: 'success', reason: 'Tool executed successfully.' };
    }

    if (execResult.error && execResult.error.includes('Unauthorized')) {
      return { status: 'critical_failure', reason: execResult.error }; 
    }

    // Default to critical_failure for rollback
    return { status: 'critical_failure', reason: execResult.error || 'Unknown failure' };
  }
}

module.exports = new ObservationEngine();
