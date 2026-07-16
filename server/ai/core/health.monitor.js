class HealthMonitor {
  constructor() {
    this.metrics = {
      totalWorkflows: 0,
      successfulWorkflows: 0,
      failedWorkflows: 0,
      totalToolCalls: 0,
      toolSuccesses: 0,
      toolFailures: 0,
      totalLLMCalls: 0,
      llmLatencyAvg: 0
    };
    this.history = []; // Keep last 100 latency events
  }

  recordWorkflowResult(success) {
    this.metrics.totalWorkflows++;
    if (success) this.metrics.successfulWorkflows++;
    else this.metrics.failedWorkflows++;
  }

  recordToolResult(success) {
    this.metrics.totalToolCalls++;
    if (success) this.metrics.toolSuccesses++;
    else this.metrics.toolFailures++;
  }

  recordLLMLatency(durationMs) {
    this.metrics.totalLLMCalls++;
    
    // Moving average approximation
    if (this.metrics.totalLLMCalls === 1) {
      this.metrics.llmLatencyAvg = durationMs;
    } else {
      this.metrics.llmLatencyAvg = 
        (this.metrics.llmLatencyAvg * (this.metrics.totalLLMCalls - 1) + durationMs) / this.metrics.totalLLMCalls;
    }

    this.history.push({ timestamp: Date.now(), latency: durationMs });
    if (this.history.length > 100) this.history.shift();
  }

  getHealthStatus() {
    const llmStatus = this.metrics.llmLatencyAvg > 5000 ? 'Degraded' : 'Healthy';
    const toolSuccessRate = this.metrics.totalToolCalls > 0 
      ? (this.metrics.toolSuccesses / this.metrics.totalToolCalls * 100).toFixed(1) + '%' 
      : 'N/A';
    
    return {
      status: llmStatus === 'Healthy' && this.metrics.failedWorkflows < this.metrics.successfulWorkflows ? 'Healthy' : 'Degraded',
      llmStatus,
      toolSuccessRate,
      metrics: this.metrics
    };
  }
}

module.exports = new HealthMonitor();
