const mongoose = require('mongoose');

const timeTrackingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    subTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubTask'
    },
    description: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number,
        default: 0
    },
    isRunning: {
        type: Boolean,
        default: false
    },
    billable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate duration when ending a timer
timeTrackingSchema.pre('save', function(next) {
    if (this.endTime && this.startTime && !this.isRunning) {
        this.duration = Math.floor((this.endTime - this.startTime) / 1000);
    }
    next();
});

const TimeTracking = mongoose.model('TimeTracking', timeTrackingSchema);

module.exports = TimeTracking;
