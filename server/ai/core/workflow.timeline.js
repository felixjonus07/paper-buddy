class WorkflowTimeline {
  constructor(conversationId) {
    this.conversationId = conversationId;
    this.events = [];
    this.startTime = Date.now();
  }

  addEvent(type, details) {
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      timeOffsetMs: Date.now() - this.startTime,
      type,
      ...details
    };
    this.events.push(event);
    return event.id;
  }

  updateEvent(eventId, updates) {
    const idx = this.events.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      this.events[idx] = { ...this.events[idx], ...updates };
    }
  }

  getCompletedTools() {
    return this.events.filter(e => e.type === 'tool_execution' && e.status === 'success');
  }

  getTimeline() {
    return {
      conversationId: this.conversationId,
      startTime: new Date(this.startTime).toISOString(),
      totalDurationMs: Date.now() - this.startTime,
      events: this.events
    };
  }
}

module.exports = WorkflowTimeline;
