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
    const [departments, setDepartments] = useState([]);
    const fileInputRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal and link states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState('file'); // 'file' or 'link'
    const [uploadFile, setUploadFile] = useState(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkTitle, setLinkTitle] = useState('');
    const [linkDescription, setLinkDescription] = useState('');
    const [selectedModalProject, setSelectedModalProject] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');

    useEffect(() => {
        fetchFiles();
        fetchProjects();
        fetchDepartments();
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

    const fetchDepartments = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/departments`, { headers });
            setDepartments(response.data.departments || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
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

    const handleModalUpload = async () => {
        if (uploadType === 'file' && !uploadFile) {
            alert('Please select a file to upload');
            return;
        }
        if (uploadType === 'link' && (!linkUrl || !linkTitle)) {
            alert('Please provide both URL and title');
            return;
        }

        try {
            setUploading(true);
            const headers = { Authorization: `Bearer ${token}` };

            if (uploadType === 'file') {
                const formData = new FormData();
                formData.append('file', uploadFile);
                if (selectedModalProject) {
                    formData.append('project', selectedModalProject);
                }
                if (selectedDepartment) {
                    formData.append('department', selectedDepartment);
                }
                if (linkDescription) {
                    formData.append('description', linkDescription);
                }

                await axios.post(`${API_URL}/files/upload`, formData, {
                    headers: {
                        ...headers,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert('File uploaded successfully!');
            } else {
                // Add external link
                await axios.post(
                    `${API_URL}/files/add-link`,
                    {
                        url: linkUrl,
                        title: linkTitle,
                        description: linkDescription,
                        project: selectedModalProject || null,
                        department: selectedDepartment || null
                    },
                    { headers }
                );
                alert('External link added successfully!');
            }

            // Reset form and close modal
            setShowUploadModal(false);
            setUploadFile(null);
            setLinkUrl('');
            setLinkTitle('');
            setLinkDescription('');
            setSelectedModalProject('');
            setSelectedDepartment('');
            setUploadType('file');
            fetchFiles();
        } catch (error) {
            console.error('Error uploading:', error);
            alert(error.response?.data?.message || 'Error uploading');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadOrOpen = async (file) => {
        // If it's an external link, open it in a new tab
        if (file.mimeType === 'external/link') {
            window.open(file.url, '_blank', 'noopener,noreferrer');
            return;
        }

        // Otherwise, download the file
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
        if (bytes === 0) return 'External Link';
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
                            onClick={() => setShowUploadModal(true)}
                        >
                            + Add File/Link
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
                                        {file.mimeType === 'external/link' ? (
                                            <svg style={{ width: '20px', height: '20px', color: 'var(--primary-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        ) : (
                                            <svg style={{ width: '20px', height: '20px', color: 'var(--primary-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                            </svg>
                                        )}
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
                                            onClick={() => handleDownloadOrOpen(file)}
                                        >
                                            {file.mimeType === 'external/link' ? 'Open Link' : 'Download'}
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

            {/* Upload Modal */}
            {showUploadModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--bg-white)',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Add File or Link</h2>

                        {/* Upload Type Toggle */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                            <button
                                onClick={() => setUploadType('file')}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: uploadType === 'file' ? '2px solid var(--primary-blue)' : '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    background: uploadType === 'file' ? 'var(--primary-light)' : 'var(--bg-white)',
                                    cursor: 'pointer',
                                    fontWeight: uploadType === 'file' ? '600' : '400',
                                    color: uploadType === 'file' ? 'var(--primary-blue)' : 'var(--text-dark)'
                                }}
                            >
                                📁 Upload File
                            </button>
                            <button
                                onClick={() => setUploadType('link')}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: uploadType === 'link' ? '2px solid var(--primary-blue)' : '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    background: uploadType === 'link' ? 'var(--primary-light)' : 'var(--bg-white)',
                                    cursor: 'pointer',
                                    fontWeight: uploadType === 'link' ? '600' : '400',
                                    color: uploadType === 'link' ? 'var(--primary-blue)' : 'var(--text-dark)'
                                }}
                            >
                                🔗 Add External Link
                            </button>
                        </div>

                        {uploadType === 'file' ? (
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Select File</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                />
                                {uploadFile && (
                                    <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                        Selected: {uploadFile.name}
                                    </small>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label className="form-label">Link Title *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Google Drive Report"
                                        value={linkTitle}
                                        onChange={(e) => setLinkTitle(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label className="form-label">External URL *</label>
                                    <input
                                        type="url"
                                        className="form-control"
                                        placeholder="https://example.com/document"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                    />
                                    <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                        Enter the full URL including https://
                                    </small>
                                </div>
                            </>
                        )}

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Department (Optional)</label>
                            <select
                                className="form-control"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                <option value="">-- Select a department --</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Project (Optional)</label>
                            <select
                                className="form-control"
                                value={selectedModalProject}
                                onChange={(e) => setSelectedModalProject(e.target.value)}
                            >
                                <option value="">-- Select a project --</option>
                                {projects.filter(p => p._id !== 'all').map(project => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Description (Optional)</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Add a description..."
                                value={linkDescription}
                                onChange={(e) => setLinkDescription(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setUploadFile(null);
                                    setLinkUrl('');
                                    setLinkTitle('');
                                    setLinkDescription('');
                                    setUploadType('file');
                                }}
                                className="btn"
                                style={{ background: 'var(--bg-gray)' }}
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleModalUpload}
                                className="btn btn-primary"
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : uploadType === 'file' ? 'Upload File' : 'Add Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Files;
