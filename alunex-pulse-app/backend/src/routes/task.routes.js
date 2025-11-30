const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Task = require('../models/Task.model');

// Get all tasks
router.get('/', protect, async (req, res) => {
    try {
        const { project, status } = req.query;
        const query = { organization: req.user.organization };
        if (project) query.project = project;
        if (status) query.status = status;

        const tasks = await Task.find(query)
            .populate({
                path: 'project',
                select: 'name department',
                populate: {
                    path: 'department',
                    select: 'name'
                }
            })
            .populate('assignedTo', 'name email')
            .populate('department', 'name');
        res.json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's assigned tasks by project (for time tracking)
router.get('/my-tasks/:projectId', protect, async (req, res) => {
    try {
        const SubTask = require('../models/SubTask.model');

        // Find all tasks for the specific project (not just assigned to user)
        // This allows time tracking on any task in the project
        const tasks = await Task.find({
            organization: req.user.organization,
            project: req.params.projectId
        })
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .select('_id title description status priority dueDate startDate');

        // For each task, fetch its sub-tasks
        const tasksWithSubTasks = await Promise.all(
            tasks.map(async (task) => {
                const subTasks = await SubTask.find({
                    parentTask: task._id,
                    organization: req.user.organization
                })
                    .populate('assignedTo', 'name email')
                    .select('_id title status assignedTo');
                
                return {
                    ...task.toObject(),
                    subTasks: subTasks || []
                };
            })
        );

        res.json({ success: true, tasks: tasksWithSubTasks });
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create task
router.post('/', protect, async (req, res) => {
    try {
        const task = await Task.create({
            ...req.body,
            organization: req.user.organization
        });

        // Send email notification to assigned users
        if (req.body.assignedTo && req.body.assignedTo.length > 0) {
            const User = require('../models/User.model');
            const emailService = require('../utils/emailService');

            const assignedUserIds = Array.isArray(req.body.assignedTo) ? req.body.assignedTo : [req.body.assignedTo];
            const assignedBy = await User.findById(req.user.id).select('name');

            for (const userId of assignedUserIds) {
                try {
                    const user = await User.findById(userId).select('name email preferences');

                    // Check if user has email notifications and task assignment notifications enabled
                    if (user && user.preferences?.notifications?.email && user.preferences?.notifications?.taskAssignments) {
                        await emailService.sendTaskAssignmentEmail(
                            user.email,
                            user.name,
                            task.title,
                            task.description,
                            assignedBy.name,
                            task.dueDate
                        );
                        console.log(`Task assignment notification sent to ${user.email}`);
                    }
                } catch (emailError) {
                    console.error(`Error sending task notification to user ${userId}:`, emailError);
                    // Continue with other notifications even if one fails
                }
            }
        }

        res.status(201).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update task
router.put('/:id', protect, async (req, res) => {
    try {
        const oldTask = await Task.findById(req.params.id);
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, organization: req.user.organization },
            req.body,
            { new: true, runValidators: true }
        );
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Send notification if assignees changed
        if (req.body.assignedTo) {
            const User = require('../models/User.model');
            const emailService = require('../utils/emailService');

            const newAssignedUserIds = Array.isArray(req.body.assignedTo) ? req.body.assignedTo : [req.body.assignedTo];
            const oldAssignedUserIds = oldTask.assignedTo.map(id => id.toString());
            const assignedBy = await User.findById(req.user.id).select('name');

            // Find newly assigned users
            const newlyAssignedIds = newAssignedUserIds.filter(id => !oldAssignedUserIds.includes(id));

            for (const userId of newlyAssignedIds) {
                try {
                    const user = await User.findById(userId).select('name email preferences');

                    if (user && user.preferences?.notifications?.email && user.preferences?.notifications?.taskAssignments) {
                        await emailService.sendTaskAssignmentEmail(
                            user.email,
                            user.name,
                            task.title,
                            task.description,
                            assignedBy.name,
                            task.dueDate
                        );
                        console.log(`Task re-assignment notification sent to ${user.email}`);
                    }
                } catch (emailError) {
                    console.error(`Error sending task notification to user ${userId}:`, emailError);
                }
            }
        }

        res.json({ success: true, task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete task
router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            organization: req.user.organization
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
