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
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [subTasks, setSubTasks] = useState([]);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        assignedTo: '',
        department: '',
        priority: 'medium',
        dueDate: '',
        startDate: '',
        status: 'todo'
    });
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
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };

            const [projectsRes, tasksRes, usersRes, departmentsRes] = await Promise.all([
                axios.get(`${API_URL}/projects`, { headers }),
                axios.get(`${API_URL}/tasks`, { headers }),
                axios.get(`${API_URL}/users`, { headers }),
                axios.get(`${API_URL}/departments`, { headers })
            ]);

            setProjects([
                { _id: 'all', name: 'All Projects' },
                ...projectsRes.data.projects
            ]);
            setTeamMembers(usersRes.data.users || []);
            setDepartments(departmentsRes.data.departments || []);

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

    const fetchSubTasks = async (taskId) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/subtasks/task/${taskId}`, { headers });
            setSubTasks(response.data.subTasks || []);
        } catch (error) {
            console.error('Error fetching sub-tasks:', error);
            setSubTasks([]);
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

    const handleOpenModal = async (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description,
                project: task.project?._id || '',
                assignedTo: (Array.isArray(task.assignedTo) ? task.assignedTo[0]?._id : task.assignedTo?._id) || '',
                department: task.department?._id || '',
                priority: task.priority,
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
                status: task.status
            });
            await fetchSubTasks(task._id);
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                project: '',
                assignedTo: '',
                department: '',
                priority: 'medium',
                dueDate: '',
                startDate: '',
                status: 'todo'
            });
            setSubTasks([]);
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
            department: '',
            priority: 'medium',
            dueDate: '',
            startDate: '',
            status: 'todo'
        });
        setSubTasks([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSubTask = () => {
        setSubTasks([...subTasks, {
            title: '',
            assignedTo: '',
            startDate: '',
            endDate: '',
            estimatedHours: 0,
            status: 'todo',
            isNew: true
        }]);
    };

    const handleSubTaskChange = (index, field, value) => {
        const updated = [...subTasks];
        updated[index][field] = value;
        setSubTasks(updated);
    };

    const handleDeleteSubTask = async (index) => {
        const subTask = subTasks[index];
        if (subTask._id) {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                await axios.delete(`${API_URL}/subtasks/${subTask._id}`, { headers });
            } catch (error) {
                console.error('Error deleting sub-task:', error);
                alert('Error deleting sub-task');
                return;
            }
        }
        const updated = subTasks.filter((_, i) => i !== index);
        setSubTasks(updated);
    };

    const validateDates = () => {
        if (formData.startDate && formData.dueDate) {
            if (new Date(formData.startDate) > new Date(formData.dueDate)) {
                alert('Start Date must be before or equal to Due Date');
                return false;
            }
        }

        for (let i = 0; i < subTasks.length; i++) {
            const subTask = subTasks[i];
            if (subTask.startDate && subTask.endDate) {
                if (new Date(subTask.startDate) > new Date(subTask.endDate)) {
                    alert(`Sub-task ${i + 1}: Start Date must be before or equal to End Date`);
                    return false;
                }
            }

            if (formData.startDate && subTask.startDate && new Date(subTask.startDate) < new Date(formData.startDate)) {
                alert(`Sub-task ${i + 1}: Start Date cannot be before parent task Start Date`);
                return false;
            }
            if (formData.dueDate && subTask.endDate && new Date(subTask.endDate) > new Date(formData.dueDate)) {
                alert(`Sub-task ${i + 1}: End Date cannot be after parent task Due Date`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.project) {
            alert('Please fill in Task and Project fields');
            return;
        }

        if (!validateDates()) {
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const payload = {
                ...formData,
                assignedTo: formData.assignedTo ? [formData.assignedTo] : [],
                department: formData.department || null
            };

            let taskId;
            if (editingTask) {
                await axios.put(`${API_URL}/tasks/${editingTask._id}`, payload, { headers });
                taskId = editingTask._id;
            } else {
                const response = await axios.post(`${API_URL}/tasks`, payload, { headers });
                taskId = response.data.task._id;
            }

            // Save sub-tasks
            for (const subTask of subTasks) {
                const subTaskPayload = {
                    title: subTask.title,
                    parentTask: taskId,
                    assignedTo: subTask.assignedTo || null,
                    startDate: subTask.startDate || null,
                    endDate: subTask.endDate || null,
                    estimatedHours: subTask.estimatedHours || 0,
                    status: subTask.status,
                    order: subTasks.indexOf(subTask)
                };

                if (subTask._id) {
                    await axios.put(`${API_URL}/subtasks/${subTask._id}`, subTaskPayload, { headers });
                } else if (subTask.title) {
                    await axios.post(`${API_URL}/subtasks`, subTaskPayload, { headers });
                }
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

            const response = await axios.post(`${API_URL}/projects`, payload, { headers });

            const newProject = response.data.project;
            setProjects(prev => [...prev, newProject]);
            setFormData(prev => ({ ...prev, project: newProject._id }));

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
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsCreatingProject(false);
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
                        background: 'var(--bg-white)',
                        padding: '30px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '700px',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0 }}>{editingTask ? 'Edit Task' : 'New Task'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Task *</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter task name"
                                    className="form-control"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px', padding: '16px', background: 'var(--bg-gray)', borderRadius: '6px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                      <label style={{ fontWeight: '600', margin: 0 }}>Sub-Tasks</label>
                                      <button
                                          type="button"
                                          onClick={handleAddSubTask}
                                          style={{
                                              padding: '6px 12px',
                                              fontSize: '13px',
                                              background: '#10b981',
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '4px',
                                              cursor: 'pointer'
                                          }}
                                      >
                                          + Add Sub-Task
                                      </button>
                                  </div>

                                  {subTasks.length === 0 ? (
                                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>No sub-tasks yet.</p>
                                  ) : (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                          {subTasks.map((subTask, index) => (
                                              <div key={index} style={{ background: 'var(--bg-white)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                      <span style={{ fontWeight: '600', fontSize: '13px' }}>Sub-Task {index + 1}</span>
                                                      <button
                                                          type="button"
                                                          onClick={() => handleDeleteSubTask(index)}
                                                          style={{
                                                              padding: '4px 8px',
                                                              fontSize: '12px',
                                                              background: '#ef4444',
                                                              color: 'white',
                                                              border: 'none',
                                                              borderRadius: '4px',
                                                              cursor: 'pointer'
                                                          }}
                                                      >
                                                          Remove
                                                      </button>
                                                  </div>
                                                  <div style={{ display: 'grid', gap: '8px' }}>
                                                      <input
                                                          type="text"
                                                          placeholder="Sub-task title"
                                                          className="form-control"
                                                          style={{ fontSize: '13px' }}
                                                          value={subTask.title}
                                                          onChange={(e) => handleSubTaskChange(index, 'title', e.target.value)}
                                                      />
                                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                          <select
                                                              className="form-control"
                                                              style={{ fontSize: '13px' }}
                                                              value={subTask.assignedTo || ''}
                                                              onChange={(e) => handleSubTaskChange(index, 'assignedTo', e.target.value)}
                                                          >
                                                              <option value="">Assign To</option>
                                                              {teamMembers.map(member => (
                                                                  <option key={member._id} value={member._id}>{member.name}</option>
                                                              ))}
                                                          </select>
                                                          <select
                                                              className="form-control"
                                                              style={{ fontSize: '13px' }}
                                                              value={subTask.status}
                                                              onChange={(e) => handleSubTaskChange(index, 'status', e.target.value)}
                                                          >
                                                              <option value="todo">To Do</option>
                                                              <option value="in_progress">In Progress</option>
                                                              <option value="done">Done</option>
                                                          </select>
                                                      </div>
                                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                                          <input
                                                              type="date"
                                                              className="form-control"
                                                              style={{ fontSize: '13px' }}
                                                              value={subTask.startDate || ''}
                                                              onChange={(e) => handleSubTaskChange(index, 'startDate', e.target.value)}
                                                          />
                                                          <input
                                                              type="date"
                                                              className="form-control"
                                                              style={{ fontSize: '13px' }}
                                                              value={subTask.endDate || ''}
                                                              onChange={(e) => handleSubTaskChange(index, 'endDate', e.target.value)}
                                                          />
                                                          <input
                                                              type="number"
                                                              className="form-control"
                                                              style={{ fontSize: '13px' }}
                                                              value={subTask.estimatedHours || ''}
                                                              onChange={(e) => handleSubTaskChange(index, 'estimatedHours', e.target.value)}
                                                              placeholder="Est. Hours"
                                                              min="0"
                                                          />
                                                      </div>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  )}
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

                            {/* Project Field with Add Button */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Project *</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        name="project"
                                        className="form-control"
                                        style={{ flex: 1 }}
                                        value={formData.project}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Project</option>
                                        {projects.filter(p => p._id !== 'all').map(project => (
                                            <option key={project._id} value={project._id}>{project.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowProjectModal(true)}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            fontWeight: '600'
                                        }}
                                    >
                                        + Add Project
                                    </button>
                                </div>
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
                                        <option key={member._id} value={member._id}>
                                            {member.name} {member.role === 'admin' ? '(Admin)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Department</label>
                                <select
                                    name="department"
                                    className="form-control"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                >
                                    <option value="">No Department</option>
                                    {departments.map(dept => (
                                        <option key={dept._id} value={dept._id}>
                                            {dept.name}
                                        </option>
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
                                        <option value="critical">Critical</option>
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

                            {/* Start Date and Due Date */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        className="form-control"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Due Date</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        className="form-control"
                                        value={formData.dueDate}
                                        onChange={handleInputChange}
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
                                    {editingTask ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                      {teamMembers.map(user => (
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
                                      {teamMembers.map(user => (
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
                                      {teamMembers.map(user => (
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
                                          <option value="Asia/Dubai">Dubai</option>
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

export default Tasks;
