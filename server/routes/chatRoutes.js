// routes/chatRoutes.js - AI Chatbot & History Endpoints
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat/message - Send prompt to AI & get matching workers
router.post('/message', chatController.handleChatMessage);

// GET /api/chat/history - Get past chat conversations
router.get('/history', chatController.getChatHistory);

// POST /api/chat/history - Save/update chat conversation
router.post('/history', chatController.saveChatHistory);

// DELETE /api/chat/history/:id - Delete chat conversation
router.delete('/history/:id', chatController.deleteChatHistory);

module.exports = router;
