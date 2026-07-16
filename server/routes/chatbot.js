// server/routes/chatbot.js
const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatbotController');

router.post('/chat', chat);

module.exports = router;
