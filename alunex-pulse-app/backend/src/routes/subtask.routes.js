const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const SubTask = require('../models/SubTask.model');
const Task = require('../models/Task.model');

// Get all sub-tasks for a parent task
router.get('/task/:taskId', protect, async (req, res) => {
    try {
        const subTasks = await SubTask.find({ parentTask: req.params.taskId })
            .populate('assignedTo', 'name email')
            .sort('order');
        res.json({ success: true, subTasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create sub-task
router.post('/', protect, async (req, res) => {
    try {
        const subTask = await SubTask.create(req.body);
        
        // Recalculate parent task progress
        const parentTask = await Task.findById(subTask.parentTask);
        if (parentTask) {
            await parentTask.calculateProgress();
        }
        
        const populatedSubTask = await SubTask.findById(subTask._id)
            .populate('assignedTo', 'name email');
        
        res.status(201).json({ success: true, subTask: populatedSubTask });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update sub-task
router.put('/:id', protect, async (req, res) => {
    try {
        const subTask = await SubTask.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('assignedTo', 'name email');
        
        if (!subTask) {
            return res.status(404).json({ message: 'Sub-task not found' });
        }
        
        // Recalculate parent task progress
        const parentTask = await Task.findById(subTask.parentTask);
        if (parentTask) {
            await parentTask.calculateProgress();
        }
        
        res.json({ success: true, subTask });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete sub-task
router.delete('/:id', protect, async (req, res) => {
    try {
        const subTask = await SubTask.findByIdAndDelete(req.params.id);
        
        if (!subTask) {
            return res.status(404).json({ message: 'Sub-task not found' });
        }
        
        // Recalculate parent task progress
        const parentTask = await Task.findById(subTask.parentTask);
        if (parentTask) {
            await parentTask.calculateProgress();
        }
        
        res.json({ success: true, message: 'Sub-task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
