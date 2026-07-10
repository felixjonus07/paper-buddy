const policyEngine = require('./policy.engine');
const businessRules = require('./business.rules.engine');

class ValidationEngine {
  /**
   * Pre-validates the user intent against policies before even starting the workflow
   */
  async validate(intent, userRole) {
    console.log(`[ValidationEngine] Validating intent: ${intent}`);
    
    // Example: Block non-admins from running high-risk workflows
    if (intent.toLowerCase().includes('delete') || intent.toLowerCase().includes('assign')) {
      if (!policyEngine.canPerform(userRole, 'manage')) {
        return { 
          valid: false, 
          error: "POLICY_VIOLATION", 
          message: "You are not authorized to perform assignments or deletions." 
        };
      }
    }

    return { valid: true };
  }
}

module.exports = new ValidationEngine();
