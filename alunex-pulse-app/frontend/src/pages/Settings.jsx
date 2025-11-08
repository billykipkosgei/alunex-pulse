import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Settings = () => {
    const { user, token, API_URL } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [currentUser, setCurrentUser] = useState(user);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteData, setInviteData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'team_member',
        department: ''
    });

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        department: ''
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    // Preferences state
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [notifications, setNotifications] = useState({
        email: JSON.parse(localStorage.getItem("emailNotifications") || "true"),
        taskAssignments: JSON.parse(localStorage.getItem("taskNotifications") || "true"),
        projectUpdates: JSON.parse(localStorage.getItem("projectNotifications") || "true"),
        chatMessages: JSON.parse(localStorage.getItem("chatNotifications") || "true"),
        budgetAlerts: JSON.parse(localStorage.getItem("budgetNotifications") || "true")
    });

    useEffect(() => {
        if (user) {
            setCurrentUser(user);
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                department: user.department?._id || ''
            });
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'team') {
            fetchTeamMembers();
        }
        fetchDepartments();
    }, [activeTab]);

    const fetchTeamMembers = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/users`, { headers });
            setTeamMembers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
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

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.put(`${API_URL}/users/profile`, profileData, { headers });

            if (response.data.success) {
                setCurrentUser(response.data.user);
                alert('Profile updated successfully! Please refresh to see all changes.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.put(`${API_URL}/users/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, { headers });

            if (response.data.success) {
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                alert('Password changed successfully!');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            alert(error.response?.data?.message || 'Error changing password');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_URL}/users/${userId}/role`, { role: newRole }, { headers });
            fetchTeamMembers();
            alert('User role updated successfully!');
        } catch (error) {
            console.error('Error updating role:', error);
            alert(error.response?.data?.message || 'Error updating role');
        }
    };

    const handleDeleteUser = async (userId, isPending = false) => {
        const confirmMessage = isPending
            ? 'Are you sure you want to cancel this invitation? The user will not be able to login with the provided credentials.'
            : 'Are you sure you want to remove this user?';

        if (!confirm(confirmMessage)) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/users/${userId}`, { headers });
            fetchTeamMembers();
            const successMessage = isPending
                ? 'Invitation cancelled successfully!'
                : 'User removed successfully!';
            alert(successMessage);
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.message || 'Error removing user');
        }
    };

    const handleInviteInputChange = (e) => {
        const { name, value } = e.target;
        setInviteData(prev => ({ ...prev, [name]: value }));
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            const tempPassword = inviteData.password; // Store password before clearing
            const tempEmail = inviteData.email;
            const tempName = inviteData.name;

            await axios.post(`${API_URL}/auth/register`, inviteData, { headers });

            setShowInviteModal(false);
            setInviteData({
                name: '',
                email: '',
                password: '',
                role: 'team_member',
                department: ''
            });
            fetchTeamMembers();

            // Show credentials that need to be shared with the user
            alert(
                `Team member invited successfully!\n\n` +
                `Please share these credentials with ${tempName}:\n\n` +
                `Email: ${tempEmail}\n` +
                `Password: ${tempPassword}\n\n` +
                `They can change their password after first login in Settings.`
            );
        } catch (error) {
            console.error('Error inviting member:', error);
            alert(error.response?.data?.message || 'Error inviting member');
        } finally {
            setLoading(false);
        }
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        alert(`Theme changed to ${newTheme} mode!`);
    };

    const handleNotificationChange = (key) => {
        const newValue = !notifications[key];
        setNotifications(prev => ({ ...prev, [key]: newValue }));
        localStorage.setItem(`${key}Notifications`, JSON.stringify(newValue));
    };

    return (
        <div>
            <div className="page-header">
                <h1>Settings</h1>
                <p>Manage your account and application preferences</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                            padding: '16px 24px',
                            border: 'none',
                            background: 'transparent',
                            borderBottom: activeTab === 'profile' ? '2px solid var(--primary-blue)' : 'none',
                            color: activeTab === 'profile' ? 'var(--primary-blue)' : 'var(--text-muted)',
                            fontWeight: activeTab === 'profile' ? '600' : '400',
                            cursor: 'pointer'
                        }}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        style={{
                            padding: '16px 24px',
                            border: 'none',
                            background: 'transparent',
                            borderBottom: activeTab === 'security' ? '2px solid var(--primary-blue)' : 'none',
                            color: activeTab === 'security' ? 'var(--primary-blue)' : 'var(--text-muted)',
                            fontWeight: activeTab === 'security' ? '600' : '400',
                            cursor: 'pointer'
                        }}
                    >
                        Security
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        style={{
                            padding: '16px 24px',
                            border: 'none',
                            background: 'transparent',
                            borderBottom: activeTab === 'team' ? '2px solid var(--primary-blue)' : 'none',
                            color: activeTab === 'team' ? 'var(--primary-blue)' : 'var(--text-muted)',
                            fontWeight: activeTab === 'team' ? '600' : '400',
                            cursor: 'pointer'
                        }}
                    >
                        Team
                    </button>
                    <button
                        onClick={() => setActiveTab("preferences")}
                        style={{
                            padding: "16px 24px",
                            border: "none",
                            background: "transparent",
                            borderBottom: activeTab === "preferences" ? "2px solid var(--primary-blue)" : "none",
                            color: activeTab === "preferences" ? "var(--primary-blue)" : "var(--text-muted)",
                            fontWeight: activeTab === "preferences" ? "600" : "400",
                            cursor: "pointer"
                        }}
                    >
                        Preferences
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <div style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Profile Settings</h3>
                        <form onSubmit={handleProfileSubmit} style={{ maxWidth: '500px' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={profileData.name}
                                    onChange={handleProfileInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={profileData.email}
                                    onChange={handleProfileInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    value={profileData.phone}
                                    onChange={handleProfileInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Department</label>
                                <select
                                    name="department"
                                    className="form-control"
                                    value={profileData.department}
                                    onChange={handleProfileInputChange}
                                >
                                    <option value="">No department</option>
                                    {departments.map(dept => (
                                        <option key={dept._id} value={dept._id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentUser?.role || 'Team Member'}
                                    disabled
                                />
                                <small style={{ color: 'var(--text-muted)' }}>
                                    Contact an administrator to change your role
                                </small>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Change Password</h3>
                        <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '500px' }}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    className="form-control"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    className="form-control"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordInputChange}
                                    required
                                    minLength="6"
                                />
                                <small style={{ color: 'var(--text-muted)' }}>
                                    Must be at least 6 characters long
                                </small>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-control"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordInputChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>Team Members ({teamMembers.length})</h3>
                            {currentUser?.role === 'admin' && (
                                <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
                                    Invite Member
                                </button>
                            )}
                        </div>

                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    {currentUser?.role === 'admin' && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.length > 0 ? teamMembers.map((member) => (
                                    <tr key={member._id}>
                                        <td>
                                            <strong>{member.name}</strong>
                                            {member._id === (currentUser?._id || currentUser?.id) && (
                                                <span style={{
                                                    marginLeft: '8px',
                                                    padding: '2px 8px',
                                                    background: 'var(--primary-blue)20',
                                                    color: 'var(--primary-blue)',
                                                    borderRadius: '4px',
                                                    fontSize: '11px'
                                                }}>
                                                    You
                                                </span>
                                            )}
                                        </td>
                                        <td>{member.email}</td>
                                        <td>
                                            {currentUser?.role === 'admin' && member._id !== (currentUser?._id || currentUser?.id) ? (
                                                <select
                                                    className="form-control"
                                                    style={{ width: 'auto', padding: '4px 8px', fontSize: '13px' }}
                                                    value={member.role}
                                                    onChange={(e) => handleUpdateRole(member._id, e.target.value)}
                                                >
                                                    <option value="team_member">Team Member</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                <span style={{
                                                    padding: '4px 12px',
                                                    background: member.role === 'admin' ? '#ef444420' : member.role === 'manager' ? '#3b82f620' : '#10b98120',
                                                    color: member.role === 'admin' ? '#ef4444' : member.role === 'manager' ? '#3b82f6' : '#10b981',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    {member.role === 'admin' ? 'Admin' : member.role === 'manager' ? 'Manager' : 'Team Member'}
                                                </span>
                                            )}
                                        </td>
                                        <td>{member.department?.name || 'N/A'}</td>
                                        <td>
                                            {member.lastLogin ? (
                                                <span style={{
                                                    padding: '4px 12px',
                                                    background: '#10b98120',
                                                    color: '#10b981',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    Active
                                                </span>
                                            ) : (
                                                <span style={{
                                                    padding: '4px 12px',
                                                    background: '#f59e0b20',
                                                    color: '#f59e0b',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        {currentUser?.role === 'admin' && (
                                            <td>
                                                {member._id !== (currentUser?._id || currentUser?.id) && (
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{
                                                            padding: '4px 12px',
                                                            fontSize: '13px',
                                                            background: member.lastLogin ? '#ef4444' : '#f59e0b',
                                                            borderColor: member.lastLogin ? '#ef4444' : '#f59e0b'
                                                        }}
                                                        onClick={() => handleDeleteUser(member._id, !member.lastLogin)}
                                                    >
                                                        {member.lastLogin ? 'Remove' : 'Cancel Invitation'}
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={currentUser?.role === 'admin' ? '6' : '5'} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            No team members found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div style={{ padding: '24px' }} className="preferences-tab">
                        <h3 style={{ marginBottom: '20px' }}>Preferences</h3>

                        {/* Theme Section */}
                        <div style={{ marginBottom: '32px', maxWidth: '600px' }} className="theme-section">
                            <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Appearance</h4>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>Choose your preferred theme</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => handleThemeChange('light')}
                                    style={{ flex: 1, padding: '12px' }}
                                >
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                    </svg>
                                    Light Mode
                                </button>
                                <button
                                    className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => handleThemeChange('dark')}
                                    style={{ flex: 1, padding: '12px' }}
                                >
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                    </svg>
                                    Dark Mode
                                </button>
                            </div>
                        </div>

                        {/* Notifications Section */}
                        <div style={{ maxWidth: '600px' }} className="notifications-section">
                            <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Notifications</h4>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>Manage your notification preferences</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--primary-blue-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Email Notifications</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Receive email notifications for all updates</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.email}
                                        onChange={() => handleNotificationChange('email')}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--primary-blue-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Task Assignments</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Get notified when tasks are assigned to you</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.taskAssignments}
                                        onChange={() => handleNotificationChange('taskAssignments')}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--primary-blue-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Project Updates</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Receive updates about project changes</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.projectUpdates}
                                        onChange={() => handleNotificationChange('projectUpdates')}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--primary-blue-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Chat Messages</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Get notified about new chat messages</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.chatMessages}
                                        onChange={() => handleNotificationChange('chatMessages')}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--primary-blue-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Budget Alerts</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Receive alerts when budgets exceed thresholds</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.budgetAlerts}
                                        onChange={() => handleNotificationChange('budgetAlerts')}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Invite Member Modal */}
            {showInviteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '30px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>Invite Team Member</h2>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '28px',
                                    cursor: 'pointer',
                                    color: '#9ca3af',
                                    lineHeight: 1,
                                    padding: '4px 8px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleInviteMember}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={inviteData.name}
                                    onChange={handleInviteInputChange}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={inviteData.email}
                                    onChange={handleInviteInputChange}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Temporary Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    value={inviteData.password}
                                    onChange={handleInviteInputChange}
                                    required
                                    minLength="6"
                                />
                                <small style={{ color: 'var(--text-muted)' }}>
                                    User can change this after first login
                                </small>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Role *</label>
                                <select
                                    name="role"
                                    className="form-control"
                                    value={inviteData.role}
                                    onChange={handleInviteInputChange}
                                    required
                                >
                                    <option value="team_member">Team Member</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Department (Optional)</label>
                                <select
                                    name="department"
                                    className="form-control"
                                    value={inviteData.department}
                                    onChange={handleInviteInputChange}
                                >
                                    <option value="">No department</option>
                                    {departments.map(dept => (
                                        <option key={dept._id} value={dept._id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowInviteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Inviting...' : 'Invite Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
