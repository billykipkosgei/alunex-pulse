import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Departments = () => {
    const { token, API_URL } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalBudget, setTotalBudget] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [users, setUsers] = useState([]);
    const [showDocModal, setShowDocModal] = useState(false);
    const [currentDeptForDoc, setCurrentDeptForDoc] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [docLink, setDocLink] = useState('');
    const [docNotes, setDocNotes] = useState('');
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [selectedDocProject, setSelectedDocProject] = useState('');
    const [expandedDept, setExpandedDept] = useState(null);
    const [deptProjects, setDeptProjects] = useState({});
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [allProjects, setAllProjects] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        head: '',
        budget: {
            allocated: 0,
            spent: 0
        }
    });

    useEffect(() => {
        fetchDepartments();
        fetchUsers();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/departments`, { headers });

            const depts = response.data.departments;
            setDepartments(depts);

            // Calculate totals
            const budget = depts.reduce((sum, d) => sum + (d.budget?.allocated || 0), 0);
            const spent = depts.reduce((sum, d) => sum + (d.budget?.spent || 0), 0);
            setTotalBudget(budget);
            setTotalSpent(spent);
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(false);
        }
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

    const fetchAllProjects = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/projects`, { headers });
            setAllProjects(response.data.projects || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleOpenModal = async (dept = null) => {
        // Fetch all projects first
        await fetchAllProjects();

        if (dept) {
            setEditingDept(dept);
            setFormData({
                name: dept.name,
                description: dept.description || '',
                head: dept.head?._id || '',
                budget: {
                    allocated: dept.budget?.allocated || 0,
                    spent: dept.budget?.spent || 0
                }
            });
            // Fetch projects for this department if editing
            if (dept._id) {
                try {
                    const headers = { Authorization: `Bearer ${token}` };
                    const response = await axios.get(`${API_URL}/departments/${dept._id}/projects`, { headers });
                    setSelectedProjects(response.data.projects || []);
                } catch (error) {
                    console.error('Error fetching department projects:', error);
                    setSelectedProjects([]);
                }
            }
        } else {
            setEditingDept(null);
            setSelectedProjects([]);
            setFormData({
                name: '',
                description: '',
                head: '',
                budget: {
                    allocated: 0,
                    spent: 0
                }
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDept(null);
        setSelectedProjects([]);
        setFormData({
            name: '',
            description: '',
            head: '',
            budget: {
                allocated: 0,
                spent: 0
            }
        });
    };

    const handleProjectSelect = (projectId) => {
        const project = allProjects.find(p => p._id === projectId);
        if (project && !selectedProjects.find(p => p._id === projectId)) {
            setSelectedProjects([...selectedProjects, project]);
        }
    };

    const handleProjectRemove = (projectId) => {
        setSelectedProjects(selectedProjects.filter(p => p._id !== projectId));
    };

    const handleProjectBudgetChange = (projectId, field, value) => {
        setSelectedProjects(selectedProjects.map(p => {
            if (p._id === projectId) {
                return {
                    ...p,
                    budget: {
                        ...p.budget,
                        [field]: parseFloat(value) || 0
                    }
                };
            }
            return p;
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('budget.')) {
            const budgetField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                budget: {
                    ...prev.budget,
                    [budgetField]: parseFloat(value) || 0
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            alert('Please enter department name');
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            let departmentId;

            // Save department first
            if (editingDept) {
                await axios.put(`${API_URL}/departments/${editingDept._id}`, formData, { headers });
                departmentId = editingDept._id;
            } else {
                const response = await axios.post(`${API_URL}/departments`, formData, { headers });
                departmentId = response.data.department._id;
            }

            // Update project assignments and budgets
            for (const project of selectedProjects) {
                try {
                    await axios.put(
                        `${API_URL}/projects/${project._id}`,
                        {
                            department: departmentId,
                            budget: {
                                allocated: project.budget?.allocated || 0,
                                spent: project.budget?.spent || 0
                            }
                        },
                        { headers }
                    );
                } catch (err) {
                    console.error(`Error updating project ${project.name}:`, err);
                }
            }

            // Remove department from projects that were unselected
            if (editingDept) {
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get(`${API_URL}/departments/${editingDept._id}/projects`, { headers });
                const oldProjects = response.data.projects || [];

                for (const oldProject of oldProjects) {
                    if (!selectedProjects.find(p => p._id === oldProject._id)) {
                        try {
                            await axios.put(
                                `${API_URL}/projects/${oldProject._id}`,
                                { department: null },
                                { headers }
                            );
                        } catch (err) {
                            console.error(`Error removing project ${oldProject.name}:`, err);
                        }
                    }
                }
            }

            handleCloseModal();
            fetchDepartments();
        } catch (error) {
            console.error('Error saving department:', error);
            alert('Error saving department');
        }
    };

    const handleDelete = async (deptId) => {
        if (!confirm('Are you sure you want to delete this department?')) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_URL}/departments/${deptId}`, { isActive: false }, { headers });
            fetchDepartments();
        } catch (error) {
            console.error('Error deleting department:', error);
            alert('Error deleting department');
        }
    };

    const handleOpenDocModal = async (dept) => {
        setCurrentDeptForDoc(dept);
        setDocLink(dept.spendDocumentation?.documentLink || '');
        setDocNotes(dept.spendDocumentation?.notes || '');
        setUploadFile(null);
        setSelectedDocProject('');
        // Fetch all projects for the dropdown
        await fetchAllProjects();
        setShowDocModal(true);
    };

    const handleCloseDocModal = () => {
        setShowDocModal(false);
        setCurrentDeptForDoc(null);
        setUploadFile(null);
        setDocLink('');
        setDocNotes('');
        setSelectedDocProject('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please upload Excel, CSV, PDF, or Word documents only');
                e.target.value = '';
                return;
            }
            setUploadFile(file);
        }
    };

    const handleUploadDoc = async () => {
        if (!uploadFile && !docLink) {
            alert('Please upload a file or provide a link');
            return;
        }

        try {
            setUploadingDoc(true);
            const headers = { Authorization: `Bearer ${token}` };

            // Upload file if provided
            if (uploadFile) {
                const formData = new FormData();
                formData.append('file', uploadFile);
                formData.append('documentLink', docLink);
                formData.append('notes', docNotes);
                if (selectedDocProject) {
                    formData.append('project', selectedDocProject);
                }

                await axios.post(
                    `${API_URL}/departments/${currentDeptForDoc._id}/spend-documentation/upload`,
                    formData,
                    {
                        headers: {
                            ...headers,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            } else if (docLink) {
                // Only link provided
                const linkData = { documentLink: docLink, notes: docNotes };
                if (selectedDocProject) {
                    linkData.project = selectedDocProject;
                }
                await axios.put(
                    `${API_URL}/departments/${currentDeptForDoc._id}/spend-documentation/link`,
                    linkData,
                    { headers }
                );
            }

            alert('Spend documentation uploaded successfully!');
            handleCloseDocModal();
            fetchDepartments();
        } catch (error) {
            console.error('Error uploading spend documentation:', error);
            alert('Error uploading spend documentation: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleDownloadDoc = async (dept) => {
        if (!dept.spendDocumentation?.excelFile) {
            alert('No file uploaded');
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(
                `${API_URL}/files/download/${dept.spendDocumentation.excelFile.name}`,
                { headers, responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', dept.spendDocumentation.excelFile.originalName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Error downloading file');
        }
    };

    const handleDeleteDoc = async (dept) => {
        if (!confirm('Are you sure you want to delete the spend documentation?')) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/departments/${dept._id}/spend-documentation`, { headers });
            alert('Spend documentation deleted successfully');
            fetchDepartments();
        } catch (error) {
            console.error('Error deleting spend documentation:', error);
            alert('Error deleting spend documentation');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    const getUtilization = (budget, spent) => {
        return Math.round((spent / budget) * 100);
    };

    const fetchDepartmentProjects = async (deptId) => {
        try {
            setLoadingProjects(true);
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/departments/${deptId}/projects`, { headers });
            setDeptProjects(prev => ({
                ...prev,
                [deptId]: response.data.projects
            }));
        } catch (error) {
            console.error('Error fetching department projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    const toggleDepartmentExpand = (deptId) => {
        if (expandedDept === deptId) {
            setExpandedDept(null);
        } else {
            setExpandedDept(deptId);
            if (!deptProjects[deptId]) {
                fetchDepartmentProjects(deptId);
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading departments...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>Departments & Budget</h1>
                <p>Manage departments and track budget allocation</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: '30px' }}>
                <div className="stat-card">
                    <h3>Total Budget</h3>
                    <div className="value">{formatCurrency(totalBudget)}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Spent</h3>
                    <div className="value">{formatCurrency(totalSpent)}</div>
                </div>
                <div className="stat-card">
                    <h3>Remaining</h3>
                    <div className="value">{formatCurrency(totalBudget - totalSpent)}</div>
                </div>
                <div className="stat-card">
                    <h3>Utilization</h3>
                    <div className="value">{totalBudget > 0 ? getUtilization(totalBudget, totalSpent) : 0}%</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Department Budgets</h2>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>Add Department</button>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}></th>
                            <th>Department</th>
                            <th>Head</th>
                            <th>Budget</th>
                            <th>Spent</th>
                            <th>Remaining</th>
                            <th>Utilization</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.length > 0 ? departments.map((dept) => {
                            const budget = dept.budget?.allocated || 0;
                            const spent = dept.budget?.spent || 0;
                            const utilization = budget > 0 ? getUtilization(budget, spent) : 0;
                            const remaining = budget - spent;
                            const isExpanded = expandedDept === dept._id;
                            const projects = deptProjects[dept._id] || [];

                            return (
                                <>
                                    <tr key={dept._id}>
                                        <td>
                                            <button
                                                onClick={() => toggleDepartmentExpand(dept._id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    padding: '4px',
                                                    transition: 'transform 0.2s'
                                                }}
                                                title="View projects"
                                            >
                                                {isExpanded ? '▼' : '▶'}
                                            </button>
                                        </td>
                                        <td><strong>{dept.name}</strong></td>
                                        <td>{dept.head?.name || 'Not assigned'}</td>
                                        <td>{formatCurrency(budget)}</td>
                                        <td>{formatCurrency(spent)}</td>
                                        <td>{formatCurrency(remaining)}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div
                                                        style={{
                                                            width: `${utilization}%`,
                                                            height: '100%',
                                                            background: utilization > 75 ? '#f59e0b' : 'var(--primary-blue)',
                                                            transition: 'width 0.3s'
                                                        }}
                                                    ></div>
                                                </div>
                                                <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '40px' }}>{utilization}%</span>
                                            </div>
                                        </td>
                                        <td>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => handleOpenModal(dept)}
                                                style={{ padding: '4px 12px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleOpenDocModal(dept)}
                                                style={{ padding: '4px 12px', fontSize: '12px', background: dept.spendDocumentation?.excelFile || dept.spendDocumentation?.documentLink ? '#10b981' : '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                title="Upload spend documentation"
                                            >
                                                {dept.spendDocumentation?.excelFile || dept.spendDocumentation?.documentLink ? '📄 Docs' : '📎 Upload'}
                                            </button>
                                            {(dept.spendDocumentation?.excelFile || dept.spendDocumentation?.documentLink) && (
                                                <>
                                                    {dept.spendDocumentation?.excelFile && (
                                                        <button
                                                            onClick={() => handleDownloadDoc(dept)}
                                                            style={{ padding: '4px 12px', fontSize: '12px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                            title="Download file"
                                                        >
                                                            ⬇️
                                                        </button>
                                                    )}
                                                    {dept.spendDocumentation?.documentLink && (
                                                        <a
                                                            href={dept.spendDocumentation.documentLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ padding: '4px 12px', fontSize: '12px', background: '#06b6d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}
                                                            title="View link"
                                                        >
                                                            🔗
                                                        </a>
                                                    )}
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(dept._id)}
                                                style={{ padding: '4px 12px', fontSize: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Expandable Project Breakdown */}
                                {isExpanded && (
                                    <tr>
                                        <td colSpan="8" style={{ padding: 0, background: '#f8fafc' }}>
                                            <div style={{ padding: '20px', borderTop: '2px solid #e2e8f0' }}>
                                                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#475569' }}>
                                                    Projects in {dept.name}
                                                </h3>

                                                {loadingProjects && !projects.length ? (
                                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                                        <div className="loading-spinner"></div>
                                                        <p>Loading projects...</p>
                                                    </div>
                                                ) : projects.length > 0 ? (
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead>
                                                            <tr style={{ background: '#e2e8f0' }}>
                                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>Project Name</th>
                                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>Project Code</th>
                                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>Status</th>
                                                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #cbd5e1' }}>Allocated Budget</th>
                                                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #cbd5e1' }}>Spent</th>
                                                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #cbd5e1' }}>Remaining</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {projects.map((project) => {
                                                                const projectBudget = project.budget?.allocated || 0;
                                                                const projectSpent = project.budget?.spent || 0;
                                                                const projectRemaining = projectBudget - projectSpent;

                                                                return (
                                                                    <tr key={project._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                                        <td style={{ padding: '12px' }}>
                                                                            <strong>{project.name}</strong>
                                                                        </td>
                                                                        <td style={{ padding: '12px' }}>
                                                                            <span style={{
                                                                                padding: '4px 8px',
                                                                                background: '#e0e7ff',
                                                                                color: '#4338ca',
                                                                                borderRadius: '4px',
                                                                                fontSize: '0.85rem',
                                                                                fontWeight: '600'
                                                                            }}>
                                                                                {project.code || 'N/A'}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ padding: '12px' }}>
                                                                            <span style={{
                                                                                padding: '4px 8px',
                                                                                borderRadius: '4px',
                                                                                fontSize: '0.85rem',
                                                                                fontWeight: '600',
                                                                                background:
                                                                                    project.status === 'active' ? '#dcfce7' :
                                                                                    project.status === 'completed' ? '#dbeafe' :
                                                                                    project.status === 'on_hold' ? '#fef3c7' :
                                                                                    '#f3f4f6',
                                                                                color:
                                                                                    project.status === 'active' ? '#166534' :
                                                                                    project.status === 'completed' ? '#1e40af' :
                                                                                    project.status === 'on_hold' ? '#92400e' :
                                                                                    '#374151'
                                                                            }}>
                                                                                {project.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                                                                            {formatCurrency(projectBudget)}
                                                                        </td>
                                                                        <td style={{ padding: '12px', textAlign: 'right', color: projectSpent > projectBudget ? '#dc2626' : '#059669' }}>
                                                                            {formatCurrency(projectSpent)}
                                                                        </td>
                                                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: projectRemaining < 0 ? '#dc2626' : '#059669' }}>
                                                                            {formatCurrency(projectRemaining)}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            <tr style={{ background: '#f1f5f9', fontWeight: '700' }}>
                                                                <td colSpan="3" style={{ padding: '12px', textAlign: 'right' }}>
                                                                    Total:
                                                                </td>
                                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                                    {formatCurrency(projects.reduce((sum, p) => sum + (p.budget?.allocated || 0), 0))}
                                                                </td>
                                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                                    {formatCurrency(projects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0))}
                                                                </td>
                                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                                    {formatCurrency(
                                                                        projects.reduce((sum, p) => sum + (p.budget?.allocated || 0), 0) -
                                                                        projects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0)
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <p style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontStyle: 'italic' }}>
                                                        No projects assigned to this department yet.
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </>
                            );
                        }) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                                    No departments found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Department Modal */}
            {showModal && (
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
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0 }}>{editingDept ? 'Edit Department' : 'New Department'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Department Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Department Head</label>
                                <select
                                    name="head"
                                    className="form-control"
                                    value={formData.head}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Not assigned</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Allocated Budget</label>
                                    <input
                                        type="number"
                                        name="budget.allocated"
                                        className="form-control"
                                        value={formData.budget.allocated}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="1000"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Spent</label>
                                    <input
                                        type="number"
                                        name="budget.spent"
                                        className="form-control"
                                        value={formData.budget.spent}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="100"
                                    />
                                </div>
                            </div>

                            {/* Project Management Section */}
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#334155' }}>Project Budgets</h3>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
                                    Assign projects to this department and manage their budgets
                                </p>

                                {/* Project Selector */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Add Project</label>
                                    <select
                                        className="form-control"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleProjectSelect(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    >
                                        <option value="">Select a project to add...</option>
                                        {allProjects
                                            .filter(p => !selectedProjects.find(sp => sp._id === p._id))
                                            .map(project => (
                                                <option key={project._id} value={project._id}>
                                                    {project.name} {project.code ? `(${project.code})` : ''}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                {/* Selected Projects Table */}
                                {selectedProjects.length > 0 ? (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                                            <thead>
                                                <tr style={{ background: '#e2e8f0' }}>
                                                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem', borderBottom: '2px solid #cbd5e1' }}>Project Name</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.875rem', borderBottom: '2px solid #cbd5e1' }}>Code</th>
                                                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.875rem', borderBottom: '2px solid #cbd5e1' }}>Allocated</th>
                                                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.875rem', borderBottom: '2px solid #cbd5e1' }}>Spent</th>
                                                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.875rem', borderBottom: '2px solid #cbd5e1' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedProjects.map(project => (
                                                    <tr key={project._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                        <td style={{ padding: '8px', fontSize: '0.875rem' }}>
                                                            <strong>{project.name}</strong>
                                                        </td>
                                                        <td style={{ padding: '8px', fontSize: '0.875rem' }}>
                                                            <span style={{
                                                                padding: '2px 6px',
                                                                background: '#e0e7ff',
                                                                color: '#4338ca',
                                                                borderRadius: '4px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600'
                                                            }}>
                                                                {project.code || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '8px' }}>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={project.budget?.allocated || 0}
                                                                onChange={(e) => handleProjectBudgetChange(project._id, 'allocated', e.target.value)}
                                                                min="0"
                                                                step="1000"
                                                                style={{ width: '120px', fontSize: '0.875rem', padding: '4px 8px' }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '8px' }}>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={project.budget?.spent || 0}
                                                                onChange={(e) => handleProjectBudgetChange(project._id, 'spent', e.target.value)}
                                                                min="0"
                                                                step="100"
                                                                style={{ width: '120px', fontSize: '0.875rem', padding: '4px 8px' }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleProjectRemove(project._id)}
                                                                style={{
                                                                    padding: '4px 8px',
                                                                    fontSize: '0.75rem',
                                                                    background: '#ef4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr style={{ background: '#f1f5f9', fontWeight: '600' }}>
                                                    <td colSpan="2" style={{ padding: '8px', textAlign: 'right', fontSize: '0.875rem' }}>
                                                        Total Project Budgets:
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.875rem' }}>
                                                        {formatCurrency(selectedProjects.reduce((sum, p) => sum + (p.budget?.allocated || 0), 0))}
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.875rem' }}>
                                                        {formatCurrency(selectedProjects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0))}
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic' }}>
                                        No projects assigned yet. Select a project from the dropdown above.
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingDept ? 'Update Department' : 'Create Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Spend Documentation Upload Modal */}
            {showDocModal && currentDeptForDoc && (
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
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Upload Spend Documentation</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>
                            Upload an Excel file showing how the spend amount was derived, or provide a link to external documentation.
                        </p>

                        {/* Current Documentation Info */}
                        {(currentDeptForDoc.spendDocumentation?.excelFile || currentDeptForDoc.spendDocumentation?.documentLink) && (
                            <div style={{
                                background: '#f0fdf4',
                                border: '1px solid #86efac',
                                borderRadius: '6px',
                                padding: '12px',
                                marginBottom: '20px'
                            }}>
                                <strong style={{ color: '#166534' }}>Current Documentation:</strong>
                                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                                    {currentDeptForDoc.spendDocumentation?.excelFile && (
                                        <div>📄 File: {currentDeptForDoc.spendDocumentation.excelFile.originalName}</div>
                                    )}
                                    {currentDeptForDoc.spendDocumentation?.documentLink && (
                                        <div>🔗 Link: <a href={currentDeptForDoc.spendDocumentation.documentLink} target="_blank" rel="noopener noreferrer">{currentDeptForDoc.spendDocumentation.documentLink}</a></div>
                                    )}
                                    {currentDeptForDoc.spendDocumentation?.uploadedBy && (
                                        <div style={{ marginTop: '4px', color: '#6b7280' }}>
                                            Uploaded by: {currentDeptForDoc.spendDocumentation.uploadedBy.name || 'Unknown'}
                                        </div>
                                    )}
                                    {currentDeptForDoc.spendDocumentation?.notes && (
                                        <div style={{ marginTop: '4px', color: '#6b7280' }}>
                                            Notes: {currentDeptForDoc.spendDocumentation.notes}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDeleteDoc(currentDeptForDoc)}
                                    style={{
                                        marginTop: '10px',
                                        padding: '4px 10px',
                                        fontSize: '12px',
                                        background: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Delete Documentation
                                </button>
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Select Project (Optional)
                            </label>
                            <select
                                className="form-control"
                                value={selectedDocProject}
                                onChange={(e) => setSelectedDocProject(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="">-- Select a project --</option>
                                {allProjects.map(project => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                                Associate this documentation with a specific project
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Upload Excel/Document File
                            </label>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
                                onChange={handleFileChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            />
                            {uploadFile && (
                                <p style={{ marginTop: '8px', color: '#10b981', fontSize: '14px' }}>
                                    ✓ Selected: {uploadFile.name}
                                </p>
                            )}
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                                Accepted formats: Excel (.xlsx, .xls), CSV, PDF, Word (.doc, .docx)
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Or Provide a Link
                            </label>
                            <input
                                type="url"
                                className="form-control"
                                placeholder="https://example.com/spend-breakdown.xlsx"
                                value={docLink}
                                onChange={(e) => setDocLink(e.target.value)}
                                style={{ width: '100%' }}
                            />
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                                Link to Google Sheets, Dropbox, OneDrive, or any other document
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Notes (Optional)
                            </label>
                            <textarea
                                className="form-control"
                                placeholder="Add any notes about the spend calculation..."
                                value={docNotes}
                                onChange={(e) => setDocNotes(e.target.value)}
                                rows="3"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCloseDocModal}
                                disabled={uploadingDoc}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleUploadDoc}
                                disabled={uploadingDoc || (!uploadFile && !docLink)}
                            >
                                {uploadingDoc ? 'Uploading...' : 'Save Documentation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
