const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Task = require('../models/Task.model');

// Get all tasks
router.get('/', protect, async (req, res) => {
    try {
        const { project, status } = req.query;
        const query = {};
        if (project) query.project = project;
        if (status) query.status = status;

        const tasks = await Task.find(query)
            .populate('project', 'name')
            .populate('assignedTo', 'name email')
            .populate('department', 'name');
        res.json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create task
router.post('/', protect, async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update task
router.put('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ success: true, task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete task
router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
