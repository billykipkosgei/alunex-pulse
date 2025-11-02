const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getChannels,
    getMessages,
    sendMessage,
    createChannel,
    deleteMessage,
    deleteChannel,
    updateMessage,
    updateChannel,
    getTotalUnreadCount
} = require('../controllers/chat.controller');

// Unread count route
router.get('/unread-count', protect, getTotalUnreadCount);

// Channel routes
router.get('/channels', protect, getChannels);
router.post('/channels', protect, createChannel);
router.put('/channels/:channelId', protect, updateChannel);
router.delete('/channels/:channelId', protect, deleteChannel);

// Message routes
router.get('/channels/:channelId/messages', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.put('/messages/:messageId', protect, updateMessage);
router.delete('/messages/:messageId', protect, deleteMessage);

module.exports = router;
