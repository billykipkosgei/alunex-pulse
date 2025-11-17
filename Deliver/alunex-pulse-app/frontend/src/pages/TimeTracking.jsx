import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './TimeTracking.css';

const TimeTracking = () => {
    const { token, API_URL } = useAuth();
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [selectedProject, setSelectedProject] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [subTasks, setSubTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [selectedSubTask, setSelectedSubTask] = useState('');
    const [isGeneralWork, setIsGeneralWork] = useState(false);
    const [timeLogs, setTimeLogs] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [activeTimerId, setActiveTimerId] = useState(null);
    const [timerStartTime, setTimerStartTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalDuration, setTotalDuration] = useState(0);
    const [weekTotal, setWeekTotal] = useState('0');
    const [billableTotal, setBillableTotal] = useState('0');
    const [nonBillableTotal, setNonBillableTotal] = useState('0');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchTimeLogs();
    }, [selectedDate]);

    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };

            const [projectsRes, activeTimerRes, weeklySummaryRes] = await Promise.all([
                axios.get(`${API_URL}/projects`, { headers }),
                axios.get(`${API_URL}/timetracking/active`, { headers }),
                axios.get(`${API_URL}/timetracking/weekly-summary`, { headers })
            ]);

            setProjects([
                { _id: '', name: 'Select Project' },
                ...projectsRes.data.projects
            ]);

            // Set active timer if exists
            if (activeTimerRes.data.timer) {
                const timer = activeTimerRes.data.timer;
                setActiveTimerId(timer._id);
                setSelectedProject(timer.project._id);
                setTaskDescription(timer.description);
                setTimerStartTime(new Date(timer.startTime));
                setIsTimerRunning(true);

                // Calculate elapsed time
                const elapsed = Math.floor((new Date() - new Date(timer.startTime)) / 1000);
                setTimeElapsed(elapsed);
            }

            setWeeklyData(weeklySummaryRes.data.weeklyData);
            setWeekTotal(weeklySummaryRes.data.weekTotal);
            setBillableTotal(weeklySummaryRes.data.billableTotal || '0');
            setNonBillableTotal(weeklySummaryRes.data.nonBillableTotal || '0');

            await fetchTimeLogs();
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTimeLogs = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/timetracking/logs?date=${selectedDate}`, { headers });

            setTimeLogs(response.data.logs);
            setTotalDuration(response.data.totalDuration);
        } catch (error) {
            console.error('Error fetching time logs:', error);
        }
    };

    const fetchWeeklySummary = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/timetracking/weekly-summary`, { headers });

            setWeeklyData(response.data.weeklyData);
            setWeekTotal(response.data.weekTotal);
            setBillableTotal(response.data.billableTotal || '0');
            setNonBillableTotal(response.data.nonBillableTotal || '0');
        } catch (error) {
            console.error('Error fetching weekly summary:', error);
        }
    };

    const fetchTasks = async (projectId) => {
        if (!projectId || isGeneralWork) {
            setTasks([]);
            setSubTasks([]);
            setSelectedTask('');
            setSelectedSubTask('');
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/tasks/my-tasks/${projectId}`, { headers });
            setTasks(response.data.tasks || []);
            setSelectedTask('');
            setSelectedSubTask('');
            setSubTasks([]);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        }
    };

    const handleProjectChange = (projectId) => {
        setSelectedProject(projectId);
        
        // Check if General Work is selected
        const project = projects.find(p => p._id === projectId);
        const isGeneral = project?.name === 'General Work';
        setIsGeneralWork(isGeneral);
        
        if (!isGeneral && projectId) {
            fetchTasks(projectId);
        } else {
            setTasks([]);
            setSubTasks([]);
            setSelectedTask('');
            setSelectedSubTask('');
        }
    };

    const handleTaskChange = (taskId) => {
        setSelectedTask(taskId);
        setSelectedSubTask('');
        
        if (taskId) {
            const task = tasks.find(t => t._id === taskId);
            setSubTasks(task?.subTasks || []);
            setTaskDescription(task?.title || '');
        } else {
            setSubTasks([]);
            setTaskDescription('');
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };

    const formatTimeForDisplay = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleStartTimer = async () => {
        if (!selectedProject) {
            alert('Please select a project');
            return;
        }

        if (!isGeneralWork && !selectedTask) {
            alert('Please select a task from the dropdown');
            return;
        }

        if (isGeneralWork && !taskDescription) {
            alert('Please enter a description for general work');
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const payload = {
                projectId: selectedProject,
                description: taskDescription,
                billable: !isGeneralWork
            };

            if (selectedTask) payload.taskId = selectedTask;
            if (selectedSubTask) payload.subTaskId = selectedSubTask;

            const response = await axios.post(`${API_URL}/timetracking/start`, payload, { headers });

            setActiveTimerId(response.data.timer._id);
            setTimerStartTime(new Date(response.data.timer.startTime));
            setIsTimerRunning(true);
            setTimeElapsed(0);
        } catch (error) {
            console.error('Error starting timer:', error);
            alert(error.response?.data?.message || 'Error starting timer');
        }
    };

    const handleStopTimer = async () => {
        if (!activeTimerId) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${API_URL}/timetracking/stop`, {
                timerId: activeTimerId
            }, { headers });

            setIsTimerRunning(false);
            setTimeElapsed(0);
            setSelectedProject('');
            setTaskDescription('');
            setSelectedTask('');
            setSelectedSubTask('');
            setTasks([]);
            setSubTasks([]);
            setIsGeneralWork(false);
            setActiveTimerId(null);
            setTimerStartTime(null);

            // Refresh data
            await fetchTimeLogs();
            await fetchWeeklySummary();
        } catch (error) {
            console.error('Error stopping timer:', error);
            alert('Error stopping timer');
        }
    };

    const handleCancel = () => {
        setIsTimerRunning(false);
        setTimeElapsed(0);
        setSelectedProject('');
        setTaskDescription('');
        setSelectedTask('');
        setSelectedSubTask('');
        setTasks([]);
        setSubTasks([]);
        setIsGeneralWork(false);
        setActiveTimerId(null);
        setTimerStartTime(null);
    };

    const handleDeleteLog = async (logId) => {
        if (!confirm('Are you sure you want to delete this time log?')) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/timetracking/logs/${logId}`, { headers });

            await fetchTimeLogs();
            await fetchWeeklySummary();
        } catch (error) {
            console.error('Error deleting time log:', error);
            alert('Error deleting time log');
        }
    };

    const handleExport = () => {
        if (timeLogs.length === 0) {
            alert('No time logs to export');
            return;
        }

        const headers = ['Project', 'Task Description', 'Start Time', 'End Time', 'Duration', 'Billable'];
        const rows = timeLogs.map(log => [
            log.project?.name || 'N/A',
            log.description || 'N/A',
            new Date(log.startTime).toLocaleString(),
            log.endTime ? new Date(log.endTime).toLocaleString() : 'In Progress',
            formatDuration(log.duration),
            log.billable ? 'Yes' : 'No'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `time_logs_${selectedDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading time tracking...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>Time Tracking</h1>
                <p>Track time spent on projects and tasks with integrated Clockify</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Active Timer</h2>
                </div>

                <div className="timer-container">
                    <div className="timer-display">{formatTime(timeElapsed)}</div>

                    <div className="timer-inputs">
                        <div className="form-group timer-form-group">
                            <select
                                className="form-control"
                                value={selectedProject}
                                onChange={(e) => handleProjectChange(e.target.value)}
                                disabled={isTimerRunning}
                            >
                                {projects.map(project => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!isGeneralWork ? (
                            <>
                                <div className="form-group timer-form-group">
                                    <select
                                        className="form-control"
                                        value={selectedTask}
                                        onChange={(e) => handleTaskChange(e.target.value)}
                                        disabled={isTimerRunning}
                                    >
                                        <option value="">Select Task</option>
                                        {tasks.map(task => (
                                            <option key={task._id} value={task._id}>
                                                {task.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {subTasks.length > 0 && (
                                    <div className="form-group timer-form-group">
                                        <select
                                            className="form-control"
                                            value={selectedSubTask}
                                            onChange={(e) => setSelectedSubTask(e.target.value)}
                                            disabled={isTimerRunning}
                                        >
                                            <option value="">Select Sub-Task (Optional)</option>
                                            {subTasks.map(subTask => (
                                                <option key={subTask._id} value={subTask._id}>
                                                    {subTask.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="form-group timer-form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="What are you working on? (Meeting, Training, etc.)"
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                    disabled={isTimerRunning}
                                />
                            </div>
                        )}
                    </div>

                    <div className="timer-actions">
                        {!isTimerRunning ? (
                            <button
                                className="btn btn-primary btn-large"
                                onClick={handleStartTimer}
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Start Timer
                            </button>
                        ) : (
                            <>
                                <button
                                    className="btn btn-primary btn-large"
                                    onClick={handleStopTimer}
                                >
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                                    </svg>
                                    Stop Timer
                                </button>
                                <button
                                    className="btn btn-secondary btn-large"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Today's Time Logs</h2>
                    <div className="time-log-actions">
                        <input
                            type="date"
                            className="form-control date-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleExport}>Export</button>
                    </div>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Task Description</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Duration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timeLogs.length > 0 ? timeLogs.map((log) => (
                            <tr key={log._id}>
                                <td><strong>{log.project?.name || 'N/A'}</strong></td>
                                <td>{log.description}</td>
                                <td>{formatTimeForDisplay(log.startTime)}</td>
                                <td>{log.endTime ? formatTimeForDisplay(log.endTime) : '-'}</td>
                                <td><strong>{formatTime(log.duration)}</strong></td>
                                <td>
                                    <button
                                        className="btn btn-secondary btn-small"
                                        onClick={() => handleDeleteLog(log._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                    No time logs for this date
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="total-time-today">
                    <strong>Total Time Today: {formatDuration(totalDuration)}</strong>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Weekly Summary</h2>
                </div>

                <div className="weekly-grid">
                    {weeklyData.map((day, index) => (
                        <div
                            key={index}
                            className={`day-card ${day.isToday ? 'day-card-today' : ''}`}
                        >
                            <div className={`day-label ${day.isToday ? 'day-label-today' : ''}`}>
                                {day.day}
                            </div>
                            <div className={`day-hours ${day.isToday ? 'day-hours-today' : ''} ${day.hours === '-' ? 'day-hours-empty' : ''}`}>
                                {day.hours}
                            </div>
                            {day.isToday && <div className="today-badge">TODAY</div>}
                        </div>
                    ))}
                </div>

                <div className="weekly-total">
                    <div className="weekly-total-label">Weekly Total</div>
                    <div className="weekly-total-hours">{weekTotal} hours</div>
                </div>
            </div>
        </div>
    );
};

export default TimeTracking;
