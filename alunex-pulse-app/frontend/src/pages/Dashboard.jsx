import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
    const { user, token, API_URL } = useAuth();
    const [selectedProject, setSelectedProject] = useState('all');
    const [stats, setStats] = useState(null);
    const [recentTasks, setRecentTasks] = useState([]);
    const [teamActivity, setTeamActivity] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [projectFormData, setProjectFormData] = useState({
        name: '',
        code: '',
        description: '',
        clientName: '',
        department: '',
        startDate: '',
        endDate: '',
        status: 'planning',
        priority: 'medium',
        manager: '',
        team: [],
        client: '',
        budget: {
            allocated: '',
            currency: 'USD'
        },
        profitMargin: '',
        country: '',
        timezone: 'UTC'
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (selectedProject && projects.length > 0) {
            fetchFilteredData();
        }
    }, [selectedProject]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, tasksRes, activityRes, projectsRes] = await Promise.all([
                axios.get(`${API_URL}/dashboard/stats`, { headers }),
                axios.get(`${API_URL}/dashboard/recent-tasks`, { headers }),
                axios.get(`${API_URL}/dashboard/team-activity`, { headers }),
                axios.get(`${API_URL}/projects`, { headers })
            ]);

            setStats(statsRes.data.stats);
            setRecentTasks(tasksRes.data.tasks);
            setTeamActivity(activityRes.data.activity);
            setProjects([
                { _id: 'all', name: 'All Projects' },
                ...projectsRes.data.projects
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilteredData = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const projectParam = selectedProject !== 'all' ? `?projectId=${selectedProject}` : '';

            const [statsRes, tasksRes, activityRes] = await Promise.all([
                axios.get(`${API_URL}/dashboard/stats${projectParam}`, { headers }),
                axios.get(`${API_URL}/dashboard/recent-tasks${projectParam}`, { headers }),
                axios.get(`${API_URL}/dashboard/team-activity${projectParam}`, { headers })
            ]);

            setStats(statsRes.data.stats);
            setRecentTasks(tasksRes.data.tasks);
            setTeamActivity(activityRes.data.activity);
        } catch (error) {
            console.error('Error fetching filtered data:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'completed': 'success',
            'in_progress': 'warning',
            'todo': 'info',
            'blocked': 'danger'
        };
        return colors[status] || 'info';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const fetchUsers = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/users`, { headers });
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/departments`, { headers });
            setDepartments(response.data.departments || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleProjectFormChange = (e) => {
        const { name, value, type } = e.target;

        if (name.startsWith('budget.')) {
            const budgetField = name.split('.')[1];
            setProjectFormData(prev => ({
                ...prev,
                budget: {
                    ...prev.budget,
                    [budgetField]: value
                }
            }));
        } else if (name === 'team') {
            // Handle multi-select for team members
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            setProjectFormData(prev => ({
                ...prev,
                team: selectedOptions
            }));
        } else {
            setProjectFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();

        if (!projectFormData.name) {
            alert('Please enter Project Name');
            return;
        }

        if (projectFormData.startDate && projectFormData.endDate) {
            if (new Date(projectFormData.startDate) > new Date(projectFormData.endDate)) {
                alert('Start Date must be before or equal to End Date');
                return;
            }
        }

        setIsCreatingProject(true);

        try {
            const headers = { Authorization: `Bearer ${token}` };

            // Prepare team array with proper structure
            const teamArray = projectFormData.team.map(userId => ({
                user: userId,
                role: 'Member' // Default role
            }));

            const payload = {
                name: projectFormData.name,
                code: projectFormData.code || undefined,
                description: projectFormData.description || undefined,
                clientName: projectFormData.clientName || undefined,
                department: projectFormData.department || undefined,
                startDate: projectFormData.startDate || undefined,
                endDate: projectFormData.endDate || undefined,
                status: projectFormData.status || 'planning',
                priority: projectFormData.priority || 'medium',
                manager: projectFormData.manager || undefined,
                team: teamArray.length > 0 ? teamArray : undefined,
                client: projectFormData.client || undefined,
                budget: {
                    allocated: projectFormData.budget.allocated ? Number(projectFormData.budget.allocated) : 0,
                    currency: projectFormData.budget.currency || 'USD'
                },
                profitMargin: projectFormData.profitMargin ? Number(projectFormData.profitMargin) : 0,
                country: projectFormData.country || undefined,
                timezone: projectFormData.timezone || 'UTC'
            };

            await axios.post(`${API_URL}/projects`, payload, { headers });

            setProjectFormData({
                name: '',
                code: '',
                description: '',
                clientName: '',
                department: '',
                startDate: '',
                endDate: '',
                status: 'planning',
                priority: 'medium',
                manager: '',
                team: [],
                client: '',
                budget: {
                    allocated: '',
                    currency: 'USD'
                },
                profitMargin: '',
                country: '',
                timezone: 'UTC'
            });
            setShowProjectModal(false);

            alert('Project created successfully!');
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsCreatingProject(false);
        }
    };

    const userName = user?.name?.split(' ')[0] || 'there';

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Welcome back, {userName}! Here's your project overview for today.</p>
                    </div>
                    <div className="project-selector-group">
                        <label>View Projects:</label>
                        <select
                            className="form-control"
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            {projects.map(project => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        <button className="btn btn-secondary filter-btn" title="Advanced Filters">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                            </svg>
                        </button>
                        <button className="btn btn-primary" onClick={() => {
                            setShowProjectModal(true);
                            fetchUsers();
                            fetchDepartments();
                        }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            New Project
                        </button>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Hours Logged Today</h3>
                    <div className="value">{stats?.hoursLoggedToday || '0h'}</div>
                    <div className="change" style={{ color: stats?.hoursChangeDirection === 'up' ? '#10b981' : '#ef4444' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {stats?.hoursChangeDirection === 'up' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                            )}
                        </svg>
                        {stats?.hoursPercentChange || 0}% {stats?.hoursChangeDirection === 'up' ? 'above' : 'below'} yesterday
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Active Tasks</h3>
                    <div className="value">{stats?.activeTasks || 0}</div>
                    <div className="change" style={{ color: stats?.tasksDueThisWeek > 0 ? '#f59e0b' : '#10b981' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {stats?.tasksDueThisWeek > 0 ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            )}
                        </svg>
                        {stats?.tasksDueThisWeek || 0} due this week
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Team Members Online</h3>
                    <div className="value">{stats?.teamMembersOnline || '0/0'}</div>
                    <div className="change" style={{ color: '#10b981' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        {stats?.teamMembersOnline?.split('/')[0] > 0 ? 'Active now' : 'All offline'}
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Active Projects</h3>
                    <div className="value">{stats?.activeProjects || 0}</div>
                    <div className="change" style={{ color: '#10b981' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {stats?.projectsCompletedThisMonth || 0} completed this month
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Recent Tasks</h2>
                    <button className="btn btn-primary">View All Tasks</button>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Project</th>
                            <th>Assigned To</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Priority</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTasks.length > 0 ? recentTasks.map((task) => (
                            <tr key={task._id}>
                                <td><strong>{task.title}</strong></td>
                                <td>{task.project?.name || 'N/A'}</td>
                                <td>{(Array.isArray(task.assignedTo) && task.assignedTo.length > 0) ? task.assignedTo[0].name : (task.assignedTo?.name || 'Unassigned')}</td>
                                <td>{formatDate(task.dueDate)}</td>
                                <td>
                                    <span className={`badge badge-${getStatusColor(task.status)}`}>
                                        {task.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                                        {task.priority.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                    No recent tasks found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Team Activity</h2>
                </div>

                <div className="team-activity-grid">
                    {teamActivity.length > 0 ? teamActivity.map((member, index) => (
                        <div key={index} className="team-activity-card">
                            <div className="team-activity-header">
                                <strong>{member.name}</strong>
                                <span className="badge badge-success">{member.status}</span>
                            </div>
                            <p className="text-small text-muted">Working on: {member.currentTask}</p>
                            <p className="text-small text-muted">Time today: {member.timeToday}</p>
                        </div>
                    )) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No active team members
                        </div>
                    )}
                </div>
            </div>

            {/* New Project Modal */}
            {showProjectModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001
                }}>
                    <div style={{
                        background: 'var(--bg-white)',
                        padding: '30px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '700px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Create New Project</h2>
                        <form onSubmit={handleCreateProject}>
                            {/* Basic Information Section */}
                            <h3 style={{ fontSize: '1.1rem', marginTop: '20px', marginBottom: '12px', color: 'var(--primary-color)' }}>Basic Information</h3>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Project Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={projectFormData.name}
                                    onChange={handleProjectFormChange}
                                    placeholder="e.g., Website Redesign"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Project Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    className="form-control"
                                    value={projectFormData.code}
                                    onChange={handleProjectFormChange}
                                    placeholder="e.g., WEB-2024-001"
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    value={projectFormData.description}
                                    onChange={handleProjectFormChange}
                                    placeholder="Detailed explanation of the project"
                                    rows="3"
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Department</label>
                                <select
                                    name="department"
                                    className="form-control"
                                    value={projectFormData.department}
                                    onChange={handleProjectFormChange}
                                >
                                    <option value="">Select Department (Optional)</option>
                                    {departments.map(dept => (
                                        <option key={dept._id} value={dept._id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Status</label>
                                    <select
                                        name="status"
                                        className="form-control"
                                        value={projectFormData.status}
                                        onChange={handleProjectFormChange}
                                    >
                                        <option value="planning">Planning</option>
                                        <option value="active">Active</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Priority</label>
                                    <select
                                        name="priority"
                                        className="form-control"
                                        value={projectFormData.priority}
                                        onChange={handleProjectFormChange}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            {/* Dates Section */}
                            <h3 style={{ fontSize: '1.1rem', marginTop: '20px', marginBottom: '12px', color: 'var(--primary-color)' }}>Dates</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        className="form-control"
                                        value={projectFormData.startDate}
                                        onChange={handleProjectFormChange}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        className="form-control"
                                        value={projectFormData.endDate}
                                        onChange={handleProjectFormChange}
                                    />
                                </div>
                            </div>

                            {/* Team Section */}
                            <h3 style={{ fontSize: '1.1rem', marginTop: '20px', marginBottom: '12px', color: 'var(--primary-color)' }}>Team</h3>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Manager</label>
                                <select
                                    name="manager"
                                    className="form-control"
                                    value={projectFormData.manager}
                                    onChange={handleProjectFormChange}
                                >
                                    <option value="">Select Manager</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Team Members</label>
                                <select
                                    name="team"
                                    className="form-control"
                                    value={projectFormData.team}
                                    onChange={handleProjectFormChange}
                                    multiple
                                    style={{ minHeight: '100px' }}
                                >
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Hold Ctrl/Cmd to select multiple members</small>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Client</label>
                                <select
                                    name="client"
                                    className="form-control"
                                    value={projectFormData.client}
                                    onChange={handleProjectFormChange}
                                >
                                    <option value="">Select Client (or use Client Name below)</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Client Name (if not in system)</label>
                                <input
                                    type="text"
                                    name="clientName"
                                    className="form-control"
                                    value={projectFormData.clientName}
                                    onChange={handleProjectFormChange}
                                    placeholder="Enter external client name"
                                />
                            </div>

                            {/* Budget Section */}
                            <h3 style={{ fontSize: '1.1rem', marginTop: '20px', marginBottom: '12px', color: 'var(--primary-color)' }}>Budget</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Allocated Budget</label>
                                    <input
                                        type="number"
                                        name="budget.allocated"
                                        className="form-control"
                                        value={projectFormData.budget.allocated}
                                        onChange={handleProjectFormChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Currency</label>
                                    <select
                                        name="budget.currency"
                                        className="form-control"
                                        value={projectFormData.budget.currency}
                                        onChange={handleProjectFormChange}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                        <option value="INR">INR</option>
                                        <option value="AUD">AUD</option>
                                        <option value="CAD">CAD</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Profit Margin (%)</label>
                                <input
                                    type="number"
                                    name="profitMargin"
                                    className="form-control"
                                    value={projectFormData.profitMargin}
                                    onChange={handleProjectFormChange}
                                    placeholder="e.g., 15"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                            </div>

                            {/* Location Section */}
                            <h3 style={{ fontSize: '1.1rem', marginTop: '20px', marginBottom: '12px', color: 'var(--primary-color)' }}>Location</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        className="form-control"
                                        value={projectFormData.country}
                                        onChange={handleProjectFormChange}
                                        placeholder="e.g., United States"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Timezone</label>
                                    <select
                                        name="timezone"
                                        className="form-control"
                                        value={projectFormData.timezone}
                                        onChange={handleProjectFormChange}
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">Eastern Time (ET)</option>
                                        <option value="America/Chicago">Central Time (CT)</option>
                                        <option value="America/Denver">Mountain Time (MT)</option>
                                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                        <option value="Europe/London">London (GMT)</option>
                                        <option value="Europe/Paris">Paris (CET)</option>
                                        <option value="Asia/Dubai">Dubai (UAE - GST)</option>
                                        <option value="Asia/Riyadh">Riyadh (Saudi Arabia - AST)</option>
                                        <option value="Asia/Qatar">Qatar (AST)</option>
                                        <option value="Asia/Kolkata">India (IST)</option>
                                        <option value="Asia/Shanghai">China (CST)</option>
                                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                                        <option value="Australia/Sydney">Sydney (AEST)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowProjectModal(false);
                                        setProjectFormData({
                                            name: '',
                                            code: '',
                                            description: '',
                                            clientName: '',
                                            department: '',
                                            startDate: '',
                                            endDate: '',
                                            status: 'planning',
                                            priority: 'medium',
                                            manager: '',
                                            team: [],
                                            client: '',
                                            budget: {
                                                allocated: '',
                                                currency: 'USD'
                                            },
                                            profitMargin: '',
                                            country: '',
                                            timezone: 'UTC'
                                        });
                                    }}
                                    disabled={isCreatingProject}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isCreatingProject}>
                                    {isCreatingProject ? 'Creating project...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
