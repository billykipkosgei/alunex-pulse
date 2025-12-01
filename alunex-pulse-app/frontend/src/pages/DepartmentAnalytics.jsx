import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    const [costBreakdown, setCostBreakdown] = useState([]);

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
            // Filter departments based on selection
            const deptsToShow = selectedDept === 'all' ? depts : depts.filter(d => d._id === selectedDept);

            const deptPerformance = deptsToShow.map(dept => {
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

            // Calculate cost breakdown by department
            const breakdown = deptsToShow.map(dept => {
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
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const selectedDeptName = selectedDept === 'all' ? 'All Departments' : departments.find(d => d._id === selectedDept)?.name || 'Department';

        // Title
        doc.setFontSize(20);
        doc.setTextColor(30, 58, 138); // Blue color
        doc.text('Department Analytics Report', 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Department: ${selectedDeptName}`, 14, 30);
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 37);

        let yPos = 45;

        // Summary Metrics Section
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Summary Metrics', 14, yPos);
        yPos += 7;

        doc.autoTable({
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Budget Efficiency', `${analytics.budgetEfficiency}%`],
                ['Cost Variance', `$${Math.abs(analytics.costVariance).toLocaleString()}`],
                ['Projected ROI', `${analytics.projectedROI}%`],
                ['Cost per Hour', `$${analytics.costPerHour}`],
                ['Tasks Completed', `${analytics.tasksCompleted}/${analytics.tasksTotal}`],
                ['Completion Rate', `${completionRate}%`],
                ['Hours Logged', `${analytics.hoursLogged}h`],
                ['Team Size', `${analytics.teamSize}`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [30, 58, 138] },
            margin: { left: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        // Department Performance Scores
        if (departmentPerformance.length > 0) {
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Department Performance Scores', 14, yPos);
            yPos += 7;

            doc.autoTable({
                startY: yPos,
                head: [['Department', 'Performance Score']],
                body: departmentPerformance.map(dept => [dept.name, `${dept.score}%`]),
                theme: 'striped',
                headStyles: { fillColor: [30, 58, 138] },
                margin: { left: 14 }
            });

            yPos = doc.lastAutoTable.finalY + 10;
        }

        // Cost Breakdown by Department
        if (costBreakdown.length > 0) {
            // Check if we need a new page
            if (yPos > 200) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Cost Breakdown by Department', 14, yPos);
            yPos += 7;

            doc.autoTable({
                startY: yPos,
                head: [['Department', 'Budgeted', 'Actual', 'Variance', '% Used', 'Status']],
                body: costBreakdown.map(item => [
                    item.department,
                    `$${item.budgeted.toLocaleString()}`,
                    `$${item.actual.toLocaleString()}`,
                    `$${Math.abs(item.variance).toLocaleString()}`,
                    `${item.percentUsed}%`,
                    item.status
                ]),
                theme: 'striped',
                headStyles: { fillColor: [30, 58, 138] },
                margin: { left: 14 },
                columnStyles: {
                    1: { halign: 'right' },
                    2: { halign: 'right' },
                    3: { halign: 'right' },
                    4: { halign: 'right' }
                }
            });

            yPos = doc.lastAutoTable.finalY + 10;
        }

        // Task Breakdown by Status
        if (yPos > 200) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Task Breakdown by Status', 14, yPos);
        yPos += 7;

        doc.autoTable({
            startY: yPos,
            head: [['Status', 'Count']],
            body: [
                ['To Do', taskBreakdown.todo],
                ['In Progress', taskBreakdown.inProgress],
                ['Completed', taskBreakdown.completed],
                ['Blocked', taskBreakdown.blocked],
                ['Total', taskBreakdown.todo + taskBreakdown.inProgress + taskBreakdown.completed + taskBreakdown.blocked]
            ],
            theme: 'striped',
            headStyles: { fillColor: [30, 58, 138] },
            margin: { left: 14 }
        });

        // Save the PDF
        const fileName = `Department-Analytics-${selectedDeptName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };

    const handleExportExcel = () => {
        // Prepare CSV data
        let csvContent = "Department Analytics Report\n\n";

        // Add summary metrics
        csvContent += "Summary Metrics\n";
        csvContent += "Metric,Value\n";
        csvContent += `Budget Efficiency,${analytics.budgetEfficiency}%\n`;
        csvContent += `Cost Variance,$${Math.abs(analytics.costVariance).toLocaleString()}\n`;
        csvContent += `Projected ROI,${analytics.projectedROI}%\n`;
        csvContent += `Cost per Hour,$${analytics.costPerHour}\n`;
        csvContent += `Tasks Completed,${analytics.tasksCompleted}/${analytics.tasksTotal}\n`;
        csvContent += `Hours Logged,${analytics.hoursLogged}\n`;
        csvContent += `Team Size,${analytics.teamSize}\n\n`;

        // Add department performance
        csvContent += "Department Performance Scores\n";
        csvContent += "Department,Performance Score\n";
        departmentPerformance.forEach(dept => {
            csvContent += `${dept.name},${dept.score}%\n`;
        });
        csvContent += "\n";

        // Add cost breakdown
        csvContent += "Cost Breakdown by Department\n";
        csvContent += "Department,Budgeted,Actual Cost,Variance,% Used,Status\n";
        costBreakdown.forEach(item => {
            csvContent += `${item.department},$${item.budgeted},$${item.actual},$${Math.abs(item.variance)},${item.percentUsed}%,${item.status}\n`;
        });
        csvContent += "\n";

        // Add task breakdown
        csvContent += "Task Breakdown by Status\n";
        csvContent += "Status,Count\n";
        csvContent += `To Do,${taskBreakdown.todo}\n`;
        csvContent += `In Progress,${taskBreakdown.inProgress}\n`;
        csvContent += `Completed,${taskBreakdown.completed}\n`;
        csvContent += `Blocked,${taskBreakdown.blocked}\n`;

        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const selectedDeptName = selectedDept === 'all' ? 'All-Departments' : departments.find(d => d._id === selectedDept)?.name || 'Department';
        const fileName = `Department-Analytics-${selectedDeptName}-${new Date().toISOString().split('T')[0]}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

            {/* Department Performance Score */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '20px' }}>Department Performance Score</h3>
                <div>
                    {departmentPerformance.map((dept, index) => (
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
                    Performance score based on: task completion rate (60%) and budget adherence (40%)
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

            {/* Task Breakdown Section */}
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
