const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { sendInvitationEmail } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Only admin can set role or invite users
        // If a role is specified or headers contain auth token, require admin authorization
        if (role || req.headers.authorization) {
            // This is an invitation by admin, verify admin authorization
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({
                    message: 'Only administrators can invite users or assign roles'
                });
            }
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'team_member',
            department: department || null
        });

        // If this is an admin invitation, send welcome email
        if (req.user && req.user.role === 'admin') {
            try {
                await sendInvitationEmail(email, name, password, req.user.name);
            } catch (emailError) {
                console.error('Failed to send invitation email:', emailError);
                // Don't fail the registration if email fails
            }
        }

        // Generate token
        const token = generateToken(user._id);

        const populatedUser = await User.findById(user._id).populate('department');

        res.status(201).json({
            success: true,
            token,
            user: {
                id: populatedUser._id,
                name: populatedUser.name,
                email: populatedUser.email,
                role: populatedUser.role,
                department: populatedUser.department,
                initials: populatedUser.getInitials()
            },
            emailSent: req.user && req.user.role === 'admin' // Indicate if email was sent
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if password matches
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ message: 'User account is inactive' });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                initials: user.getInitials(),
                department: user.department,
                avatar: user.avatar,
                preferences: user.preferences
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('department');

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                initials: user.getInitials(),
                department: user.department,
                avatar: user.avatar,
                phone: user.phone,
                timezone: user.timezone,
                country: user.country,
                preferences: user.preferences
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            phone: req.body.phone,
            timezone: req.body.timezone,
            country: req.body.country,
            avatar: req.body.avatar
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key =>
            fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                initials: user.getInitials(),
                phone: user.phone,
                timezone: user.timezone,
                country: user.country,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (req.body.theme) {
            user.preferences.theme = req.body.theme;
        }

        if (req.body.notifications) {
            user.preferences.notifications = {
                ...user.preferences.notifications,
                ...req.body.notifications
            };
        }

        await user.save();

        res.status(200).json({
            success: true,
            preferences: user.preferences
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Setup initial admin user - only works if no admin exists
exports.setupAdmin = async (req, res) => {
    try {
        // Check if any admin user already exists
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            return res.status(400).json({
                message: 'Admin user already exists. Please use login instead.'
            });
        }

        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please provide name, email, and password'
            });
        }

        // Create admin user
        const adminUser = await User.create({
            name,
            email,
            password,
            role: 'admin',
            isActive: true
        });

        // Generate token
        const token = generateToken(adminUser._id);

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            token,
            user: {
                id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
                initials: adminUser.getInitials()
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
