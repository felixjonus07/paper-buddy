class KnowledgeEngine {
  /**
   * Returns domain descriptions for the prompt
   */
  getDomainDictionary() {
    return `
[DOMAIN ENTITIES]
Student: A User with role='user'. Belongs to one or more Groups.
Group: A logical collection of Students (e.g., 'Third Year CSE').
FeeType: A category of fee (e.g., 'Hostel', 'Tuition').
Fee: A master template defining the title and base amount.
StudentFee: The actual assignment of a Fee to a Student. Tracks pending/paid status.
Payment: A transaction attempting to settle a StudentFee.
Receipt: Generated upon a successful Payment.

[DOMAIN RELATIONSHIPS]
- One Group contains many Students.
- One Fee can be assigned to many Students.
- One Student may have multiple StudentFees.
- One Payment belongs to one StudentFee.
    `.trim();
  }
}

module.exports = new KnowledgeEngine();
