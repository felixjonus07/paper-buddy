class ExecutionTrace {
  constructor(conversationId) {
    this.conversationId = conversationId;
    this.steps = [];
    this.startTime = Date.now();
  }

  addStep(type, details) {
    const step = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      ...details
    };
    this.steps.push(step);
    return step.id;
  }

  updateStep(stepId, updates) {
    const stepIndex = this.steps.findIndex(s => s.id === stepId);
    if (stepIndex !== -1) {
      this.steps[stepIndex] = { ...this.steps[stepIndex], ...updates };
    }
  }

  getTrace() {
    return {
      conversationId: this.conversationId,
      startTime: new Date(this.startTime).toISOString(),
      durationMs: Date.now() - this.startTime,
      steps: this.steps
    };
  }
  
  // Future: async persist() to MongoDB
}

module.exports = ExecutionTrace;
