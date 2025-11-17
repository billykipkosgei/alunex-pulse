const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
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
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
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
    categories: [{
        name: String,
        description: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate budget utilization
departmentSchema.methods.getBudgetUtilization = function() {
    if (this.budget.allocated === 0) return 0;
    return (this.budget.spent / this.budget.allocated) * 100;
};

module.exports = mongoose.model('Department', departmentSchema);
