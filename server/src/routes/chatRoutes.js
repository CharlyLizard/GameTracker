const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const uploadChatFile = require('../middlewares/uploadChatFileMiddleware');
const { getChatHistory, uploadChatFile: uploadChatFileController } = require('../controllers/chatController');

// GET /api/chat/history/:friendId
router.get('/history/:friendId', authMiddleware, getChatHistory);

// POST /api/chat/upload
router.post(
  '/upload',
  authMiddleware,
  uploadChatFile.single('file'),
  uploadChatFileController
);

module.exports = router;