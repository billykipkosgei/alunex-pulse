const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    startTimer,
    stopTimer,
    getActiveTimer,
    getTimeLogs,
    getWeeklySummary,
    createManualEntry,
    updateTimeLog,
    deleteTimeLog
} = require('../controllers/timeTracking.controller');

// Get all time entries
router.get('/', protect, getTimeLogs);

// Timer operations
router.post('/start', protect, startTimer);
router.post('/stop', protect, stopTimer);
router.get('/active', protect, getActiveTimer);

// Time logs
router.get('/logs', protect, getTimeLogs);
router.post('/manual', protect, createManualEntry);
router.put('/logs/:id', protect, updateTimeLog);
router.get('/weekly-summary', protect, getWeeklySummary);
router.delete('/logs/:id', protect, deleteTimeLog);

module.exports = router;
