const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Organization is required']
    },
    password: {
        type: String,
        minlength: 6,
        select: false
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'microsoft'],
        default: 'local'
    },
    providerId: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'team_member', 'client'],
        default: 'team_member'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    avatar: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    country: {
        type: String,
        default: ''
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            taskAssignments: { type: Boolean, default: true },
            projectUpdates: { type: Boolean, default: true },
            chatMessages: { type: Boolean, default: true },
            budgetAlerts: { type: Boolean, default: true }
        }
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Skip password hashing if password is not provided or not modified
    if (!this.password || !this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get initials for avatar
userSchema.methods.getInitials = function() {
    return this.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

module.exports = mongoose.model('User', userSchema);
