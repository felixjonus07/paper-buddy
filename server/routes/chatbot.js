// server/routes/chatbot.js
const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, chat);

module.exports = router;
