class TerminologyEngine {
  constructor() {
    this.synonyms = {
      'CS': 'Computer Science',
      'CSE': 'Computer Science',
      'AI': 'Artificial Intelligence',
      'Invoice': 'Fee',
      'Charge': 'Fee',
      'Dues': 'Fee',
      'Candidate': 'Student',
      'Learner': 'Student',
      'Accommodation': 'Hostel',
      'Residence': 'Hostel'
    };
  }

  /**
   * Replaces known domain acronyms/synonyms in user messages
   */
  normalize(userMessage) {
    let normalized = userMessage;
    // Basic word replacement for prompt enrichment, in a real system we'd use NLP
    Object.keys(this.synonyms).forEach(key => {
      const regex = new RegExp(`\\\\b${key}\\\\b`, 'gi');
      normalized = normalized.replace(regex, `${this.synonyms[key]} (mapped from ${key})`);
    });
    return normalized;
  }
}

module.exports = new TerminologyEngine();
