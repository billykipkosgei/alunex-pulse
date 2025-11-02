const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Project = require('../models/Project.model');

// Get all projects
router.get('/', protect, async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('manager', 'name email')
            .populate('team.user', 'name email')
            .populate('client', 'name email');
        res.json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create project
router.post('/', protect, async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single project
router.get('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('manager', 'name email')
            .populate('team.user', 'name email')
            .populate('client', 'name email');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update project
router.put('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ success: true, project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
