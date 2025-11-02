const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentTasks, getTeamActivity } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/stats', protect, getDashboardStats);
router.get('/recent-tasks', protect, getRecentTasks);
router.get('/team-activity', protect, getTeamActivity);

module.exports = router;
