const BaseProvider = require('./base-provider');
const OpenAI = require('openai');

class GrokProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.client = null;
    this.model = 'grok-beta'; // adjust model name based on current xAI API
  }

  initialize() {
    if (!this.apiKey) {
      throw new Error('Grok API Key is missing');
    }
    // Grok API is OpenAI compatible, so we can use the OpenAI SDK with the custom base URL
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: 'https://api.x.ai/v1',
    });
  }

  async generateResponse(messages, options = {}) {
    if (!this.client) this.initialize();

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages,
      temperature: options.temperature || 0.7,
      stream: false,
    });

    return response.choices[0].message.content;
  }

  async *generateStream(messages, options = {}) {
    if (!this.client) this.initialize();

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: messages,
      temperature: options.temperature || 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  }
}

module.exports = GrokProvider;
