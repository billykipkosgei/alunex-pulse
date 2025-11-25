const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Organization = require('../models/Organization.model');
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
        const { name, email, password, role, department, organizationName } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Determine if this is a public registration or admin invitation
        const isPublicRegistration = !req.user; // No authenticated user = public registration

        let organizationId;
        let userRole;

        if (isPublicRegistration) {
            // PUBLIC REGISTRATION: Create new organization and make user admin
            userRole = 'admin';

            // Create organization name from user's name if not provided
            const orgName = organizationName || `${name}'s Workspace`;

            const organization = await Organization.create({
                name: orgName,
                owner: null // Will be updated after user creation
            });

            organizationId = organization._id;
        } else {
            // ADMIN INVITATION: Add user to admin's organization
            // Only admin can invite users
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    message: 'Only administrators can invite users'
                });
            }

            // User joins the admin's organization
            organizationId = req.user.organization;
            userRole = role || 'team_member';
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            organization: organizationId,
            role: userRole,
            department: department || null
        });

        // If this was a public registration, update organization owner
        if (isPublicRegistration) {
            await Organization.findByIdAndUpdate(organizationId, {
                owner: user._id
            });
        }

        // If this is an admin invitation, send welcome email
        let emailSent = false;
        if (req.user && req.user.role === 'admin') {
            // Check if email service is configured (Resend or SMTP)
            const hasEmailService = process.env.RESEND_API_KEY ||
                                   (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

            if (hasEmailService) {
                try {
                    await sendInvitationEmail(email, name, password, req.user.name);
                    emailSent = true;
                    console.log(`Invitation email sent to ${email}`);
                } catch (emailError) {
                    console.error('Failed to send invitation email:', emailError.message);
                    // Don't fail the registration if email fails
                }
            } else {
                console.log('No email service configured (Resend or SMTP), skipping email notification');
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
            emailSent // Indicate if email was actually sent
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

        const { name, email, password, organizationName } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please provide name, email, and password'
            });
        }

        // Create organization first
        const orgName = organizationName || `${name}'s Organization`;
        const organization = await Organization.create({
            name: orgName,
            owner: null // Will be updated after user creation
        });

        // Create admin user
        const adminUser = await User.create({
            name,
            email,
            password,
            organization: organization._id,
            role: 'admin',
            isActive: true
        });

        // Update organization owner
        await Organization.findByIdAndUpdate(organization._id, {
            owner: adminUser._id
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
                organization: organization._id,
                initials: adminUser.getInitials()
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Forgot password - Request password reset
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({ message: 'Please provide your email address' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Return success even if user doesn't exist (security best practice)
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        // Check if user uses OAuth (Google/Microsoft)
        if (user.authProvider !== 'local') {
            return res.status(400).json({
                message: `This account uses ${user.authProvider} authentication. Please sign in with ${user.authProvider}.`
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash the token before saving to database
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

        await user.save();

        // Send reset email
        try {
            await sendPasswordResetEmail(user.email, user.name, resetToken);

            res.status(200).json({
                success: true,
                message: 'Password reset email sent successfully'
            });
        } catch (emailError) {
            // If email fails, remove the reset token
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            console.error('Error sending password reset email:', emailError);
            return res.status(500).json({
                message: 'Email could not be sent. Please try again later.'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Reset password - Set new password with token
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Validate input
        if (!token || !password) {
            return res.status(400).json({ message: 'Please provide token and new password' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Hash the token to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        // Generate new JWT token
        const jwtToken = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                initials: user.getInitials()
            }
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: error.message });
    }
};
