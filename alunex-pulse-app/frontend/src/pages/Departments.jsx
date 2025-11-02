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

    const handleOpenModal = (dept = null) => {
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
        } else {
            setEditingDept(null);
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
            if (editingDept) {
                await axios.put(`${API_URL}/departments/${editingDept._id}`, formData, { headers });
            } else {
                await axios.post(`${API_URL}/departments`, formData, { headers });
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    const getUtilization = (budget, spent) => {
        return Math.round((spent / budget) * 100);
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

                            return (
                                <tr key={dept._id}>
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
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleOpenModal(dept)}
                                                style={{ padding: '4px 12px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dept._id)}
                                                style={{ padding: '4px 12px', fontSize: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
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
        </div>
    );
};

export default Departments;
