const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Meeting = require('../models/Meeting.model');

// Get all meetings
router.get('/', protect, async (req, res) => {
    try {
        const { filter, project } = req.query;
        const userId = req.user.id;

        let query = {
            $or: [
                { organizer: userId },
                { participants: userId }
            ]
        };

        // Filter by project if specified
        if (project && project !== 'all') {
            query.project = project;
        }

        // Filter by status/time
        const now = new Date();
        if (filter === 'upcoming') {
            query.scheduledTime = { $gte: now };
            query.status = 'scheduled';
        } else if (filter === 'past') {
            query.$or = [
                { scheduledTime: { $lt: now }, status: 'scheduled' },
                { status: 'completed' }
            ];
        } else if (filter === 'ongoing') {
            query.status = 'ongoing';
        }

        const meetings = await Meeting.find(query)
            .populate('organizer', 'name email')
            .populate('participants', 'name email')
            .populate('project', 'name')
            .sort({ scheduledTime: -1 });

        res.json({ success: true, meetings });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ message: 'Error fetching meetings' });
    }
});

// Get a specific meeting
router.get('/:id', protect, async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate('organizer', 'name email')
            .populate('participants', 'name email')
            .populate('project', 'name');

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.json({ success: true, meeting });
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({ message: 'Error fetching meeting' });
    }
});

// Create a scheduled meeting
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, scheduledTime, duration, participants, project } = req.body;
        const userId = req.user.id;

        if (!title || !scheduledTime) {
            return res.status(400).json({ message: 'Title and scheduled time are required' });
        }

        // Generate unique meeting ID
        const meetingId = `alunex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const meetingLink = `https://meet.jit.si/${meetingId}`;

        const meeting = await Meeting.create({
            title,
            description: description || '',
            meetingId,
            scheduledTime: new Date(scheduledTime),
            duration: duration || 60,
            organizer: userId,
            participants: participants || [],
            project: project || null,
            status: 'scheduled',
            meetingLink
        });

        const populatedMeeting = await Meeting.findById(meeting._id)
            .populate('organizer', 'name email')
            .populate('participants', 'name email')
            .populate('project', 'name');

        res.status(201).json({ success: true, meeting: populatedMeeting });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ message: 'Error creating meeting' });
    }
});

// Create instant meeting
router.post('/instant', protect, async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user.id;

        // Generate unique meeting ID
        const meetingId = `alunex-instant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const meetingLink = `https://meet.jit.si/${meetingId}`;

        const meeting = await Meeting.create({
            title: title || 'Instant Meeting',
            description: 'Quick instant meeting',
            meetingId,
            scheduledTime: new Date(),
            duration: 60,
            organizer: userId,
            participants: [],
            status: 'ongoing',
            meetingLink
        });

        const populatedMeeting = await Meeting.findById(meeting._id)
            .populate('organizer', 'name email')
            .populate('participants', 'name email')
            .populate('project', 'name');

        res.status(201).json({ success: true, meeting: populatedMeeting });
    } catch (error) {
        console.error('Error creating instant meeting:', error);
        res.status(500).json({ message: 'Error creating instant meeting' });
    }
});

// Update meeting
router.put('/:id', protect, async (req, res) => {
    try {
        const { title, description, scheduledTime, duration, participants, status, project } = req.body;

        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Only organizer can update
        if (meeting.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only organizer can update this meeting' });
        }

        // Update fields
        if (title) meeting.title = title;
        if (description !== undefined) meeting.description = description;
        if (scheduledTime) meeting.scheduledTime = new Date(scheduledTime);
        if (duration) meeting.duration = duration;
        if (participants) meeting.participants = participants;
        if (status) meeting.status = status;
        if (project !== undefined) meeting.project = project;

        await meeting.save();

        const updatedMeeting = await Meeting.findById(meeting._id)
            .populate('organizer', 'name email')
            .populate('participants', 'name email')
            .populate('project', 'name');

        res.json({ success: true, meeting: updatedMeeting });
    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({ message: 'Error updating meeting' });
    }
});

// Delete meeting
router.delete('/:id', protect, async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Only organizer can delete
        if (meeting.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only organizer can delete this meeting' });
        }

        await Meeting.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Meeting deleted successfully' });
    } catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({ message: 'Error deleting meeting' });
    }
});

module.exports = router;
