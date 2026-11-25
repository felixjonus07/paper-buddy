const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
const express = require('express');
const cors = require('cors');
const { connectDB, isConnected } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('EduFin API is running...');
});

// Import Routes
const authRoutes = require('./routes/auth');
const loanRoutes = require('./routes/loans');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const chatbotRoutes = require('./routes/chatbot');
const cashierRoutes = require('./routes/cashier');
const aiRoutes = require('./routes/ai.routes');
const mentorRoutes = require('./routes/mentor');
const superadminRoutes = require('./routes/superadmin');

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/cashier', cashierRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/superadmin', superadminRoutes);

// Connect to Supabase Postgres on startup in non-serverless environments
if (!process.env.VERCEL) {
  connectDB();
}

app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    dbState: isConnected() ? 'connected' : 'disconnected',
    uriSet: !!process.env.DATABASE_URL,
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
