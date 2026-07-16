class PolicyEngine {
  /**
   * Returns institutional policies.
   */
  getPolicies() {
    return `
[INSTITUTIONAL POLICIES]
- Only Super Admin can delete fees.
- Only Accountant can refund payments.
- Only Admin can create users.
- Only Finance can close fee collections.
    `.trim();
  }

  /**
   * Validates if a user role can perform a general action category
   */
  canPerform(role, actionCategory) {
    if (role === 'admin') return true; // simplified for now
    return false;
  }
}

module.exports = new PolicyEngine();
