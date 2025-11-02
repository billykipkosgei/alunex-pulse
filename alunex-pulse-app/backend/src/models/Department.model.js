const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        trim: true
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
