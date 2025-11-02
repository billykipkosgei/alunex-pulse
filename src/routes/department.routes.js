const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Department = require('../models/Department.model');

// Get all departments
router.get('/', protect, async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true })
            .populate('head', 'name email')
            .populate('members', 'name email role');
        res.json({ success: true, departments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create department
router.post('/', protect, async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json({ success: true, department });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single department
router.get('/:id', protect, async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('head', 'name email')
            .populate('members', 'name email role');
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json({ success: true, department });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update department
router.put('/:id', protect, async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json({ success: true, department });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
