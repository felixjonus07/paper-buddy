const EventEmitter = require('events');

class BusinessEventSystem extends EventEmitter {
  constructor() {
    super();
    this.on('WorkflowCompleted', (data) => {
      console.log(`[EventSystem] Workflow Completed: ${data.conversationId}`);
      // Future: Trigger webhooks, audit logs, etc.
    });
    
    this.on('FeeAssigned', (data) => {
      console.log(`[EventSystem] Fee Assigned: ${data.feeId}`);
    });
  }

  emitEvent(eventName, payload) {
    this.emit(eventName, payload);
  }
}

module.exports = new BusinessEventSystem();
