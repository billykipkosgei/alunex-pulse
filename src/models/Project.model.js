const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
        default: 'planning'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    budget: {
        allocated: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        currency: { type: String, default: 'USD' }
    },
    profitMargin: {
        type: Number,
        default: 0
    },
    country: {
        type: String,
        default: ''
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    team: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: String
    }],
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Calculate budget utilization percentage
projectSchema.methods.getBudgetUtilization = function() {
    if (this.budget.allocated === 0) return 0;
    return (this.budget.spent / this.budget.allocated) * 100;
};

module.exports = mongoose.model('Project', projectSchema);
