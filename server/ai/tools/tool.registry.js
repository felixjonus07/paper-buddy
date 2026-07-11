const fs = require('fs');
const path = require('path');

class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(toolDef) {
    const requiredFields = ['name', 'description', 'executor'];
    for (const field of requiredFields) {
      if (!toolDef[field]) throw new Error(`Tool missing required field: ${field}`);
    }
    
    const enrichedDef = {
      ...toolDef,
      inputSchema: toolDef.inputSchema || {},
      outputSchema: toolDef.outputSchema || {},
      permissions: toolDef.permissions || [],
      riskLevel: toolDef.riskLevel || 'low',
      confirmationRequired: toolDef.confirmationRequired || false,
      category: toolDef.category || 'general',
      dependencies: toolDef.dependencies || [],
      canRollback: typeof toolDef.rollbackHandler === 'function',
      rollbackHandler: toolDef.rollbackHandler || null
    };

    this.tools.set(enrichedDef.name, enrichedDef);
    console.log(`[ToolRegistry] Registered tool: ${enrichedDef.name} | Rollback: ${enrichedDef.canRollback}`);
  }

  discoverTools(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.endsWith('.js') && file !== 'tool.registry.js') {
        const toolDef = require(path.join(dirPath, file));
        if (toolDef.name) {
          this.register(toolDef);
        }
      }
    }
  }

  getTool(name) {
    return this.tools.get(name);
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  getNativeToolsFormat() {
    return this.getAllTools().map(t => ({
      name: t.name,
      description: t.description,
      parameters: {
        type: 'OBJECT',
        properties: t.inputSchema.properties || {},
        required: t.inputSchema.required || []
      }
    }));
  }
}

const registry = new ToolRegistry();
registry.discoverTools(__dirname);

module.exports = registry;
