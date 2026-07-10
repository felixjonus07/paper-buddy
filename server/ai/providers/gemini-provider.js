const BaseProvider = require('./base-provider');
const { GoogleGenAI } = require('@google/genai');
const toolRegistry = require('../tools/tool.registry');

class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.client = null;
    this.model = 'gemini-2.5-flash'; 
  }

  initialize() {
    if (!this.apiKey) throw new Error('Gemini API Key is missing');
    this.client = new GoogleGenAI({ apiKey: this.apiKey });
  }

  _formatMessages(messages) {
    let systemInstruction = '';
    const contents = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction += msg.content + '\\n';
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }
    return { systemInstruction, contents };
  }

  _getConfig(options) {
    const config = { temperature: options.temperature || 0.7 };
    
    // Inject native tools if requested
    if (options.useTools) {
      const nativeTools = toolRegistry.getNativeToolsFormat();
      if (nativeTools.length > 0) {
        config.tools = [{ functionDeclarations: nativeTools }];
      }
    }
    
    // Set specific response schema if requested (e.g. JSON for reasoning)
    if (options.responseSchema) {
      config.responseMimeType = 'application/json';
      config.responseSchema = options.responseSchema;
    }

    return config;
  }

  async generateResponse(messages, options = {}) {
    if (!this.client) this.initialize();
    
    const { systemInstruction, contents } = this._formatMessages(messages);
    const config = this._getConfig(options);
    config.systemInstruction = systemInstruction;

    const response = await this.client.models.generateContent({
      model: this.model,
      contents,
      config
    });

    return response.text;
  }

  async *generateStream(messages, options = {}) {
    if (!this.client) this.initialize();
    
    const { systemInstruction, contents } = this._formatMessages(messages);
    const config = this._getConfig(options);
    config.systemInstruction = systemInstruction;

    const responseStream = await this.client.models.generateContentStream({
      model: this.model,
      contents,
      config
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
}

module.exports = GeminiProvider;
