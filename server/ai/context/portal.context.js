class PortalContext {
  /**
   * Loads current state of the portal to enrich AI prompt.
   * In a real implementation, this queries MongoDB for active semester, 
   * group counts, fee structures, etc.
   */
  async loadContext() {
    // Mocked data for current portal state
    return {
      currentAcademicYear: '2026-2027',
      currentSemester: 'Odd',
      departments: ['Computer Science', 'Mechanical', 'Civil', 'Electronics'],
      activeGroupsCount: 14,
      systemStatus: 'Operational',
      portalSettings: {
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        autoEmailReminders: true
      }
    };
  }

  formatForPrompt(contextData) {
    return `[PORTAL CONTEXT]\\n${JSON.stringify(contextData, null, 2)}`;
  }
}

module.exports = new PortalContext();
