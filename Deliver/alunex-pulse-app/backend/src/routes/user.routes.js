const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// Get all users
router.get('/', protect, async (req, res) => {
    try {
        const User = require('../models/User.model');
        const users = await User.find({ organization: req.user.organization })
            .select('-password')
            .populate('department');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single user
router.get('/:id', protect, async (req, res) => {
    try {
        const User = require('../models/User.model');
        const user = await User.findOne({
            _id: req.params.id,
            organization: req.user.organization
        }).select('-password').populate('department');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
    try {
        const User = require('../models/User.model');
        const { name, email, phone, department } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (department !== undefined) user.department = department;

        await user.save();

        const updatedUser = await User.findById(user._id).select('-password').populate('department');
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Change password
router.put('/password', protect, async (req, res) => {
    try {
        const User = require('../models/User.model');
        const bcrypt = require('bcryptjs');
        const { currentPassword, newPassword } = req.body;

        console.log('Password change request:', {
            userId: req.user.id,
            hasCurrentPassword: !!currentPassword,
            hasNewPassword: !!newPassword
        });

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
            return res.status(400).json({ message: 'Password must be a string' });
        }

        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has a password set
        if (!user.password) {
            console.error('User has no password set:', req.user.id);
            return res.status(400).json({ message: 'User account has no password set. Please contact administrator.' });
        }

        console.log('User found, checking password...');

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', req.user.id);
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        console.log('Current password verified, updating password...');

        // Update password (pre-save hook will hash it automatically)
        user.password = newPassword;
        await user.save();

        console.log('Password updated successfully for user:', req.user.id);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update user role (Admin only)
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
    try {
        const User = require('../models/User.model');
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ message: 'Role is required' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        const updatedUser = await User.findById(user._id).select('-password').populate('department');
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const User = require('../models/User.model');

        // Prevent deleting yourself
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
