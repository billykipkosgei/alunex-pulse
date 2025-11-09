const TimeTracking = require('../models/TimeTracking.model');
const Project = require('../models/Project.model');

// Start a timer
exports.startTimer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { projectId, description, taskId, subTaskId, billable } = req.body;

        if (!projectId || !description) {
            return res.status(400).json({
                success: false,
                message: 'Project ID and description are required'
            });
        }

        // Check if there's already a running timer for this user
        const existingTimer = await TimeTracking.findOne({
            user: userId,
            organization: req.user.organization,
            isRunning: true
        });

        if (existingTimer) {
            return res.status(400).json({
                success: false,
                message: 'You already have a running timer. Please stop it first.'
            });
        }

        // Create new timer
        const timerData = {
            user: userId,
            organization: req.user.organization,
            project: projectId,
            description,
            startTime: new Date(),
            isRunning: true,
            billable: billable !== undefined ? billable : true
        };

        if (taskId) timerData.task = taskId;
        if (subTaskId) timerData.subTask = subTaskId;

        const timer = await TimeTracking.create(timerData);

        const populatedTimer = await TimeTracking.findById(timer._id)
            .populate('project', 'name')
            .populate('task', 'title')
            .populate('subTask', 'title')
            .populate('user', 'name email');

        res.status(201).json({
            success: true,
            timer: populatedTimer
        });
    } catch (error) {
        console.error('Error starting timer:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting timer'
        });
    }
};

// Stop a timer
exports.stopTimer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { timerId } = req.body;

        const timer = await TimeTracking.findOne({
            _id: timerId,
            user: userId,
            organization: req.user.organization,
            isRunning: true
        });

        if (!timer) {
            return res.status(404).json({
                success: false,
                message: 'Timer not found or already stopped'
            });
        }

        timer.endTime = new Date();
        timer.isRunning = false;
        await timer.save();

        const populatedTimer = await TimeTracking.findById(timer._id)
            .populate('project', 'name')
            .populate('user', 'name email');

        res.status(200).json({
            success: true,
            timer: populatedTimer
        });
    } catch (error) {
        console.error('Error stopping timer:', error);
        res.status(500).json({
            success: false,
            message: 'Error stopping timer'
        });
    }
};

// Get active timer for current user
exports.getActiveTimer = async (req, res) => {
    try {
        const userId = req.user.id;

        const activeTimer = await TimeTracking.findOne({
            user: userId,
            organization: req.user.organization,
            isRunning: true
        })
            .populate('project', 'name')
            .populate('task', 'title')
            .populate('subTask', 'title')
            .populate('user', 'name email');

        res.status(200).json({
            success: true,
            timer: activeTimer
        });
    } catch (error) {
        console.error('Error fetching active timer:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active timer'
        });
    }
};

// Get time logs for a specific date
exports.getTimeLogs = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, allUsers } = req.query;

        let query = {
            organization: req.user.organization,
            isRunning: false
        };

        // If allUsers is true, don't filter by user (for reports)
        if (!allUsers || allUsers !== 'true') {
            query.user = userId;
        }

        // If date is provided, filter by date
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.startTime = { $gte: startDate, $lte: endDate };
        } else if (!allUsers || allUsers !== 'true') {
            // Default to today only if not getting all users
            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            query.startTime = { $gte: startDate, $lte: endDate };
        }

        const timeLogs = await TimeTracking.find(query)
            .populate('project', 'name')
            .populate('task', 'title')
            .populate('subTask', 'title')
            .populate('user', 'name email')
            .sort({ startTime: -1 });

        // Calculate total duration
        const totalDuration = timeLogs.reduce((sum, log) => sum + log.duration, 0);

        res.status(200).json({
            success: true,
            logs: timeLogs,
            timeEntries: timeLogs, // Also return as timeEntries for reports compatibility
            totalDuration
        });
    } catch (error) {
        console.error('Error fetching time logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching time logs'
        });
    }
};

// Get weekly summary
exports.getWeeklySummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get start of week (Monday)
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Get all time logs for the week
        const weekLogs = await TimeTracking.find({
            user: userId,
            organization: req.user.organization,
            startTime: { $gte: startOfWeek, $lte: endOfWeek },
            isRunning: false
        });

        // Group by day
        const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const weeklyData = [];

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);

            const dayLogs = weekLogs.filter(log => {
                const logDate = new Date(log.startTime);
                return logDate.toDateString() === currentDay.toDateString();
            });

            const billableSeconds = dayLogs
                .filter(log => log.billable)
                .reduce((sum, log) => sum + log.duration, 0);
            const nonBillableSeconds = dayLogs
                .filter(log => !log.billable)
                .reduce((sum, log) => sum + log.duration, 0);
            const totalSeconds = billableSeconds + nonBillableSeconds;

            const hours = totalSeconds > 0 ? (totalSeconds / 3600).toFixed(1) + 'h' : '-';
            const billableHours = (billableSeconds / 3600).toFixed(1);
            const nonBillableHours = (nonBillableSeconds / 3600).toFixed(1);

            const isToday = currentDay.toDateString() === today.toDateString();
            const dayName = daysOfWeek[(currentDay.getDay())];

            weeklyData.push({
                day: dayName,
                hours,
                billableHours: parseFloat(billableHours),
                nonBillableHours: parseFloat(nonBillableHours),
                isToday,
                date: currentDay.toISOString()
            });
        }

        // Calculate totals for the week
        const billableTotalSeconds = weekLogs
            .filter(log => log.billable)
            .reduce((sum, log) => sum + log.duration, 0);
        const nonBillableTotalSeconds = weekLogs
            .filter(log => !log.billable)
            .reduce((sum, log) => sum + log.duration, 0);
        const weekTotal = billableTotalSeconds + nonBillableTotalSeconds;

        const weekTotalHours = (weekTotal / 3600).toFixed(1);
        const billableTotalHours = (billableTotalSeconds / 3600).toFixed(1);
        const nonBillableTotalHours = (nonBillableTotalSeconds / 3600).toFixed(1);

        res.status(200).json({
            success: true,
            weeklyData,
            weekTotal: weekTotalHours,
            billableTotal: billableTotalHours,
            nonBillableTotal: nonBillableTotalHours
        });
    } catch (error) {
        console.error('Error fetching weekly summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching weekly summary'
        });
    }
};

// Delete a time log
exports.deleteTimeLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const timeLog = await TimeTracking.findOneAndDelete({
            _id: id,
            user: userId,
            organization: req.user.organization
        });

        if (!timeLog) {
            return res.status(404).json({
                success: false,
                message: 'Time log not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Time log deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting time log:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting time log'
        });
    }
};
