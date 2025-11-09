const Task = require('../models/Task.model');
const Project = require('../models/Project.model');
const User = require('../models/User.model');
const TimeTracking = require('../models/TimeTracking.model');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Get yesterday's date range
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);

        // Calculate hours logged today
        const todayLogs = await TimeTracking.find({
            user: userId,
            organization: req.user.organization,
            startTime: { $gte: today, $lte: todayEnd },
            isRunning: false
        });
        const todaySeconds = todayLogs.reduce((sum, log) => sum + log.duration, 0);
        const todayHours = (todaySeconds / 3600).toFixed(1);

        // Calculate hours logged yesterday
        const yesterdayLogs = await TimeTracking.find({
            user: userId,
            organization: req.user.organization,
            startTime: { $gte: yesterday, $lte: yesterdayEnd },
            isRunning: false
        });
        const yesterdaySeconds = yesterdayLogs.reduce((sum, log) => sum + log.duration, 0);
        const yesterdayHours = yesterdaySeconds / 3600;

        // Calculate percentage change from yesterday
        let percentChange = 0;
        let changeDirection = 'up';
        if (yesterdayHours > 0) {
            percentChange = Math.round(((todayHours - yesterdayHours) / yesterdayHours) * 100);
            changeDirection = percentChange >= 0 ? 'up' : 'down';
        } else if (todayHours > 0) {
            percentChange = 100;
            changeDirection = 'up';
        }

        // Get active tasks
        const activeTasks = await Task.countDocuments({
            assignedTo: userId,
            organization: req.user.organization,
            status: { $in: ['todo', 'in_progress'] }
        });

        // Get tasks due this week
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const tasksDueThisWeek = await Task.countDocuments({
            assignedTo: userId,
            organization: req.user.organization,
            status: { $in: ['todo', 'in_progress'] },
            dueDate: { $gte: today, $lte: weekEnd }
        });

        // Get active projects
        const activeProjects = await Project.countDocuments({
            organization: req.user.organization,
            status: 'active'
        });

        // Get projects completed this month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const projectsCompletedThisMonth = await Project.countDocuments({
            organization: req.user.organization,
            status: 'completed',
            updatedAt: { $gte: monthStart }
        });

        // Get online users (last login within 30 minutes)
        const onlineUsers = await User.countDocuments({
            organization: req.user.organization,
            lastLogin: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
        });
        const totalUsers = await User.countDocuments({
            organization: req.user.organization
        });

        res.status(200).json({
            success: true,
            stats: {
                hoursLoggedToday: `${todayHours}h`,
                hoursPercentChange: Math.abs(percentChange),
                hoursChangeDirection: changeDirection,
                activeTasks,
                tasksDueThisWeek,
                teamMembersOnline: `${onlineUsers}/${totalUsers}`,
                activeProjects,
                projectsCompletedThisMonth
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

// Get recent tasks
exports.getRecentTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ organization: req.user.organization })
            .populate('project', 'name')
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching recent tasks',
            error: error.message
        });
    }
};

// Get team activity
exports.getTeamActivity = async (req, res) => {
    try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const users = await User.find({
            organization: req.user.organization,
            lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        })
        .select('name lastLogin')
        .limit(5);

        const activity = await Promise.all(users.map(async (user) => {
            // Get user's active task
            const activeTask = await Task.findOne({
                assignedTo: user._id,
                organization: req.user.organization,
                status: 'in_progress'
            }).select('title');

            // Calculate time logged today
            const timeLogs = await TimeTracking.find({
                user: user._id,
                organization: req.user.organization,
                startTime: { $gte: today, $lte: todayEnd },
                isRunning: false
            });
            const totalSeconds = timeLogs.reduce((sum, log) => sum + log.duration, 0);
            const hours = (totalSeconds / 3600).toFixed(1);

            // Check if user is online (last 30 minutes)
            const isOnline = user.lastLogin &&
                user.lastLogin >= new Date(Date.now() - 30 * 60 * 1000);

            return {
                name: user.name,
                status: isOnline ? 'Online' : 'Away',
                currentTask: activeTask ? activeTask.title : 'No active task',
                timeToday: `${hours}h`
            };
        }));

        res.status(200).json({
            success: true,
            activity
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching team activity',
            error: error.message
        });
    }
};
