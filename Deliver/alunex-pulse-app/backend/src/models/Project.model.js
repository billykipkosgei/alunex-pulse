const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true
    },
    code: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Organization is required']
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
    spendDocumentation: {
        excelFile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'File'
        },
        documentLink: {
            type: String,
            trim: true
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date
        },
        notes: {
            type: String,
            trim: true
        }
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
    clientName: {
        type: String,
        trim: true
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
