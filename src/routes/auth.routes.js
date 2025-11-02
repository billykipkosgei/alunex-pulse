const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, updatePreferences } = require('../controllers/auth.controller');
const { protect, optionalProtect } = require('../middleware/auth.middleware');

// Public routes (optionalProtect allows admin to invite users)
router.post('/register', optionalProtect, register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);

module.exports = router;
