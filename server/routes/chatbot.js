// server/routes/chatbot.js
const express = require('express');
const router = express.Router();
const { chat, getStatus } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, chat);
router.get('/status', protect, getStatus);

module.exports = router;
