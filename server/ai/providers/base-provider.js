class BaseProvider {
  constructor(apiKey) {
    if (new.target === BaseProvider) {
      throw new TypeError("Cannot construct BaseProvider instances directly");
    }
    this.apiKey = apiKey;
  }

  /**
   * Initialize the provider
   */
  initialize() {
    throw new Error("Method 'initialize()' must be implemented.");
  }

  /**
   * Generate a response for the given messages
   * @param {Array} messages - Array of message objects { role: 'user' | 'assistant' | 'system', content: string }
   * @param {Object} options - Options like temperature, tools, etc.
   * @returns {Promise<String>} Response text
   */
  async generateResponse(messages, options = {}) {
    throw new Error("Method 'generateResponse()' must be implemented.");
  }

  /**
   * Generate a streaming response for the given messages
   * @param {Array} messages 
   * @param {Object} options 
   * @returns {AsyncGenerator} Yields text chunks
   */
  async *generateStream(messages, options = {}) {
    throw new Error("Method 'generateStream()' must be implemented.");
  }
}

module.exports = BaseProvider;
