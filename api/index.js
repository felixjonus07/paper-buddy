const app = require('../server/server.js');
const { connectDB, isConnected } = require('../server/config/db');

module.exports = async (req, res) => {
  if (!isConnected()) {
    const ok = await connectDB();
    if (!ok) {
      return res.status(500).json({
        message: 'Database connection failed. Ensure DATABASE_URL is set in deployment environment.',
      });
    }
  }

  return app(req, res);
};
