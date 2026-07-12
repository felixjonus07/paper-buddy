class KnowledgeCache {
  constructor() {
    this.cache = {};
    this.ttl = 60 * 60 * 1000; // 1 hour
    this.lastFetched = 0;
  }

  async getActiveContext() {
    if (Date.now() - this.lastFetched > this.ttl || !this.cache.context) {
      this.cache.context = await this._fetchFromDB();
      this.lastFetched = Date.now();
    }
    return this.cache.context;
  }

  async _fetchFromDB() {
    // In reality, this queries MongoDB for active semester, active groups, etc.
    return {
      currentSemester: 'Odd 2026',
      academicYear: '2026-2027',
      institutionSettings: {
        currency: 'INR',
        autoReminders: true
      }
    };
  }
}

module.exports = new KnowledgeCache();
