import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Video = () => {
    const { token, user, API_URL } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState('all');
    const [filter, setFilter] = useState('upcoming');
    const [projects, setProjects] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        scheduledTime: '',
        duration: 60,
        participants: [],
        project: ''
    });

    useEffect(() => {
        fetchMeetings();
        fetchProjects();
        fetchTeamMembers();
    }, [filter, selectedProject]);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            const params = { filter };
            if (selectedProject !== 'all') {
                params.project = selectedProject;
            }
            const response = await axios.get(`${API_URL}/meetings`, { headers, params });
            setMeetings(response.data.meetings || []);
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/projects`, { headers });
            setProjects([
                { _id: 'all', name: 'All Projects' },
                ...response.data.projects
            ]);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchTeamMembers = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/users`, { headers });
            setTeamMembers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };

    const handleStartInstantMeeting = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.post(
                `${API_URL}/meetings/instant`,
                { title: `${user.name}'s Instant Meeting` },
                { headers }
            );

            const meeting = response.data.meeting;
            // Open Jitsi Meet in new window
            window.open(meeting.meetingLink, '_blank');
            fetchMeetings();
        } catch (error) {
            console.error('Error starting instant meeting:', error);
            alert('Error starting instant meeting');
        }
    };

    const handleScheduleMeeting = async (e) => {
        e.preventDefault();
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post(`${API_URL}/meetings`, {
                ...formData,
                project: formData.project || null
            }, { headers });

            setShowScheduleModal(false);
            setFormData({
                title: '',
                description: '',
                scheduledTime: '',
                duration: 60,
                participants: [],
                project: ''
            });
            fetchMeetings();
        } catch (error) {
            console.error('Error scheduling meeting:', error);
            alert('Error scheduling meeting');
        }
    };

    const handleJoinMeeting = (meeting) => {
        // Open Jitsi Meet in new window
        window.open(meeting.meetingLink, '_blank');

        // Update status to ongoing if it's scheduled
        if (meeting.status === 'scheduled') {
            updateMeetingStatus(meeting._id, 'ongoing');
        }
    };

    const updateMeetingStatus = async (meetingId, status) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_URL}/meetings/${meetingId}`, { status }, { headers });
            fetchMeetings();
        } catch (error) {
            console.error('Error updating meeting status:', error);
        }
    };

    const handleDeleteMeeting = async (meetingId) => {
        if (!confirm('Are you sure you want to delete this meeting?')) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/meetings/${meetingId}`, { headers });
            fetchMeetings();
        } catch (error) {
            console.error('Error deleting meeting:', error);
            alert('Error deleting meeting');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleParticipantToggle = (userId) => {
        setFormData(prev => ({
            ...prev,
            participants: prev.participants.includes(userId)
                ? prev.participants.filter(id => id !== userId)
                : [...prev.participants, userId]
        }));
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (meeting) => {
        const now = new Date();
        const scheduledTime = new Date(meeting.scheduledTime);

        let status = meeting.status;
        let color = 'var(--text-muted)';

        if (meeting.status === 'scheduled') {
            if (scheduledTime > now) {
                status = 'Scheduled';
                color = '#3b82f6';
            } else {
                status = 'Ready to Join';
                color = '#10b981';
            }
        } else if (meeting.status === 'ongoing') {
            status = 'Ongoing';
            color = '#10b981';
        } else if (meeting.status === 'completed') {
            status = 'Completed';
            color = 'var(--text-muted)';
        } else if (meeting.status === 'cancelled') {
            status = 'Cancelled';
            color = '#ef4444';
        }

        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                background: color + '20',
                color: color
            }}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading meetings...</p>
            </div>
        );
    }

    const upcomingMeetings = meetings.filter(m => {
        const now = new Date();
        return m.status === 'scheduled' && new Date(m.scheduledTime) >= now;
    });

    const ongoingMeetings = meetings.filter(m => m.status === 'ongoing');

    return (
        <div>
            <div className="page-header">
                <h1>Video Calls</h1>
                <p>Connect with your team via video conferencing - Integrated with Jitsi Meet</p>
            </div>

            {/* Quick Meeting Card */}
            <div className="card">
                <div className="card-header">
                    <h2>Quick Meeting</h2>
                    <button className="btn btn-primary" onClick={handleStartInstantMeeting}>
                        Start Instant Meeting
                    </button>
                </div>

                {ongoingMeetings.length > 0 ? (
                    <div style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Active Meetings</h3>
                        {ongoingMeetings.map(meeting => (
                            <div key={meeting._id} style={{
                                padding: '16px',
                                background: 'var(--card-bg)',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h4 style={{ marginBottom: '4px' }}>{meeting.title}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                        Organized by {meeting.organizer?.name}
                                    </p>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleJoinMeeting(meeting)}
                                >
                                    Join Now
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <svg style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: 'var(--primary-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        <h3>No Active Meetings</h3>
                        <p>Start an instant meeting or schedule one for later</p>
                    </div>
                )}
            </div>

            {/* Scheduled Meetings Card */}
            <div className="card">
                <div className="card-header">
                    <h2>Meetings</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <select
                            className="form-control"
                            style={{ width: 'auto' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="upcoming">Upcoming</option>
                            <option value="past">Past</option>
                            <option value="all">All</option>
                        </select>
                        <select
                            className="form-control"
                            style={{ width: 'auto' }}
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            {projects.map(project => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        <button className="btn btn-primary" onClick={() => setShowScheduleModal(true)}>
                            Schedule Meeting
                        </button>
                    </div>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Organizer</th>
                            <th>Scheduled Time</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meetings.length > 0 ? meetings.map((meeting) => (
                            <tr key={meeting._id}>
                                <td>
                                    <div>
                                        <strong>{meeting.title}</strong>
                                        {meeting.description && (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>
                                                {meeting.description}
                                            </p>
                                        )}
                                        {meeting.project && (
                                            <span style={{
                                                display: 'inline-block',
                                                marginTop: '4px',
                                                padding: '2px 8px',
                                                background: 'var(--primary-blue)20',
                                                color: 'var(--primary-blue)',
                                                borderRadius: '4px',
                                                fontSize: '11px'
                                            }}>
                                                {meeting.project.name}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>{meeting.organizer?.name}</td>
                                <td>{formatDate(meeting.scheduledTime)}</td>
                                <td>{meeting.duration} min</td>
                                <td>{getStatusBadge(meeting)}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '4px 12px', fontSize: '13px' }}
                                            onClick={() => handleJoinMeeting(meeting)}
                                        >
                                            Join
                                        </button>
                                        {meeting.organizer?._id === (user._id || user.id) && (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '4px 12px', fontSize: '13px', background: '#ef4444', borderColor: '#ef4444' }}
                                                onClick={() => handleDeleteMeeting(meeting._id)}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No meetings found. Click "Schedule Meeting" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Schedule Meeting Modal */}
            {showScheduleModal && (
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
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>Schedule Meeting</h2>
                            <button
                                onClick={() => setShowScheduleModal(false)}
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

                        <form onSubmit={handleScheduleMeeting}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Meeting Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-control"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Scheduled Time *</label>
                                    <input
                                        type="datetime-local"
                                        name="scheduledTime"
                                        className="form-control"
                                        value={formData.scheduledTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Duration (min)</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        className="form-control"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        min="15"
                                        step="15"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Project (Optional)</label>
                                <select
                                    name="project"
                                    className="form-control"
                                    value={formData.project}
                                    onChange={handleInputChange}
                                >
                                    <option value="">No project</option>
                                    {projects.filter(p => p._id !== 'all').map(project => (
                                        <option key={project._id} value={project._id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Participants</label>
                                <div style={{
                                    maxHeight: '200px',
                                    overflow: 'auto',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '8px'
                                }}>
                                    {teamMembers.map(member => (
                                        <div key={member._id} style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                id={`participant-${member._id}`}
                                                checked={formData.participants.includes(member._id)}
                                                onChange={() => handleParticipantToggle(member._id)}
                                                style={{ marginRight: '8px' }}
                                            />
                                            <label htmlFor={`participant-${member._id}`} style={{ margin: 0, cursor: 'pointer' }}>
                                                {member.name} ({member.email})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowScheduleModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Schedule Meeting
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Video;
