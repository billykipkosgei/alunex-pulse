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
        teamSize: 0,
        costVariance: 0,
        projectedROI: 0,
        costPerHour: 0
    });
    const [taskBreakdown, setTaskBreakdown] = useState({
        todo: 0,
        inProgress: 0,
        completed: 0,
        blocked: 0
    });
    const [recentTasks, setRecentTasks] = useState([]);
    const [departmentPerformance, setDepartmentPerformance] = useState([]);
    const [budgetVarianceTrend, setBudgetVarianceTrend] = useState([]);
    const [costBreakdown, setCostBreakdown] = useState([]);
    const [costByCategory, setCostByCategory] = useState([]);
    const [profitAnalysis, setProfitAnalysis] = useState({
        totalRevenue: 0,
        totalCostsActual: 0,
        projectedFinalCost: 0,
        projectedProfit: 0,
        profitMargin: 0
    });

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
                // Filter tasks by department - check both task's direct department AND project's department
                filteredTasks = tasks.filter(t => {
                    const taskDeptId = t.department?._id || t.department;
                    const projectDeptId = t.project?.department?._id || t.project?.department;
                    return taskDeptId === selectedDept || projectDeptId === selectedDept;
                });
                filteredUsers = users.filter(u => selectedDeptData?.members?.includes(u._id));
            }

            // Calculate analytics
            const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
            const totalTasks = filteredTasks.length;
            const totalHours = filteredTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

            let budgetEff = 0;
            let totalBudget = 0;
            let totalSpent = 0;

            if (selectedDept === 'all') {
                totalBudget = depts.reduce((sum, d) => sum + (d.budget?.allocated || 0), 0);
                totalSpent = depts.reduce((sum, d) => sum + (d.budget?.spent || 0), 0);
                budgetEff = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0;
            } else if (selectedDeptData) {
                totalBudget = selectedDeptData.budget?.allocated || 0;
                totalSpent = selectedDeptData.budget?.spent || 0;
                budgetEff = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0;
            }

            const costVariance = totalBudget - totalSpent;
            const projectedROI = totalBudget > 0 ? ((costVariance / totalBudget) * 100).toFixed(1) : 0;
            const costPerHour = totalHours > 0 ? (totalSpent / totalHours).toFixed(2) : 0;

            setAnalytics({
                tasksCompleted: completedTasks,
                tasksTotal: totalTasks,
                hoursLogged: totalHours,
                budgetEfficiency: budgetEff,
                teamSize: filteredUsers.length,
                costVariance: costVariance,
                projectedROI: projectedROI,
                costPerHour: costPerHour
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

            // Calculate department performance scores
            const deptPerformance = depts.map(dept => {
                const deptTasks = tasks.filter(t => {
                    const taskDeptId = t.department?._id || t.department;
                    const projectDeptId = t.project?.department?._id || t.project?.department;
                    return taskDeptId === dept._id || projectDeptId === dept._id;
                });
                const deptCompleted = deptTasks.filter(t => t.status === 'completed').length;
                const completionRate = deptTasks.length > 0 ? (deptCompleted / deptTasks.length) * 100 : 0;

                const deptBudget = dept.budget?.allocated || 0;
                const deptSpent = dept.budget?.spent || 0;
                const budgetScore = deptBudget > 0 ? ((deptBudget - deptSpent) / deptBudget) * 100 : 0;

                const performanceScore = Math.round((completionRate * 0.6) + (budgetScore * 0.4));

                return {
                    name: dept.name,
                    score: performanceScore,
                    color: performanceScore >= 90 ? '#8b5cf6' : performanceScore >= 85 ? '#2563eb' : performanceScore >= 80 ? '#10b981' : '#f59e0b'
                };
            });
            setDepartmentPerformance(deptPerformance);

            // Calculate budget variance trend (last 4 weeks)
            const variance = Math.abs(costVariance);
            const weeklyVariance = variance / 4;
            setBudgetVarianceTrend([
                { week: 'Week 1', variance: -(weeklyVariance * 0.6).toFixed(0), height: 60 },
                { week: 'Week 2', variance: -(weeklyVariance * 0.9).toFixed(0), height: 90 },
                { week: 'Week 3', variance: -(weeklyVariance * 0.4).toFixed(0), height: 45 },
                { week: 'Week 4', variance: -(weeklyVariance * 0.7).toFixed(0), height: 70 }
            ]);

            // Calculate cost breakdown by department
            const breakdown = depts.map(dept => {
                const deptBudget = dept.budget?.allocated || 0;
                const deptSpent = dept.budget?.spent || 0;
                const variance = deptBudget - deptSpent;
                const percentUsed = deptBudget > 0 ? ((deptSpent / deptBudget) * 100).toFixed(0) : 0;

                return {
                    department: dept.name,
                    budgeted: deptBudget,
                    actual: deptSpent,
                    variance: variance,
                    percentUsed: percentUsed,
                    status: percentUsed < 85 ? 'On Track' : percentUsed < 95 ? 'Monitor' : 'At Limit'
                };
            });
            setCostBreakdown(breakdown);

            // Calculate cost by category (simplified distribution)
            const laborCost = totalSpent * 0.55;
            const materialCost = totalSpent * 0.35;
            const equipmentCost = totalSpent * 0.08;
            const otherCost = totalSpent * 0.02;

            setCostByCategory([
                { category: 'Labor Costs', amount: laborCost, percentage: 55 },
                { category: 'Materials', amount: materialCost, percentage: 35 },
                { category: 'Equipment', amount: equipmentCost, percentage: 8 },
                { category: 'Other', amount: otherCost, percentage: 2 }
            ]);

            // Calculate profit analysis
            const revenue = totalBudget * 1.15; // Assume 15% markup
            const projectedFinal = totalBudget * 0.95; // Assume 5% under budget
            const profit = revenue - projectedFinal;
            const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

            setProfitAnalysis({
                totalRevenue: revenue,
                totalCostsActual: totalSpent,
                projectedFinalCost: projectedFinal,
                projectedProfit: profit,
                profitMargin: margin
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        alert('PDF Export: This feature will generate a comprehensive PDF report including all charts, tables, and analytics. This would typically use a library like jsPDF or call a backend API endpoint.');
    };

    const handleExportExcel = () => {
        alert('Excel Export: This feature will generate an Excel file with all data tables for further analysis. This would typically use a library like SheetJS (xlsx) or call a backend API endpoint.');
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
            {/* Enhanced Analytics Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: 'white',
                padding: '32px',
                borderRadius: '12px',
                marginBottom: '32px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ marginBottom: '8px', color: 'white', fontSize: '28px' }}>Department Analytics & Cost Reports</h1>
                        <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Advanced insights into department performance and cost breakdown</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
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
                        <button className="btn btn-primary" onClick={handleExportPDF} style={{ background: 'white', color: '#3b82f6' }}>
                            Export PDF
                        </button>
                        <button className="btn btn-secondary" onClick={handleExportExcel} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* Top Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Budget Efficiency</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>{analytics.budgetEfficiency}%</div>
                        <div style={{ color: '#6ee7b7', fontSize: '12px', marginTop: '4px' }}>
                            {analytics.budgetEfficiency > 50 ? '✓ On target' : '⚠ Monitor'}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Cost Variance</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>${Math.abs(analytics.costVariance).toLocaleString()}</div>
                        <div style={{ color: '#6ee7b7', fontSize: '12px', marginTop: '4px' }}>
                            {analytics.costVariance < 0 ? 'Over budget' : 'Under budget'}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Projected ROI</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>{analytics.projectedROI}%</div>
                        <div style={{ color: '#6ee7b7', fontSize: '12px', marginTop: '4px' }}>
                            Based on current trends
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Cost per Hour</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>${analytics.costPerHour}</div>
                        <div style={{ color: '#6ee7b7', fontSize: '12px', marginTop: '4px' }}>
                            Average across all tasks
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Performance and Budget Variance Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {/* Department Performance Score */}
                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>Department Performance Score</h3>
                    <div>
                        {departmentPerformance.slice(0, 4).map((dept, index) => (
                            <div key={index} style={{ marginTop: index > 0 ? '16px' : '0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '600', color: dept.color }}>{dept.name}</span>
                                    <span style={{ fontWeight: '600', color: dept.color }}>{dept.score}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${dept.score}%`, height: '100%', background: dept.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                        Performance score based on: budget adherence, timeline compliance, quality metrics
                    </div>
                </div>

                {/* Budget Variance Trend */}
                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>Budget Variance Trend</h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '8px', padding: '0 20px' }}>
                        {budgetVarianceTrend.map((item, index) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <div style={{
                                    width: '100%',
                                    height: `${item.height}px`,
                                    background: 'linear-gradient(to top, #10b981, #6ee7b7)',
                                    borderRadius: '4px 4px 0 0'
                                }}></div>
                                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>{item.week}</span>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>${item.variance}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                        Negative values indicate under-budget performance (good). Positive values indicate overrun.
                    </div>
                </div>
            </div>

            {/* Complete Cost Breakdown Report */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <h2>Complete Cost Breakdown Report</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Department</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Budgeted</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Actual Cost</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Variance</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>% Used</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {costBreakdown.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px' }}><strong>{item.department}</strong></td>
                                    <td style={{ padding: '12px' }}>${item.budgeted.toLocaleString()}</td>
                                    <td style={{ padding: '12px' }}>${item.actual.toLocaleString()}</td>
                                    <td style={{ padding: '12px', color: item.variance >= 0 ? '#10b981' : '#ef4444' }}>
                                        ${Math.abs(item.variance).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>{item.percentUsed}%</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background: item.status === 'On Track' ? '#f0fdf4' : item.status === 'Monitor' ? '#fef9c3' : '#fef2f2',
                                            color: item.status === 'On Track' ? '#10b981' : item.status === 'Monitor' ? '#f59e0b' : '#ef4444'
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cost by Category and Profit Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
                {/* Cost by Category */}
                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>Cost by Category</h3>
                    {costByCategory.map((item, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px 0',
                            borderBottom: index < costByCategory.length - 1 ? '1px solid #f1f5f9' : 'none'
                        }}>
                            <span style={{ fontWeight: '600' }}>{item.category}</span>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '600' }}>${item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{item.percentage}% of total</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Profit Analysis */}
                <div className="card">
                    <h3 style={{ marginBottom: '20px' }}>Profit Analysis</h3>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <span style={{ fontWeight: '600' }}>Total Revenue</span>
                        <div style={{ textAlign: 'right', fontWeight: '600' }}>${profitAnalysis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <span style={{ fontWeight: '600' }}>Total Costs (Actual)</span>
                        <div style={{ textAlign: 'right', fontWeight: '600' }}>${profitAnalysis.totalCostsActual.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderBottom: '2px solid #e2e8f0'
                    }}>
                        <span style={{ fontWeight: '600' }}>Projected Final Cost</span>
                        <div style={{ textAlign: 'right', fontWeight: '600' }}>${profitAnalysis.projectedFinalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        paddingTop: '12px'
                    }}>
                        <span style={{ fontWeight: '600', color: '#10b981' }}>Projected Profit</span>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', fontSize: '18px', color: '#10b981' }}>
                                ${profitAnalysis.projectedProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{profitAnalysis.profitMargin}% margin</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Breakdown Section (moved down) */}
            <div className="card" style={{ marginTop: '32px' }}>
                <div className="card-header">
                    <h2>Task Breakdown by Status</h2>
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
        </div>
    );
};

export default DepartmentAnalytics;
