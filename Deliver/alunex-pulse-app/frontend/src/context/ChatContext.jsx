import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { user, token, API_URL } = useAuth();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef(null);

    // Fetch unread count
    const fetchUnreadCount = async () => {
        if (!token || !user) return;

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${API_URL}/chat/unread-count`, { headers });
            setUnreadCount(response.data.count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Initialize socket connection and fetch initial count
    useEffect(() => {
        if (!user || !token) {
            setUnreadCount(0);
            return;
        }

        // Fetch initial unread count
        fetchUnreadCount();

        // Initialize Socket.io connection for real-time updates
        const socketUrl = API_URL.replace('/api', '');
        socketRef.current = io(socketUrl);

        socketRef.current.on('connect', () => {
            console.log('Chat socket connected');
        });

        // Listen for new messages globally (all channels)
        socketRef.current.on('new_message_global', (data) => {
            // Only increment if the message is not from the current user
            const senderId = data.senderId || data.message?.sender?._id || data.message?.sender?.id;
            const currentUserId = user._id || user.id;

            // Don't increment if message is from current user OR user is on chat page
            const isOnChatPage = window.location.pathname === '/chat';

            if (senderId && senderId !== currentUserId && !isOnChatPage) {
                setUnreadCount(prev => prev + 1);
            }
        });

        // Refresh count when messages are marked as read by ANY user
        socketRef.current.on('messages_marked_read', (data) => {
            const currentUserId = user._id || user.id;
            // Only refresh if this user marked messages as read
            if (data.userId === currentUserId) {
                fetchUnreadCount();
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user, token, API_URL]);

    // Handle navigation to/from chat page
    useEffect(() => {
        if (location.pathname === '/chat') {
            // User is on chat page, clear the badge immediately
            setUnreadCount(0);
        } else if (user && token) {
            // User navigated away from chat, fetch actual unread count
            fetchUnreadCount();
        }
    }, [location.pathname]);

    // Decrement unread count (called when user reads messages)
    const decrementUnreadCount = (count) => {
        setUnreadCount(prev => Math.max(0, prev - count));
    };

    // Refresh unread count
    const refreshUnreadCount = () => {
        fetchUnreadCount();
    };

    const value = {
        unreadCount,
        decrementUnreadCount,
        refreshUnreadCount,
        socket: socketRef.current
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
