const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, updatePreferences, setupAdmin } = require('../controllers/auth.controller');
const { protect, optionalProtect } = require('../middleware/auth.middleware');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

// Public routes (optionalProtect allows admin to invite users)
router.post('/setup-admin', setupAdmin);
router.post('/register', optionalProtect, register);
router.post('/login', login);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: process.env.FRONTEND_URL + '/login?error=google_auth_failed',
        session: false
    }),
    (req, res) => {
        console.log('🔷🔷🔷 GOOGLE CALLBACK ROUTE HIT 🔷🔷🔷');
        console.log('User from passport:', req.user ? 'EXISTS' : 'MISSING');
        if (req.user) {
            console.log('User ID:', req.user._id);
            console.log('User Email:', req.user.email);
            console.log('User Role:', req.user.role);
            console.log('User Organization:', req.user.organization);
        }

        // Generate JWT token
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        });
        console.log('✅ JWT Token generated');
        console.log('Redirecting to:', process.env.FRONTEND_URL + '/login?token=...');
        console.log('🔷🔷🔷 END GOOGLE CALLBACK 🔷🔷🔷');

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    }
);

// Microsoft OAuth routes
router.get('/microsoft',
    passport.authenticate('microsoft', {
        scope: ['user.read'],
        session: false
    })
);

router.get('/microsoft/callback',
    passport.authenticate('microsoft', {
        failureRedirect: process.env.FRONTEND_URL + '/login?error=microsoft_auth_failed',
        session: false
    }),
    (req, res) => {
        console.log('🟢🟢🟢 MICROSOFT CALLBACK ROUTE HIT 🟢🟢🟢');
        console.log('User from passport:', req.user ? 'EXISTS' : 'MISSING');
        if (req.user) {
            console.log('User ID:', req.user._id);
            console.log('User Email:', req.user.email);
            console.log('User Role:', req.user.role);
            console.log('User Organization:', req.user.organization);
        }

        // Generate JWT token
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        });
        console.log('✅ JWT Token generated');
        console.log('Redirecting to:', process.env.FRONTEND_URL + '/login?token=...');
        console.log('🟢🟢🟢 END MICROSOFT CALLBACK 🟢🟢🟢');

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    }
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);

module.exports = router;
