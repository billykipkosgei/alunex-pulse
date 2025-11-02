import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Reports = () => {
    const { token, API_URL } = useAuth();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [reportType, setReportType] = useState('time-summary');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [exportFormat, setExportFormat] = useState('pdf');
    const [reportData, setReportData] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('all');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/projects`, { headers });
            setProjects([
                { _id: 'all', name: 'All Projects' },
                ...response.data.projects
            ]);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        if (!startDate || !endDate) {
            alert('Please select start and end dates');
            return;
        }

        try {
            setGenerating(true);
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch data based on report type
            const [projectsRes, tasksRes, timeRes, deptsRes] = await Promise.all([
                axios.get(`${API_URL}/projects`, { headers }),
                axios.get(`${API_URL}/tasks`, { headers }),
                axios.get(`${API_URL}/timetracking?allUsers=true`, { headers }),
                axios.get(`${API_URL}/departments`, { headers })
            ]);

            const allProjects = projectsRes.data.projects;
            const allTasks = tasksRes.data.tasks;
            const allTimeEntries = timeRes.data.timeEntries || [];
            const allDepartments = deptsRes.data.departments;

            // Filter by date range
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const filteredTasks = allTasks.filter(t => {
                const taskDate = new Date(t.createdAt);
                return taskDate >= start && taskDate <= end;
            });

            const filteredTimeEntries = allTimeEntries.filter(t => {
                const entryDate = new Date(t.date);
                return entryDate >= start && entryDate <= end;
            });

            // Filter by project if selected
            const projectFilteredTasks = selectedProject === 'all'
                ? filteredTasks
                : filteredTasks.filter(t => t.project === selectedProject);

            const projectFilteredTime = selectedProject === 'all'
                ? filteredTimeEntries
                : filteredTimeEntries.filter(t => t.project === selectedProject);

            let data = {};

            switch (reportType) {
                case 'time-summary':
                    data = generateTimeSummaryReport(projectFilteredTime, allProjects);
                    break;
                case 'project-progress':
                    data = generateProjectProgressReport(projectFilteredTasks, allProjects);
                    break;
                case 'team-performance':
                    data = generateTeamPerformanceReport(projectFilteredTasks, projectFilteredTime);
                    break;
                case 'budget-analysis':
                    data = generateBudgetAnalysisReport(allDepartments, allProjects);
                    break;
                default:
                    data = {};
            }

            setReportData(data);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error generating report');
        } finally {
            setGenerating(false);
        }
    };

    const generateTimeSummaryReport = (timeEntries, projects) => {
        const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
        const byProject = {};
        const byUser = {};

        timeEntries.forEach(entry => {
            const projectName = projects.find(p => p._id === entry.project)?.name || 'Unknown';
            const userName = entry.user?.name || 'Unknown';

            byProject[projectName] = (byProject[projectName] || 0) + (entry.hours || 0);
            byUser[userName] = (byUser[userName] || 0) + (entry.hours || 0);
        });

        return {
            type: 'Time Summary',
            totalHours: totalHours.toFixed(2),
            entriesCount: timeEntries.length,
            byProject,
            byUser
        };
    };

    const generateProjectProgressReport = (tasks, projects) => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
        const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

        const byProject = {};
        tasks.forEach(task => {
            const projectName = projects.find(p => p._id === task.project)?.name || 'Unknown';
            if (!byProject[projectName]) {
                byProject[projectName] = { total: 0, completed: 0, inProgress: 0 };
            }
            byProject[projectName].total++;
            if (task.status === 'completed') byProject[projectName].completed++;
            if (task.status === 'in_progress') byProject[projectName].inProgress++;
        });

        return {
            type: 'Project Progress',
            totalTasks,
            completedTasks,
            inProgressTasks,
            completionRate: `${completionRate}%`,
            byProject
        };
    };

    const generateTeamPerformanceReport = (tasks, timeEntries) => {
        const byUser = {};

        tasks.forEach(task => {
            const userName = Array.isArray(task.assignedTo) ? task.assignedTo[0]?.name : task.assignedTo?.name || 'Unassigned';
            if (!byUser[userName]) {
                byUser[userName] = { totalTasks: 0, completedTasks: 0, hoursLogged: 0 };
            }
            byUser[userName].totalTasks++;
            if (task.status === 'completed') byUser[userName].completedTasks++;
        });

        timeEntries.forEach(entry => {
            const userName = entry.user?.name || 'Unknown';
            if (!byUser[userName]) {
                byUser[userName] = { totalTasks: 0, completedTasks: 0, hoursLogged: 0 };
            }
            byUser[userName].hoursLogged += entry.hours || 0;
        });

        return {
            type: 'Team Performance',
            teamMembers: Object.keys(byUser).length,
            byUser
        };
    };

    const generateBudgetAnalysisReport = (departments, projects) => {
        const totalBudget = departments.reduce((sum, d) => sum + (d.budget?.allocated || 0), 0);
        const totalSpent = departments.reduce((sum, d) => sum + (d.budget?.spent || 0), 0);
        const remaining = totalBudget - totalSpent;
        const utilizationRate = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

        const byDepartment = {};
        departments.forEach(dept => {
            byDepartment[dept.name] = {
                allocated: dept.budget?.allocated || 0,
                spent: dept.budget?.spent || 0,
                remaining: (dept.budget?.allocated || 0) - (dept.budget?.spent || 0)
            };
        });

        return {
            type: 'Budget Analysis',
            totalBudget,
            totalSpent,
            remaining,
            utilizationRate: `${utilizationRate}%`,
            byDepartment
        };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>Reports & Analytics</h1>
                <p>Generate comprehensive reports and track project analytics</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Report Generator</h2>
                    <button
                        className="btn btn-primary"
                        onClick={generateReport}
                        disabled={generating}
                    >
                        {generating ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
                <div style={{ padding: '24px' }}>
                    <div style={{ maxWidth: '600px' }}>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Report Type</label>
                            <select
                                className="form-control"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="time-summary">Time Summary Report</option>
                                <option value="project-progress">Project Progress Report</option>
                                <option value="team-performance">Team Performance Report</option>
                                <option value="budget-analysis">Budget Analysis Report</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Project</label>
                            <select
                                className="form-control"
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                            >
                                {projects.map(project => (
                                    <option key={project._id} value={project._id}>{project.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Date Range</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <input
                                    type="date"
                                    className="form-control"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {reportData && (
                <div className="card">
                    <div className="card-header">
                        <h2>{reportData.type} Report</h2>
                    </div>
                    <div style={{ padding: '24px' }}>
                        {reportType === 'time-summary' && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Hours</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-blue)' }}>{reportData.totalHours}h</div>
                                    </div>
                                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Time Entries</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-blue)' }}>{reportData.entriesCount}</div>
                                    </div>
                                </div>
                                <h3 style={{ marginBottom: '16px' }}>Hours by Project</h3>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Project</th>
                                            <th>Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(reportData.byProject).map(([project, hours]) => (
                                            <tr key={project}>
                                                <td>{project}</td>
                                                <td>{hours.toFixed(2)}h</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <h3 style={{ marginTop: '30px', marginBottom: '16px' }}>Hours by Team Member</h3>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Team Member</th>
                                            <th>Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(reportData.byUser).map(([user, hours]) => (
                                            <tr key={user}>
                                                <td>{user}</td>
                                                <td>{hours.toFixed(2)}h</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {reportType === 'project-progress' && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Tasks</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-blue)' }}>{reportData.totalTasks}</div>
                                    </div>
                                    <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Completed</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{reportData.completedTasks}</div>
                                    </div>
                                    <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>In Progress</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>{reportData.inProgressTasks}</div>
                                    </div>
                                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Completion Rate</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-blue)' }}>{reportData.completionRate}</div>
                                    </div>
                                </div>
                                <h3 style={{ marginBottom: '16px' }}>Progress by Project</h3>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Project</th>
                                            <th>Total Tasks</th>
                                            <th>Completed</th>
                                            <th>In Progress</th>
                                            <th>Completion %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(reportData.byProject).map(([project, data]) => {
                                            const completion = data.total > 0 ? ((data.completed / data.total) * 100).toFixed(0) : 0;
                                            return (
                                                <tr key={project}>
                                                    <td>{project}</td>
                                                    <td>{data.total}</td>
                                                    <td>{data.completed}</td>
                                                    <td>{data.inProgress}</td>
                                                    <td>{completion}%</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {reportType === 'team-performance' && (
                            <div>
                                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', marginBottom: '30px' }}>
                                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Active Team Members</div>
                                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-blue)' }}>{reportData.teamMembers}</div>
                                </div>
                                <h3 style={{ marginBottom: '16px' }}>Performance by Team Member</h3>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Team Member</th>
                                            <th>Total Tasks</th>
                                            <th>Completed Tasks</th>
                                            <th>Hours Logged</th>
                                            <th>Completion Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(reportData.byUser).map(([user, data]) => {
                                            const completion = data.totalTasks > 0 ? ((data.completedTasks / data.totalTasks) * 100).toFixed(0) : 0;
                                            return (
                                                <tr key={user}>
                                                    <td>{user}</td>
                                                    <td>{data.totalTasks}</td>
                                                    <td>{data.completedTasks}</td>
                                                    <td>{data.hoursLogged.toFixed(1)}h</td>
                                                    <td>{completion}%</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {reportType === 'budget-analysis' && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Budget</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-blue)' }}>{formatCurrency(reportData.totalBudget)}</div>
                                    </div>
                                    <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Spent</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{formatCurrency(reportData.totalSpent)}</div>
                                    </div>
                                    <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Remaining</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{formatCurrency(reportData.remaining)}</div>
                                    </div>
                                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Utilization</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-blue)' }}>{reportData.utilizationRate}</div>
                                    </div>
                                </div>
                                <h3 style={{ marginBottom: '16px' }}>Budget by Department</h3>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Department</th>
                                            <th>Allocated</th>
                                            <th>Spent</th>
                                            <th>Remaining</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(reportData.byDepartment).map(([dept, data]) => (
                                            <tr key={dept}>
                                                <td>{dept}</td>
                                                <td>{formatCurrency(data.allocated)}</td>
                                                <td>{formatCurrency(data.spent)}</td>
                                                <td>{formatCurrency(data.remaining)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
