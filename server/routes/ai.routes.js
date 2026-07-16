const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// router.use(verifyToken);

router.post('/chat', aiController.chat);
router.post('/chat/confirm', aiController.confirm);
router.post('/chat/stream', aiController.chatStream);

module.exports = router;
