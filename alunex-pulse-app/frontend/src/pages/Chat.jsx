import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import axios from 'axios';
import io from 'socket.io-client';

const Chat = () => {
    const { user, token, API_URL } = useAuth();
    const { refreshUnreadCount } = useChat();
    const [message, setMessage] = useState('');
    const [channels, setChannels] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showChannelModal, setShowChannelModal] = useState(false);
    const [projects, setProjects] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, type: null, id: null, name: null });
    const [activeMenu, setActiveMenu] = useState({ type: null, id: null }); // for three-dot menu
    const [editChannelModal, setEditChannelModal] = useState({ show: false, channel: null });
    const [editMessageModal, setEditMessageModal] = useState({ show: false, message: null });
    const [channelForm, setChannelForm] = useState({
        name: '',
        description: '',
        projectId: '',
        isPrivate: false
    });
    const [typingUsers, setTypingUsers] = useState([]);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        fetchChannels();
        fetchProjects();

        // Initialize Socket.io connection
        const socketUrl = API_URL.replace('/api', '');
        socketRef.current = io(socketUrl);

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
        });

        socketRef.current.on('receive_message', (newMessage) => {
            setMessages(prev => [...prev, newMessage]);
            scrollToBottom();
        });

        socketRef.current.on('message_edited', ({ message }) => {
            setMessages(prev => prev.map(msg => msg._id === message._id ? message : msg));
        });

        socketRef.current.on('channel_edited', ({ channel }) => {
            setChannels(prev => prev.map(ch => ch._id === channel._id ? channel : ch));
            setSelectedChannel(prev => prev?._id === channel._id ? channel : prev);
        });

        socketRef.current.on('message_deleted', ({ messageId }) => {
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        });

        socketRef.current.on('channel_deleted', ({ channelId }) => {
            setChannels(prev => prev.filter(ch => ch._id !== channelId));
            setSelectedChannel(prev => prev?._id === channelId ? null : prev);
            setMessages(prev => prev?._id === channelId ? [] : prev);
        });

        // Typing indicators
        socketRef.current.on('user_typing', (data) => {
            setTypingUsers(prev => {
                // Avoid duplicates
                if (!prev.find(u => u.userId === data.userId)) {
                    return [...prev, { userId: data.userId, userName: data.userName }];
                }
                return prev;
            });
        });

        socketRef.current.on('user_stop_typing', (data) => {
            setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (selectedChannel) {
            fetchMessages(selectedChannel._id);

            // Join the channel room
            if (socketRef.current) {
                socketRef.current.emit('join_channel', selectedChannel._id);
            }

            // Clear typing users when switching channels
            setTypingUsers([]);
        }

        return () => {
            if (selectedChannel && socketRef.current) {
                socketRef.current.emit('leave_channel', selectedChannel._id);
            }
        };
    }, [selectedChannel]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenu.id && !event.target.closest('.menu-container')) {
                setActiveMenu({ type: null, id: null });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenu]);

    const fetchChannels = async (showLoading = true, autoSelect = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/chat/channels`, { headers });

            setChannels(response.data.channels);

            // Select first channel by default only on initial load
            if (autoSelect && response.data.channels.length > 0 && !selectedChannel) {
                setSelectedChannel(response.data.channels[0]);
            }
        } catch (error) {
            console.error('Error fetching channels:', error);
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const fetchMessages = async (channelId) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/chat/channels/${channelId}/messages`, { headers });

            setMessages(response.data.messages);

            // Refresh unread count after messages are marked as read
            refreshUnreadCount();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/projects`, { headers });
            setProjects(response.data.projects || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleCreateChannel = async (e) => {
        e.preventDefault();

        if (!channelForm.name.trim()) {
            alert('Channel name is required');
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.post(`${API_URL}/chat/channels`, channelForm, { headers });
            setShowChannelModal(false);
            setChannelForm({ name: '', description: '', projectId: '', isPrivate: false });

            // Add the new channel to the list without showing loading
            fetchChannels(false, false);

            // Auto-select the newly created channel
            if (response.data.channel) {
                setSelectedChannel(response.data.channel);
            }
        } catch (error) {
            console.error('Error creating channel:', error);
            alert('Error creating channel');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = () => {
        if (!selectedChannel || !socketRef.current) return;

        // Emit typing event
        socketRef.current.emit('typing', {
            channelId: selectedChannel._id,
            userId: user._id || user.id,
            userName: user.name
        });

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to emit stop_typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current.emit('stop_typing', {
                channelId: selectedChannel._id,
                userId: user._id || user.id
            });
        }, 2000);
    };

    const handleMessageInputChange = (e) => {
        setMessage(e.target.value);
        handleTyping();
    };

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!message.trim() || !selectedChannel) return;

        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Emit stop typing immediately when sending
        socketRef.current.emit('stop_typing', {
            channelId: selectedChannel._id,
            userId: user._id || user.id
        });

        // Send message via Socket.io
        socketRef.current.emit('send_message', {
            channelId: selectedChannel._id,
            userId: user._id || user.id,
            text: message.trim(),
            replyTo: replyingTo?._id || null
        });

        setMessage('');
        setReplyingTo(null);
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getAvatarColor = (name) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
        const index = name?.charCodeAt(0) % colors.length || 0;
        return colors[index];
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/chat/messages/${messageId}`, { headers });

            // Emit socket event for real-time update
            if (socketRef.current) {
                socketRef.current.emit('delete_message', {
                    messageId,
                    channelId: selectedChannel._id
                });
            }

            setDeleteConfirmModal({ show: false, type: null, id: null, name: null });
        } catch (error) {
            console.error('Error deleting message:', error);
            alert(error.response?.data?.message || 'Error deleting message. Only admins can delete messages.');
        }
    };

    const handleDeleteChannel = async (channelId) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/chat/channels/${channelId}`, { headers });

            // Emit socket event for real-time update
            if (socketRef.current) {
                socketRef.current.emit('delete_channel', { channelId });
            }

            setDeleteConfirmModal({ show: false, type: null, id: null, name: null });
        } catch (error) {
            console.error('Error deleting channel:', error);
            alert(error.response?.data?.message || 'Error deleting channel. Only admins can delete channels.');
        }
    };

    const confirmDelete = () => {
        if (deleteConfirmModal.type === 'message') {
            handleDeleteMessage(deleteConfirmModal.id);
        } else if (deleteConfirmModal.type === 'channel') {
            handleDeleteChannel(deleteConfirmModal.id);
        }
    };

    const handleEditMessage = async (messageId, newText) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.put(`${API_URL}/chat/messages/${messageId}`, { text: newText }, { headers });

            // Emit socket event for real-time update
            if (socketRef.current) {
                socketRef.current.emit('edit_message', {
                    message: response.data.data,
                    channelId: selectedChannel._id
                });
            }

            setEditMessageModal({ show: false, message: null });
        } catch (error) {
            console.error('Error editing message:', error);
            alert(error.response?.data?.message || 'Error editing message. Only admins can edit messages.');
        }
    };

    const handleEditChannel = async (channelId, updates) => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.put(`${API_URL}/chat/channels/${channelId}`, updates, { headers });

            // Emit socket event for real-time update
            if (socketRef.current) {
                socketRef.current.emit('edit_channel', { channel: response.data.channel });
            }

            setEditChannelModal({ show: false, channel: null });
        } catch (error) {
            console.error('Error editing channel:', error);
            alert(error.response?.data?.message || 'Error editing channel. Only admins can edit channels.');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading chat...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1>Team Chat</h1>
                <p>Communicate with your team in real-time</p>
            </div>

            <div className="card chat-container" style={{ height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
                {/* Channels Sidebar */}
                <div className="channels-sidebar" style={{ width: '250px', borderRight: '1px solid var(--border-color)', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '14px', margin: 0, color: 'var(--text-muted)' }}>CHANNELS</h3>
                        <button
                            className="create-channel-btn"
                            onClick={() => setShowChannelModal(true)}
                            style={{
                                background: 'var(--primary-blue)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Create Channel"
                        >
                            +
                        </button>
                    </div>
                    {channels.length > 0 ? channels.map((channel) => (
                        <div
                            key={channel._id}
                            style={{
                                padding: '10px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: selectedChannel?._id === channel._id ? 'var(--primary-blue-light)' : 'transparent',
                                marginBottom: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'relative'
                            }}
                        >
                            <span
                                style={{ fontSize: '14px', flex: 1 }}
                                onClick={() => setSelectedChannel(channel)}
                            >
                                # {channel.name}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {channel.unreadCount > 0 && (
                                    <span style={{
                                        background: 'var(--primary-blue)',
                                        color: 'white',
                                        fontSize: '11px',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        fontWeight: '600'
                                    }}>{channel.unreadCount}</span>
                                )}
                                {user.role === 'admin' && (
                                    <div className="menu-container" style={{ position: 'relative' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu({
                                                    type: 'channel',
                                                    id: activeMenu.id === channel._id ? null : channel._id
                                                });
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#6b7280',
                                                cursor: 'pointer',
                                                padding: '4px 6px',
                                                borderRadius: '4px',
                                                fontSize: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold'
                                            }}
                                            title="Options"
                                            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                                        >
                                            ⋮
                                        </button>
                                        {activeMenu.type === 'channel' && activeMenu.id === channel._id && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                background: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                zIndex: 1000,
                                                minWidth: '140px',
                                                marginTop: '4px'
                                            }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditChannelModal({ show: true, channel });
                                                        setActiveMenu({ type: null, id: null });
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        border: 'none',
                                                        background: 'white',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        color: '#374151',
                                                        borderBottom: '1px solid #f3f4f6'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#f9fafb'}
                                                    onMouseOut={(e) => e.target.style.background = 'white'}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmModal({
                                                            show: true,
                                                            type: 'channel',
                                                            id: channel._id,
                                                            name: channel.name
                                                        });
                                                        setActiveMenu({ type: null, id: null });
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        border: 'none',
                                                        background: 'white',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        color: '#ef4444'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#fef2f2'}
                                                    onMouseOut={(e) => e.target.style.background = 'white'}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No channels available</p>
                    )}
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {selectedChannel ? (
                        <>
                            {/* Channel Header */}
                            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                                <h3 style={{ margin: 0, fontSize: '16px' }}># {selectedChannel.name}</h3>
                                {selectedChannel.description && (
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {selectedChannel.description}
                                    </p>
                                )}
                            </div>

                            {/* Messages */}
                            <div style={{
                                flex: 1,
                                padding: '24px',
                                overflowY: 'auto',
                                background: '#f9fafb'
                            }} className="chat-messages">
                                {messages.length > 0 ? messages.map(msg => {
                                    const isOwnMessage = (msg.sender._id || msg.sender.id) === (user._id || user.id);
                                    return (
                                        <div
                                            key={msg._id}
                                            className="message-item"
                                            style={{
                                                marginBottom: '16px',
                                                display: 'flex',
                                                flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                                                gap: '12px',
                                                alignItems: 'flex-start'
                                            }}
                                        >
                                            {/* Avatar */}
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: getAvatarColor(msg.sender.name),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                flexShrink: 0
                                            }}>
                                                {getInitials(msg.sender.name)}
                                            </div>

                                            {/* Message Content */}
                                            <div style={{
                                                maxWidth: '70%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px'
                                            }}>
                                                {/* Sender Name & Time */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginBottom: '2px',
                                                    flexDirection: isOwnMessage ? 'row-reverse' : 'row'
                                                }}>
                                                    <span style={{
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        color: '#374151'
                                                    }}>
                                                        {isOwnMessage ? 'You' : msg.sender.name}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        color: '#9ca3af'
                                                    }}>
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Message Bubble */}
                                                <div style={{
                                                    background: isOwnMessage ? '#3b82f6' : 'white',
                                                    color: isOwnMessage ? 'white' : '#1f2937',
                                                    padding: '12px 16px',
                                                    borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                                    position: 'relative'
                                                }}>
                                                    {/* Reply Context */}
                                                    {msg.replyTo && (
                                                        <div style={{
                                                            background: isOwnMessage ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                                                            padding: '8px 10px',
                                                            borderRadius: '8px',
                                                            marginBottom: '8px',
                                                            borderLeft: `3px solid ${isOwnMessage ? 'rgba(255,255,255,0.5)' : '#3b82f6'}`,
                                                            fontSize: '12px'
                                                        }}>
                                                            <div style={{
                                                                color: isOwnMessage ? 'rgba(255,255,255,0.8)' : '#6b7280',
                                                                fontSize: '11px',
                                                                marginBottom: '2px',
                                                                fontWeight: '500'
                                                            }}>
                                                                ↩ {(msg.replyTo.sender._id || msg.replyTo.sender.id) === (user._id || user.id) ? 'You' : msg.replyTo.sender.name}
                                                            </div>
                                                            <div style={{
                                                                color: isOwnMessage ? 'rgba(255,255,255,0.9)' : '#4b5563',
                                                                fontStyle: 'italic'
                                                            }}>
                                                                {msg.replyTo.text.length > 60 ? msg.replyTo.text.substring(0, 60) + '...' : msg.replyTo.text}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Message Text */}
                                                    <div style={{
                                                        fontSize: '14px',
                                                        lineHeight: '1.5',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {msg.text}
                                                        {msg.isEdited && (
                                                            <span style={{
                                                                fontSize: '11px',
                                                                color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#9ca3af',
                                                                marginLeft: '6px',
                                                                fontStyle: 'italic'
                                                            }}>
                                                                (edited)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                                                    alignItems: 'center'
                                                }}>
                                                    <button
                                                        onClick={() => setReplyingTo(msg)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#6b7280',
                                                            fontSize: '12px',
                                                            cursor: 'pointer',
                                                            padding: '4px 8px',
                                                            fontWeight: '500',
                                                            transition: 'color 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.target.style.color = '#3b82f6'}
                                                        onMouseOut={(e) => e.target.style.color = '#6b7280'}
                                                    >
                                                        Reply
                                                    </button>
                                                    {user.role === 'admin' && (
                                                        <div className="menu-container" style={{ position: 'relative' }}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenu({
                                                                        type: 'message',
                                                                        id: activeMenu.id === msg._id ? null : msg._id
                                                                    });
                                                                }}
                                                                style={{
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    color: '#6b7280',
                                                                    cursor: 'pointer',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '14px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: 'bold'
                                                                }}
                                                                title="Options"
                                                                onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                                                                onMouseOut={(e) => e.target.style.background = 'transparent'}
                                                            >
                                                                ⋮
                                                            </button>
                                                            {activeMenu.type === 'message' && activeMenu.id === msg._id && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '100%',
                                                                    [isOwnMessage ? 'right' : 'left']: 0,
                                                                    background: 'white',
                                                                    border: '1px solid #e5e7eb',
                                                                    borderRadius: '6px',
                                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                                    zIndex: 1000,
                                                                    minWidth: '140px',
                                                                    marginTop: '4px'
                                                                }}>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditMessageModal({ show: true, message: msg });
                                                                            setActiveMenu({ type: null, id: null });
                                                                        }}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '10px 14px',
                                                                            border: 'none',
                                                                            background: 'white',
                                                                            textAlign: 'left',
                                                                            cursor: 'pointer',
                                                                            fontSize: '14px',
                                                                            color: '#374151',
                                                                            borderBottom: '1px solid #f3f4f6'
                                                                        }}
                                                                        onMouseOver={(e) => e.target.style.background = '#f9fafb'}
                                                                        onMouseOut={(e) => e.target.style.background = 'white'}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setDeleteConfirmModal({
                                                                                show: true,
                                                                                type: 'message',
                                                                                id: msg._id,
                                                                                name: 'this message'
                                                                            });
                                                                            setActiveMenu({ type: null, id: null });
                                                                        }}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '10px 14px',
                                                                            border: 'none',
                                                                            background: 'white',
                                                                            textAlign: 'left',
                                                                            cursor: 'pointer',
                                                                            fontSize: '14px',
                                                                            color: '#ef4444'
                                                                        }}
                                                                        onMouseOver={(e) => e.target.style.background = '#fef2f2'}
                                                                        onMouseOut={(e) => e.target.style.background = 'white'}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div style={{
                                        textAlign: 'center',
                                        color: '#9ca3af',
                                        marginTop: '60px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            fontSize: '48px',
                                            opacity: 0.3,
                                            width: '80px',
                                            height: '80px',
                                            border: '3px solid currentColor',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                background: 'currentColor',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                left: '20px',
                                                bottom: '25px'
                                            }}></div>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                background: 'currentColor',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                right: '20px',
                                                bottom: '25px'
                                            }}></div>
                                            <div style={{
                                                width: '30px',
                                                height: '3px',
                                                background: 'currentColor',
                                                borderRadius: '2px',
                                                position: 'absolute',
                                                bottom: '18px'
                                            }}></div>
                                        </div>
                                        <p style={{ fontSize: '16px', margin: 0 }}>No messages yet</p>
                                        <p style={{ fontSize: '14px', margin: 0, opacity: 0.7 }}>Start the conversation!</p>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
                                {/* Reply Preview */}
                                {replyingTo && (
                                    <div style={{
                                        background: '#f3f4f6',
                                        padding: '10px 12px',
                                        borderRadius: '6px',
                                        marginBottom: '12px',
                                        borderLeft: '3px solid var(--primary-blue)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>
                                                Replying to {(replyingTo.sender._id || replyingTo.sender.id) === (user._id || user.id) ? 'You' : replyingTo.sender.name}
                                            </div>
                                            <div style={{ color: 'var(--text-medium)', fontSize: '13px' }}>
                                                {replyingTo.text.length > 60 ? replyingTo.text.substring(0, 60) + '...' : replyingTo.text}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                fontSize: '20px',
                                                cursor: 'pointer',
                                                color: 'var(--text-muted)',
                                                padding: '0 4px',
                                                lineHeight: 1
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                {/* Typing Indicator */}
                                {typingUsers.length > 0 && (
                                    <div style={{
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                        color: '#6b7280',
                                        fontStyle: 'italic',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            gap: '3px',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{
                                                width: '6px',
                                                height: '6px',
                                                background: '#3b82f6',
                                                borderRadius: '50%',
                                                animation: 'bounce 1.4s infinite ease-in-out',
                                                animationDelay: '0s'
                                            }}></span>
                                            <span style={{
                                                width: '6px',
                                                height: '6px',
                                                background: '#3b82f6',
                                                borderRadius: '50%',
                                                animation: 'bounce 1.4s infinite ease-in-out',
                                                animationDelay: '0.2s'
                                            }}></span>
                                            <span style={{
                                                width: '6px',
                                                height: '6px',
                                                background: '#3b82f6',
                                                borderRadius: '50%',
                                                animation: 'bounce 1.4s infinite ease-in-out',
                                                animationDelay: '0.4s'
                                            }}></span>
                                        </div>
                                        <span>
                                            {typingUsers.length === 1
                                                ? `${typingUsers[0].userName} is typing`
                                                : typingUsers.length === 2
                                                ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing`
                                                : `${typingUsers.length} people are typing`
                                            }
                                        </span>
                                    </div>
                                )}

                                <form onSubmit={handleSendMessage}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input
                                            type="text"
                                            className="form-control message-input"
                                            placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                                            value={message}
                                            onChange={handleMessageInputChange}
                                            style={{ flex: 1 }}
                                        />
                                        <button type="submit" className="btn btn-primary">Send</button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Select a channel to start chatting</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Channel Modal */}
            {showChannelModal && (
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
                        maxWidth: '450px'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Create New Channel</h2>
                        <form onSubmit={handleCreateChannel}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Channel Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={channelForm.name}
                                    onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                                    placeholder="e.g., general, development"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Description</label>
                                <textarea
                                    className="form-control"
                                    value={channelForm.description}
                                    onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
                                    rows="3"
                                    placeholder="What's this channel about?"
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Related Project (Optional)</label>
                                <select
                                    className="form-control"
                                    value={channelForm.projectId}
                                    onChange={(e) => setChannelForm({ ...channelForm, projectId: e.target.value })}
                                >
                                    <option value="">None</option>
                                    {projects.map(project => (
                                        <option key={project._id} value={project._id}>{project.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={channelForm.isPrivate}
                                        onChange={(e) => setChannelForm({ ...channelForm, isPrivate: e.target.checked })}
                                    />
                                    <span style={{ fontSize: '14px' }}>Make this channel private</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowChannelModal(false);
                                        setChannelForm({ name: '', description: '', projectId: '', isPrivate: false });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Channel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmModal.show && (
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
                        maxWidth: '450px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: '#fef2f2',
                                border: '2px solid #ef4444',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ef4444',
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}>
                                !
                            </div>
                            <h2 style={{ margin: 0, color: '#ef4444', fontSize: '20px' }}>
                                Confirm Deletion
                            </h2>
                        </div>
                        <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6' }}>
                            Are you sure you want to delete <strong>{deleteConfirmModal.name}</strong>?
                            {deleteConfirmModal.type === 'channel' && (
                                <span style={{ display: 'block', marginTop: '8px', color: '#ef4444', fontSize: '14px' }}>
                                    Warning: This will also delete all messages in this channel.
                                </span>
                            )}
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>
                            This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setDeleteConfirmModal({ show: false, type: null, id: null, name: null })}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    background: 'white',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#ef4444',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#dc2626'}
                                onMouseOut={(e) => e.target.style.background = '#ef4444'}
                            >
                                Delete {deleteConfirmModal.type === 'channel' ? 'Channel' : 'Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Channel Modal */}
            {editChannelModal.show && editChannelModal.channel && (
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
                        maxWidth: '450px'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Edit Channel</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            handleEditChannel(editChannelModal.channel._id, {
                                name: formData.get('name'),
                                description: formData.get('description'),
                                isPrivate: formData.get('isPrivate') === 'on'
                            });
                        }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Channel Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    defaultValue={editChannelModal.channel.name}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    defaultValue={editChannelModal.channel.description || ''}
                                    rows="3"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="isPrivate"
                                        defaultChecked={editChannelModal.channel.isPrivate}
                                    />
                                    <span style={{ fontSize: '14px' }}>Make this channel private</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setEditChannelModal({ show: false, channel: null })}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Message Modal */}
            {editMessageModal.show && editMessageModal.message && (
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
                        maxWidth: '500px'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Edit Message</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const newText = formData.get('messageText');
                            if (newText.trim()) {
                                handleEditMessage(editMessageModal.message._id, newText.trim());
                            }
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Message Text *</label>
                                <textarea
                                    name="messageText"
                                    className="form-control"
                                    defaultValue={editMessageModal.message.text}
                                    rows="4"
                                    required
                                    autoFocus
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setEditMessageModal({ show: false, message: null })}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
