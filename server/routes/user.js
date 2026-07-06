const express = require('express');
const router = express.Router();
const { getMyFees } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/fees', protect, getMyFees);

module.exports = router;
