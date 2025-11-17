import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DepartmentAnalytics = () => {
    const { token, API_URL } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('all');
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        tasksCompleted: 0,
        tasksTotal: 0,
        hoursLogged: 0,
        budgetEfficiency: 0,
        teamSize: 0
    });
    const [taskBreakdown, setTaskBreakdown] = useState({
        todo: 0,
        inProgress: 0,
        completed: 0,
        blocked: 0
    });
    const [recentTasks, setRecentTasks] = useState([]);

    useEffect(() => {
        fetchData();
    }, [selectedDept]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };

            const [deptsRes, tasksRes, usersRes] = await Promise.all([
                axios.get(`${API_URL}/departments`, { headers }),
                axios.get(`${API_URL}/tasks`, { headers }),
                axios.get(`${API_URL}/users`, { headers })
            ]);

            const depts = deptsRes.data.departments;
            setDepartments(depts);

            const tasks = tasksRes.data.tasks;
            const users = usersRes.data.users;

            // Filter data based on selected department
            let filteredTasks = tasks;
            let filteredUsers = users;
            let selectedDeptData = null;

            if (selectedDept !== 'all') {
                selectedDeptData = depts.find(d => d._id === selectedDept);
                filteredTasks = tasks.filter(t => t.department === selectedDept);
                filteredUsers = users.filter(u => selectedDeptData?.members?.includes(u._id));
            }

            // Calculate analytics
            const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
            const totalTasks = filteredTasks.length;
            const totalHours = filteredTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

            let budgetEff = 0;
            if (selectedDept === 'all') {
                const totalBudget = depts.reduce((sum, d) => sum + (d.budget?.allocated || 0), 0);
                const totalSpent = depts.reduce((sum, d) => sum + (d.budget?.spent || 0), 0);
                budgetEff = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0;
            } else if (selectedDeptData) {
                const allocated = selectedDeptData.budget?.allocated || 0;
                const spent = selectedDeptData.budget?.spent || 0;
                budgetEff = allocated > 0 ? Math.round(((allocated - spent) / allocated) * 100) : 0;
            }

            setAnalytics({
                tasksCompleted: completedTasks,
                tasksTotal: totalTasks,
                hoursLogged: totalHours,
                budgetEfficiency: budgetEff,
                teamSize: filteredUsers.length
            });

            // Calculate task breakdown
            setTaskBreakdown({
                todo: filteredTasks.filter(t => t.status === 'todo').length,
                inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
                completed: filteredTasks.filter(t => t.status === 'completed').length,
                blocked: filteredTasks.filter(t => t.status === 'blocked').length
            });

            // Get recent tasks (last 5)
            const recent = filteredTasks
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            setRecentTasks(recent);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    const completionRate = analytics.tasksTotal > 0
        ? Math.round((analytics.tasksCompleted / analytics.tasksTotal) * 100)
        : 0;

    return (
        <div>
            <div className="page-header">
                <h1>Department Analytics</h1>
                <p>View performance metrics and analytics by department</p>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <h2>Task Breakdown by Status</h2>
                    <select
                        className="form-control"
                        style={{ width: 'auto' }}
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ padding: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>{taskBreakdown.todo}</div>
                            <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>TO DO</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#eff6ff', borderRadius: '8px' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>{taskBreakdown.inProgress}</div>
                            <div style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600' }}>IN PROGRESS</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#f0fdf4', borderRadius: '8px' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>{taskBreakdown.completed}</div>
                            <div style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>COMPLETED</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', background: '#fef2f2', borderRadius: '8px' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>{taskBreakdown.blocked}</div>
                            <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600' }}>BLOCKED</div>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Recent Tasks</h3>
                    {recentTasks.length > 0 ? (
                        <table className="table" style={{ marginTop: '16px' }}>
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Assigned To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTasks.map(task => (
                                    <tr key={task._id}>
                                        <td><strong>{task.title}</strong></td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: task.status === 'completed' ? '#f0fdf4' : task.status === 'in_progress' ? '#eff6ff' : task.status === 'blocked' ? '#fef2f2' : '#f8fafc',
                                                color: task.status === 'completed' ? '#10b981' : task.status === 'in_progress' ? '#3b82f6' : task.status === 'blocked' ? '#ef4444' : '#64748b'
                                            }}>
                                                {task.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fef9c3' : '#f0fdf4',
                                                color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981'
                                            }}>
                                                {task.priority.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{Array.isArray(task.assignedTo) ? task.assignedTo[0]?.name : task.assignedTo?.name || 'Unassigned'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '8px' }}>
                            No tasks found for this department
                        </div>
                    )}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Tasks Completed</h3>
                    <div className="value">{analytics.tasksCompleted}/{analytics.tasksTotal}</div>
                    <div className="change" style={{ color: completionRate > 50 ? '#10b981' : '#f59e0b' }}>
                        {completionRate}% completion rate
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Hours Logged</h3>
                    <div className="value">{analytics.hoursLogged.toFixed(0)}h</div>
                    <div className="change" style={{ color: 'var(--text-muted)' }}>
                        Total hours tracked
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Budget Remaining</h3>
                    <div className="value">{analytics.budgetEfficiency}%</div>
                    <div className="change" style={{ color: analytics.budgetEfficiency > 25 ? '#10b981' : '#f59e0b' }}>
                        {analytics.budgetEfficiency > 25 ? 'On target' : 'Low remaining'}
                    </div>
                </div>
                <div className="stat-card">
                    <h3>Team Size</h3>
                    <div className="value">{analytics.teamSize}</div>
                    <div className="change" style={{ color: 'var(--text-muted)' }}>
                        Active members
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentAnalytics;
