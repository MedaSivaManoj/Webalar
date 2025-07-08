const express = require('express');
const router = express.Router();
const { shareBoard, getPublicBoard, getShareStatus } = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

// Authenticated routes
router.post('/share', protect, shareBoard);
router.get('/share', protect, getShareStatus);

// Public route
router.get('/public/:publicId', getPublicBoard);

module.exports = router;
