const app = require('../server/server.js');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      // Try connecting to the database before processing the request
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edufin', {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Connected to MongoDB from serverless handler');
    } catch (err) {
      console.error('Serverless DB Connection Error:', err.message);
      return res.status(500).json({ 
        message: 'Database connection failed. Ensure MONGO_URI is set in deployment environment.' 
      });
    }
  }
  
  return app(req, res);
};
