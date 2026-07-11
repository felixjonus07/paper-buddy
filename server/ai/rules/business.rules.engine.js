class BusinessRulesEngine {
  /**
   * Returns a list of strict business rules for the LLM to follow during reasoning.
   */
  getRules() {
    return `
[BUSINESS RULES]
1. Hostel Fee can only be assigned to hostel students.
2. Transport Fee can only be assigned to transport users.
3. Cannot assign the exact same fee twice to a student.
4. Cannot create duplicate groups.
5. Cannot delete paid fees.
6. Cannot refund already refunded payments.
7. Cannot assign inactive students to new fees.
8. Cannot assign fees to archived groups.
9. Cannot create payment links for cancelled fees.
    `.trim();
  }
}

module.exports = new BusinessRulesEngine();
