const AgentStates = {
  IDLE: 'Idle',
  THINKING: 'Thinking',
  REASONING: 'Reasoning',
  PLANNING: 'Planning',
  SELECTING_TOOL: 'Selecting Tool',
  EXECUTING: 'Executing',
  OBSERVING: 'Observing',
  WAITING_CONFIRMATION: 'Waiting Confirmation',
  RETRYING: 'Retrying',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled'
};

class AgentState {
  constructor(conversationId) {
    this.conversationId = conversationId;
    this.currentState = AgentStates.IDLE;
    this.callbacks = [];
  }

  onStateChange(callback) {
    this.callbacks.push(callback);
  }

  transition(newState, payload = {}) {
    console.log(`[AgentState][${this.conversationId}] Transitioning: ${this.currentState} -> ${newState}`);
    this.currentState = newState;
    
    // Notify listeners (e.g., SSE stream controller)
    for (const cb of this.callbacks) {
      try {
        cb(this.currentState, payload);
      } catch (e) {
        console.error('State callback error', e);
      }
    }
  }

  getState() {
    return this.currentState;
  }
}

module.exports = {
  AgentStates,
  AgentState
};
