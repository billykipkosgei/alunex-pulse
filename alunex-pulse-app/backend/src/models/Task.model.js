const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    status: {
        type: String,
        enum: ['todo', 'in_progress', 'completed', 'blocked'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    category: {
        type: String,
        default: ''
    },
    dueDate: {
        type: Date
    },
    startDate: {
        type: Date
    },
    completedDate: {
        type: Date
    },
    estimatedHours: {
        type: Number,
        default: 0
    },
    actualHours: {
        type: Number,
        default: 0
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    attachments: [{
        name: String,
        url: String,
        type: String,
        size: Number,
        uploadedAt: Date
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Calculate task completion percentage
taskSchema.methods.isOverdue = function() {
    return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
};

module.exports = mongoose.model('Task', taskSchema);
