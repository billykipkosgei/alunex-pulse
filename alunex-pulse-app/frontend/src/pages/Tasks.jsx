import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Tasks.css';

const Tasks = () => {
    const { token, API_URL, user } = useAuth();
    const [selectedProject, setSelectedProject] = useState('all');
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState({ todo: [], inProgress: [], completed: [] });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
        status: 'todo'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };

            const [projectsRes, tasksRes, usersRes] = await Promise.all([
                axios.get(`${API_URL}/projects`, { headers }),
                axios.get(`${API_URL}/tasks`, { headers }),
                axios.get(`${API_URL}/users`, { headers })
            ]);

            setProjects([
                { _id: 'all', name: 'All Projects' },
                ...projectsRes.data.projects
            ]);
            setTeamMembers(usersRes.data.users || []);

            // Organize tasks by status
            const allTasks = tasksRes.data.tasks;
            setTasks({
                todo: allTasks.filter(t => t.status === 'todo'),
                inProgress: allTasks.filter(t => t.status === 'in_progress'),
                completed: allTasks.filter(t => t.status === 'completed')
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus }, { headers });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getColorForUser = (name) => {
        const colors = ['#fbbf24', '#ec4899', '#8b5cf6', '#2563eb', '#06b6d4', '#10b981'];
        const hash = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
        return colors[hash % colors.length];
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleOpenModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description,
                project: task.project?._id || '',
                assignedTo: (Array.isArray(task.assignedTo) ? task.assignedTo[0]?._id : task.assignedTo?._id) || '',
                priority: task.priority,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                status: task.status
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                project: '',
                assignedTo: '',
                priority: 'medium',
                dueDate: '',
                status: 'todo'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            project: '',
            assignedTo: '',
            priority: 'medium',
            dueDate: '',
            status: 'todo'
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.project) {
            alert('Please fill in title and project');
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const payload = {
                ...formData,
                assignedTo: formData.assignedTo ? [formData.assignedTo] : []
            };

            if (editingTask) {
                await axios.put(`${API_URL}/tasks/${editingTask._id}`, payload, { headers });
            } else {
                await axios.post(`${API_URL}/tasks`, payload, { headers });
            }

            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Error saving task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/tasks/${taskId}`, { headers });
            fetchData();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading tasks...</p>
            </div>
        );
    }

    // Filter tasks by selected project
    const filterTasksByProject = (taskList) => {
        if (selectedProject === 'all') return taskList;
        return taskList.filter(task => task.project?._id === selectedProject);
    };

    const filteredTasks = {
        todo: filterTasksByProject(tasks.todo),
        inProgress: filterTasksByProject(tasks.inProgress),
        completed: filterTasksByProject(tasks.completed)
    };

    return (
        <div>
            <div className="page-header">
                <h1>Task Management</h1>
                <p>Manage and track tasks with Kanban board view - Integrated with ClickUp/Trello</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Project Tasks Board</h2>
                    <div className="task-header-actions">
                        <select
                            className="form-control project-select"
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            {projects.map(project => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            New Task
                        </button>
                    </div>
                </div>

                <div className="kanban-board">
                    {/* TO DO Column */}
                    <div className="kanban-column">
                        <div className="kanban-header">
                            <h3>TO DO</h3>
                            <span className="kanban-count">{filteredTasks.todo.length}</span>
                        </div>

                        {filteredTasks.todo.map(task => (
                            <div key={task._id} className="kanban-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }} onClick={() => updateTaskStatus(task._id, 'in_progress')}>
                                        <h4>{task.title}</h4>
                                        <p>{task.description}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(task); }}
                                            style={{ padding: '4px 8px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                                            style={{ padding: '4px 8px', fontSize: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="kanban-footer">
                                    <div className="assignee-info">
                                        <div className="avatar" style={{ background: getColorForUser((Array.isArray(task.assignedTo) ? task.assignedTo[0]?.name : task.assignedTo?.name)) }}>
                                            {getInitials(Array.isArray(task.assignedTo) ? task.assignedTo[0]?.name : task.assignedTo?.name)}
                                        </div>
                                        <span>{(Array.isArray(task.assignedTo) ? task.assignedTo[0]?.name : task.assignedTo?.name) || 'Unassigned'}</span>
                                    </div>
                                    <span className="due-date">Due: {formatDate(task.dueDate)}</span>
                                </div>
                            </div>
                        ))}
                        {filteredTasks.todo.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No tasks to do
                            </div>
                        )}
                    </div>

                    {/* IN PROGRESS Column */}
                    <div className="kanban-column">
                        <div className="kanban-header">
                            <h3>IN PROGRESS</h3>
                            <span className="kanban-count">{filteredTasks.inProgress.length}</span>
                        </div>

                        {filteredTasks.inProgress.map(task => (
                            <div key={task._id} className="kanban-card kanban-card-progress">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }} onClick={() => updateTaskStatus(task._id, 'completed')}>
                                        <h4>{task.title}</h4>
                                        <p>{task.description}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(task); }}
                                            style={{ padding: '4px 8px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                                            style={{ padding: '4px 8px', fontSize: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                {task.progress && (
                                    <div className="progress-section">
                                        <div className="progress-label">Progress: {task.progress}%</div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${task.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                <div className="kanban-footer">
                                    <div className="assignee-info">
                                        <div className="avatar" style={{ background: getColorForUser((Array.isArray(task.assignedTo) ? task.assignedTo[0]?.name : task.assignedTo?.name)) }}>
                                            {getInitials(Array.isArray(task.assignedTo) ? task.assignedTo[0]?.name : task.assignedTo?.name)}
                                        </div>
                                        <span>{(Array.isArray(task.assignedTo) ? task.assignedTo[0]?.name : task.assignedTo?.name) || 'Unassigned'}</span>
                                    </div>
                                    <span className="time-logged">
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        {task.timeLogged || '0h'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {filteredTasks.inProgress.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No tasks in progress
                            </div>
                        )}
                    </div>

                    {/* COMPLETED Column */}
                    <div className="kanban-column">
                        <div className="kanban-header">
                            <h3>COMPLETED</h3>
                            <span className="kanban-count">{filteredTasks.completed.length}</span>
                        </div>

                        {filteredTasks.completed.map(task => (
                            <div key={task._id} className="kanban-card kanban-card-completed">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4>{task.title}</h4>
                                        <p>{task.description}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(task); }}
                                            style={{ padding: '4px 8px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                                            style={{ padding: '4px 8px', fontSize: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="kanban-footer">
                                    <div className="assignee-info">
                                        <div className="avatar" style={{ background: getColorForUser((Array.isArray(task.assignedTo) ? task.assignedTo[0]?.name : task.assignedTo?.name)) }}>
                                            {getInitials(Array.isArray(task.assignedTo) ? task.assignedTo[0]?.name : task.assignedTo?.name)}
                                        </div>
                                        <span>{(Array.isArray(task.assignedTo) ? task.assignedTo[0]?.name : task.assignedTo?.name) || 'Unassigned'}</span>
                                    </div>
                                    <span className="completed-date">
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        {formatDate(task.completedAt || task.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {filteredTasks.completed.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No completed tasks
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Task Modal */}
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
                        <h2 style={{ marginTop: 0 }}>{editingTask ? 'Edit Task' : 'New Task'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Title *</label>
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
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Project *</label>
                                <select
                                    name="project"
                                    className="form-control"
                                    value={formData.project}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Project</option>
                                    {projects.filter(p => p._id !== 'all').map(project => (
                                        <option key={project._id} value={project._id}>{project.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Assign To</label>
                                <select
                                    name="assignedTo"
                                    className="form-control"
                                    value={formData.assignedTo}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Unassigned</option>
                                    {teamMembers.map(member => (
                                        <option key={member._id} value={member._id}>{member.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Priority</label>
                                    <select
                                        name="priority"
                                        className="form-control"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Status</label>
                                    <select
                                        name="status"
                                        className="form-control"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    className="form-control"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                />
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
                                    {editingTask ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
