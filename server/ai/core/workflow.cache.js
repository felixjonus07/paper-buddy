const crypto = require('crypto');

class WorkflowCache {
  constructor() {
    this.cache = new Map();
  }

  _generateKey(toolName, args) {
    const hash = crypto.createHash('md5').update(JSON.stringify(args)).digest('hex');
    return `${toolName}_${hash}`;
  }

  get(toolName, args) {
    const key = this._generateKey(toolName, args);
    if (this.cache.has(key)) {
      console.log(`[WorkflowCache] Cache HIT for ${toolName}`);
      return this.cache.get(key);
    }
    return null;
  }

  set(toolName, args, result) {
    const key = this._generateKey(toolName, args);
    this.cache.set(key, result);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = new WorkflowCache();
