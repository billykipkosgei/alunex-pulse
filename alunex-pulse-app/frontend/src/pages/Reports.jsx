import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle, AlignmentType, HeadingLevel } from 'docx';

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

    const downloadPDF = () => {
        if (!reportData) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Alunex Pulse - Report', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.text(reportData.type + ' Report', pageWidth / 2, 30, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date Range: ${startDate} to ${endDate}`, pageWidth / 2, 38, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 44, { align: 'center' });

        let yPos = 55;

        // Summary Section
        if (reportType === 'time-summary') {
            const summaryData = [
                ['Total Hours', reportData.totalHours + 'h'],
                ['Time Entries', reportData.entriesCount]
            ];

            doc.autoTable({
                startY: yPos,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                margin: { left: 14, right: 14 }
            });

            yPos = doc.lastAutoTable.finalY + 10;

            // Hours by Project
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Hours by Project', 14, yPos);
            yPos += 5;

            const projectData = Object.entries(reportData.byProject).map(([project, hours]) => [
                project, hours.toFixed(2) + 'h'
            ]);

            doc.autoTable({
                startY: yPos,
                head: [['Project', 'Hours']],
                body: projectData,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                margin: { left: 14, right: 14 }
            });

            yPos = doc.lastAutoTable.finalY + 10;

            // Hours by Team Member
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Hours by Team Member', 14, yPos);
            yPos += 5;

            const userData = Object.entries(reportData.byUser).map(([user, hours]) => [
                user, hours.toFixed(2) + 'h'
            ]);

            doc.autoTable({
                startY: yPos,
                head: [['Team Member', 'Hours']],
                body: userData,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                margin: { left: 14, right: 14 }
            });
        } else if (reportType === 'project-progress') {
            const summaryData = [
                ['Total Tasks', reportData.totalTasks],
                ['Completed', reportData.completedTasks],
                ['In Progress', reportData.inProgressTasks],
                ['Completion Rate', reportData.completionRate]
            ];

            doc.autoTable({
                startY: yPos,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                margin: { left: 14, right: 14 }
            });

            yPos = doc.lastAutoTable.finalY + 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Progress by Project', 14, yPos);
            yPos += 5;

            const projectData = Object.entries(reportData.byProject).map(([project, data]) => {
                const completion = data.total > 0 ? ((data.completed / data.total) * 100).toFixed(0) : 0;
                return [project, data.total, data.completed, data.inProgress, completion + '%'];
            });

            doc.autoTable({
                startY: yPos,
                head: [['Project', 'Total Tasks', 'Completed', 'In Progress', 'Completion %']],
                body: projectData,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                margin: { left: 14, right: 14 }
            });
        } else if (reportType === 'team-performance') {
            const summaryData = [['Active Team Members', reportData.teamMembers]];

            doc.autoTable({
                startY: yPos,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                margin: { left: 14, right: 14 }
            });

            yPos = doc.lastAutoTable.finalY + 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Performance by Team Member', 14, yPos);
            yPos += 5;

            const userData = Object.entries(reportData.byUser).map(([user, data]) => {
                const completion = data.totalTasks > 0 ? ((data.completedTasks / data.totalTasks) * 100).toFixed(0) : 0;
                return [user, data.totalTasks, data.completedTasks, data.hoursLogged.toFixed(1) + 'h', completion + '%'];
            });

            doc.autoTable({
                startY: yPos,
                head: [['Team Member', 'Total Tasks', 'Completed', 'Hours Logged', 'Completion Rate']],
                body: userData,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                margin: { left: 14, right: 14 }
            });
        } else if (reportType === 'budget-analysis') {
            const summaryData = [
                ['Total Budget', formatCurrency(reportData.totalBudget)],
                ['Total Spent', formatCurrency(reportData.totalSpent)],
                ['Remaining', formatCurrency(reportData.remaining)],
                ['Utilization', reportData.utilizationRate]
            ];

            doc.autoTable({
                startY: yPos,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                margin: { left: 14, right: 14 }
            });

            yPos = doc.lastAutoTable.finalY + 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Budget by Department', 14, yPos);
            yPos += 5;

            const deptData = Object.entries(reportData.byDepartment).map(([dept, data]) => [
                dept,
                formatCurrency(data.allocated),
                formatCurrency(data.spent),
                formatCurrency(data.remaining)
            ]);

            doc.autoTable({
                startY: yPos,
                head: [['Department', 'Allocated', 'Spent', 'Remaining']],
                body: deptData,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                margin: { left: 14, right: 14 }
            });
        }

        doc.save(`${reportData.type.replace(/ /g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const downloadExcel = () => {
        if (!reportData) return;

        const workbook = XLSX.utils.book_new();

        // Create summary sheet
        const summaryData = [
            ['Alunex Pulse - Report'],
            [reportData.type + ' Report'],
            ['Date Range:', `${startDate} to ${endDate}`],
            ['Generated:', new Date().toLocaleString()],
            []
        ];

        if (reportType === 'time-summary') {
            summaryData.push(['Summary']);
            summaryData.push(['Total Hours', reportData.totalHours + 'h']);
            summaryData.push(['Time Entries', reportData.entriesCount]);
            summaryData.push([]);
            summaryData.push(['Hours by Project']);
            summaryData.push(['Project', 'Hours']);
            Object.entries(reportData.byProject).forEach(([project, hours]) => {
                summaryData.push([project, hours.toFixed(2) + 'h']);
            });
            summaryData.push([]);
            summaryData.push(['Hours by Team Member']);
            summaryData.push(['Team Member', 'Hours']);
            Object.entries(reportData.byUser).forEach(([user, hours]) => {
                summaryData.push([user, hours.toFixed(2) + 'h']);
            });
        } else if (reportType === 'project-progress') {
            summaryData.push(['Summary']);
            summaryData.push(['Total Tasks', reportData.totalTasks]);
            summaryData.push(['Completed', reportData.completedTasks]);
            summaryData.push(['In Progress', reportData.inProgressTasks]);
            summaryData.push(['Completion Rate', reportData.completionRate]);
            summaryData.push([]);
            summaryData.push(['Progress by Project']);
            summaryData.push(['Project', 'Total Tasks', 'Completed', 'In Progress', 'Completion %']);
            Object.entries(reportData.byProject).forEach(([project, data]) => {
                const completion = data.total > 0 ? ((data.completed / data.total) * 100).toFixed(0) : 0;
                summaryData.push([project, data.total, data.completed, data.inProgress, completion + '%']);
            });
        } else if (reportType === 'team-performance') {
            summaryData.push(['Summary']);
            summaryData.push(['Active Team Members', reportData.teamMembers]);
            summaryData.push([]);
            summaryData.push(['Performance by Team Member']);
            summaryData.push(['Team Member', 'Total Tasks', 'Completed Tasks', 'Hours Logged', 'Completion Rate']);
            Object.entries(reportData.byUser).forEach(([user, data]) => {
                const completion = data.totalTasks > 0 ? ((data.completedTasks / data.totalTasks) * 100).toFixed(0) : 0;
                summaryData.push([user, data.totalTasks, data.completedTasks, data.hoursLogged.toFixed(1) + 'h', completion + '%']);
            });
        } else if (reportType === 'budget-analysis') {
            summaryData.push(['Summary']);
            summaryData.push(['Total Budget', formatCurrency(reportData.totalBudget)]);
            summaryData.push(['Total Spent', formatCurrency(reportData.totalSpent)]);
            summaryData.push(['Remaining', formatCurrency(reportData.remaining)]);
            summaryData.push(['Utilization', reportData.utilizationRate]);
            summaryData.push([]);
            summaryData.push(['Budget by Department']);
            summaryData.push(['Department', 'Allocated', 'Spent', 'Remaining']);
            Object.entries(reportData.byDepartment).forEach(([dept, data]) => {
                summaryData.push([dept, formatCurrency(data.allocated), formatCurrency(data.spent), formatCurrency(data.remaining)]);
            });
        }

        const worksheet = XLSX.utils.aoa_to_sheet(summaryData);

        // Set column widths
        worksheet['!cols'] = [
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, `${reportData.type.replace(/ /g, '_')}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const downloadWord = async () => {
        if (!reportData) return;

        const sections = [];

        // Header
        sections.push(
            new Paragraph({
                text: 'Alunex Pulse - Report',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            })
        );

        sections.push(
            new Paragraph({
                text: reportData.type + ' Report',
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            })
        );

        sections.push(
            new Paragraph({
                text: `Date Range: ${startDate} to ${endDate}`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 50 }
            })
        );

        sections.push(
            new Paragraph({
                text: `Generated: ${new Date().toLocaleString()}`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );

        if (reportType === 'time-summary') {
            // Summary Table
            sections.push(
                new Paragraph({
                    text: 'Summary',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                })
            );

            const summaryTable = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ text: 'Metric', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: 'Value', bold: true })] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('Total Hours')] }),
                            new TableCell({ children: [new Paragraph(reportData.totalHours + 'h')] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('Time Entries')] }),
                            new TableCell({ children: [new Paragraph(String(reportData.entriesCount))] })
                        ]
                    })
                ]
            });
            sections.push(summaryTable);

            // Hours by Project
            sections.push(
                new Paragraph({
                    text: 'Hours by Project',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 100 }
                })
            );

            const projectRows = [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: 'Project', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Hours', bold: true })] })
                    ]
                })
            ];

            Object.entries(reportData.byProject).forEach(([project, hours]) => {
                projectRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(project)] }),
                            new TableCell({ children: [new Paragraph(hours.toFixed(2) + 'h')] })
                        ]
                    })
                );
            });

            sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: projectRows }));

            // Hours by Team Member
            sections.push(
                new Paragraph({
                    text: 'Hours by Team Member',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 100 }
                })
            );

            const userRows = [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: 'Team Member', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Hours', bold: true })] })
                    ]
                })
            ];

            Object.entries(reportData.byUser).forEach(([user, hours]) => {
                userRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(user)] }),
                            new TableCell({ children: [new Paragraph(hours.toFixed(2) + 'h')] })
                        ]
                    })
                );
            });

            sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: userRows }));
        } else if (reportType === 'project-progress') {
            sections.push(
                new Paragraph({
                    text: 'Summary',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                })
            );

            const summaryTable = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ text: 'Metric', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: 'Value', bold: true })] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('Total Tasks')] }),
                            new TableCell({ children: [new Paragraph(String(reportData.totalTasks))] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('Completed')] }),
                            new TableCell({ children: [new Paragraph(String(reportData.completedTasks))] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('In Progress')] }),
                            new TableCell({ children: [new Paragraph(String(reportData.inProgressTasks))] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('Completion Rate')] }),
                            new TableCell({ children: [new Paragraph(reportData.completionRate)] })
                        ]
                    })
                ]
            });
            sections.push(summaryTable);

            sections.push(
                new Paragraph({
                    text: 'Progress by Project',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 100 }
                })
            );

            const projectRows = [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: 'Project', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Total Tasks', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Completed', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'In Progress', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Completion %', bold: true })] })
                    ]
                })
            ];

            Object.entries(reportData.byProject).forEach(([project, data]) => {
                const completion = data.total > 0 ? ((data.completed / data.total) * 100).toFixed(0) : 0;
                projectRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(project)] }),
                            new TableCell({ children: [new Paragraph(String(data.total))] }),
                            new TableCell({ children: [new Paragraph(String(data.completed))] }),
                            new TableCell({ children: [new Paragraph(String(data.inProgress))] }),
                            new TableCell({ children: [new Paragraph(completion + '%')] })
                        ]
                    })
                );
            });

            sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: projectRows }));
        } else if (reportType === 'team-performance') {
            sections.push(
                new Paragraph({
                    text: 'Summary',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                })
            );

            const summaryTable = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ text: 'Metric', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: 'Value', bold: true })] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('Active Team Members')] }),
                            new TableCell({ children: [new Paragraph(String(reportData.teamMembers))] })
                        ]
                    })
                ]
            });
            sections.push(summaryTable);

            sections.push(
                new Paragraph({
                    text: 'Performance by Team Member',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 100 }
                })
            );

            const userRows = [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: 'Team Member', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Total Tasks', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Completed', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Hours Logged', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Completion Rate', bold: true })] })
                    ]
                })
            ];

            Object.entries(reportData.byUser).forEach(([user, data]) => {
                const completion = data.totalTasks > 0 ? ((data.completedTasks / data.totalTasks) * 100).toFixed(0) : 0;
                userRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(user)] }),
                            new TableCell({ children: [new Paragraph(String(data.totalTasks))] }),
                            new TableCell({ children: [new Paragraph(String(data.completedTasks))] }),
                            new TableCell({ children: [new Paragraph(data.hoursLogged.toFixed(1) + 'h')] }),
                            new TableCell({ children: [new Paragraph(completion + '%')] })
                        ]
                    })
                );
            });

            sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: userRows }));
        } else if (reportType === 'budget-analysis') {
            sections.push(
                new Paragraph({
                    text: 'Summary',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                })
            );

            const summaryTable = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ text: 'Metric', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: 'Value', bold: true })] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('Total Budget')] }),
                            new TableCell({ children: [new Paragraph(formatCurrency(reportData.totalBudget))] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('Total Spent')] }),
                            new TableCell({ children: [new Paragraph(formatCurrency(reportData.totalSpent))] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('Remaining')] }),
                            new TableCell({ children: [new Paragraph(formatCurrency(reportData.remaining))] })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph('Utilization')] }),
                            new TableCell({ children: [new Paragraph(reportData.utilizationRate)] })
                        ]
                    })
                ]
            });
            sections.push(summaryTable);

            sections.push(
                new Paragraph({
                    text: 'Budget by Department',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 100 }
                })
            );

            const deptRows = [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: 'Department', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Allocated', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Spent', bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: 'Remaining', bold: true })] })
                    ]
                })
            ];

            Object.entries(reportData.byDepartment).forEach(([dept, data]) => {
                deptRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(dept)] }),
                            new TableCell({ children: [new Paragraph(formatCurrency(data.allocated))] }),
                            new TableCell({ children: [new Paragraph(formatCurrency(data.spent))] }),
                            new TableCell({ children: [new Paragraph(formatCurrency(data.remaining))] })
                        ]
                    })
                );
            });

            sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: deptRows }));
        }

        const doc = new Document({
            sections: [{
                children: sections
            }]
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportData.type.replace(/ /g, '_')}_Report_${new Date().toISOString().split('T')[0]}.docx`;
        link.click();
        window.URL.revokeObjectURL(url);
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
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    const dropdown = document.getElementById('download-dropdown');
                                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Report
                            </button>
                            <div
                                id="download-dropdown"
                                style={{
                                    display: 'none',
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    background: 'var(--bg-white)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--shadow-lg)',
                                    minWidth: '180px',
                                    zIndex: 1000,
                                    overflow: 'hidden'
                                }}
                            >
                                <button
                                    onClick={() => {
                                        downloadPDF();
                                        document.getElementById('download-dropdown').style.display = 'none';
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: 'var(--text-dark)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-gray)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => {
                                        downloadExcel();
                                        document.getElementById('download-dropdown').style.display = 'none';
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: 'var(--text-dark)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-gray)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Download Excel
                                </button>
                                <button
                                    onClick={() => {
                                        downloadWord();
                                        document.getElementById('download-dropdown').style.display = 'none';
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: 'var(--text-dark)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-gray)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download Word
                                </button>
                            </div>
                        </div>
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
