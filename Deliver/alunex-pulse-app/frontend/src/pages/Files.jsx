import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Files = () => {
    const { token, API_URL } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedProject, setSelectedProject] = useState('all');
    const [projects, setProjects] = useState([]);
    const fileInputRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchFiles();
        fetchProjects();
    }, []);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/files`, { headers });
            setFiles(response.data.files || []);
        } catch (error) {
            console.error('Error fetching files:', error);
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

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            if (selectedProject !== 'all') {
                formData.append('project', selectedProject);
            }

            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            };

            await axios.post(`${API_URL}/files/upload`, formData, { headers });
            fetchFiles();
            fileInputRef.current.value = '';
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (file) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/files/download/${file.name}`, {
                headers,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.originalName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Error downloading file');
        }
    };

    const handleDelete = async (fileId) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/files/${fileId}`, { headers });
            fetchFiles();
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Error deleting file');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredFiles = files.filter(f => {
        const matchesProject = selectedProject === 'all' ? true : f.project?._id === selectedProject;
        const matchesSearch = f.originalName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesProject && matchesSearch;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading files...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>File Sharing</h1>
                <p>Share and manage project files</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Project Files</h2>
                    <div className="file-filters" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search files..."
                            style={{ width: '200px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload File'}
                        </button>
                    </div>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Size</th>
                            <th>Uploaded By</th>
                            <th>Project</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFiles.length > 0 ? filteredFiles.map((file) => (
                            <tr key={file._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg style={{ width: '20px', height: '20px', color: 'var(--primary-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                        </svg>
                                        <strong>{file.originalName}</strong>
                                    </div>
                                </td>
                                <td>{formatFileSize(file.size)}</td>
                                <td>{file.uploadedBy?.name}</td>
                                <td>{file.project?.name || 'N/A'}</td>
                                <td>{formatDate(file.createdAt)}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '4px 12px', fontSize: '13px' }}
                                            onClick={() => handleDownload(file)}
                                        >
                                            Download
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '4px 12px', fontSize: '13px', background: '#ef4444', borderColor: '#ef4444' }}
                                            onClick={() => handleDelete(file._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No files uploaded yet. Click "Upload File" to add files.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Files;
