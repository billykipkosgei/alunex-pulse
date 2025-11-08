// Load .env file only in development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const passport = require('./config/passport');
const connectDB = require('./config/database');
const initializeAdmin = require('./scripts/initializeAdmin');
const initializeGeneralWork = require('./scripts/initializeGeneralWork');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'https://billyk.online',
            'https://billyk.online/alunex-production',
            process.env.FRONTEND_URL
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Connect to MongoDB and initialize admin
connectDB().then(() => {
    // Initialize admin user and General Work project after database connection
    initializeAdmin();
    initializeGeneralWork();
});

// Make io accessible in routes
app.set('io', io);

// Middleware - CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'https://billyk.online',
    'https://billyk.online/alunex-production',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list or matches pattern
        if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/subtasks', require('./routes/subtask.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/timetracking', require('./routes/timeTracking.routes'));
app.use('/api/files', require('./routes/file.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/meetings', require('./routes/meeting.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Socket.io connection handling
const Message = require('./models/Message.model');
const Channel = require('./models/Channel.model');

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join chat channel
    socket.on('join_channel', (channelId) => {
        socket.join(channelId);
        console.log(`User ${socket.id} joined channel ${channelId}`);
    });

    // Leave chat channel
    socket.on('leave_channel', (channelId) => {
        socket.leave(channelId);
        console.log(`User ${socket.id} left channel ${channelId}`);
    });

    // Handle chat messages
    socket.on('send_message', async (data) => {
        try {
            const { channelId, userId, text, replyTo } = data;

            // Save message to database
            const message = await Message.create({
                channel: channelId,
                sender: userId,
                text,
                replyTo: replyTo || null,
                readBy: [userId]
            });

            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'name email')
                .populate({
                    path: 'replyTo',
                    populate: {
                        path: 'sender',
                        select: 'name email'
                    }
                });

            // Update channel's updatedAt
            await Channel.findByIdAndUpdate(channelId, { updatedAt: new Date() });

            // Broadcast to all users in the channel
            io.to(channelId).emit('receive_message', populatedMessage);

            // Broadcast globally to all connected users for unread count update
            io.emit('new_message_global', {
                channelId,
                senderId: userId,
                message: populatedMessage
            });
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('message_error', { error: 'Failed to send message' });
        }
    });

    // Handle message editing
    socket.on('edit_message', async (data) => {
        try {
            const { message, channelId } = data;

            // Broadcast edit to all users in the channel
            io.to(channelId).emit('message_edited', { message });
        } catch (error) {
            console.error('Error editing message:', error);
            socket.emit('edit_error', { error: 'Failed to edit message' });
        }
    });

    // Handle channel editing
    socket.on('edit_channel', async (data) => {
        try {
            const { channel } = data;

            // Broadcast channel edit to all users
            io.emit('channel_edited', { channel });
        } catch (error) {
            console.error('Error editing channel:', error);
            socket.emit('edit_error', { error: 'Failed to edit channel' });
        }
    });

    // Handle message deletion
    socket.on('delete_message', async (data) => {
        try {
            const { messageId, channelId } = data;

            // Broadcast deletion to all users in the channel
            io.to(channelId).emit('message_deleted', { messageId, channelId });
        } catch (error) {
            console.error('Error deleting message:', error);
            socket.emit('delete_error', { error: 'Failed to delete message' });
        }
    });

    // Handle channel deletion
    socket.on('delete_channel', async (data) => {
        try {
            const { channelId } = data;

            // Broadcast channel deletion to all users
            io.emit('channel_deleted', { channelId });
        } catch (error) {
            console.error('Error deleting channel:', error);
            socket.emit('delete_error', { error: 'Failed to delete channel' });
        }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
        // Broadcast to all users in the channel except the sender
        socket.to(data.channelId).emit('user_typing', {
            userId: data.userId,
            userName: data.userName,
            channelId: data.channelId,
            isTyping: true
        });
    });

    // Handle stop typing indicator
    socket.on('stop_typing', (data) => {
        // Broadcast to all users in the channel except the sender
        socket.to(data.channelId).emit('user_stop_typing', {
            userId: data.userId,
            channelId: data.channelId,
            isTyping: false
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Debug route to check OAuth env variables (temporary)
app.get('/api/debug/oauth-env', (req, res) => {
    res.json({
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasGoogleCallbackUrl: !!process.env.GOOGLE_CALLBACK_URL,
        hasMicrosoftClientId: !!process.env.MICROSOFT_CLIENT_ID,
        hasMicrosoftClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
        hasMicrosoftCallbackUrl: !!process.env.MICROSOFT_CALLBACK_URL,
        googleClientIdPreview: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'not set',
        nodeEnv: process.env.NODE_ENV
    });
});

// Debug route to check SMTP env variables (temporary)
app.get('/api/debug/smtp-env', (req, res) => {
    res.json({
        hasSmtpHost: !!process.env.SMTP_HOST,
        hasSmtpPort: !!process.env.SMTP_PORT,
        hasSmtpUser: !!process.env.SMTP_USER,
        hasSmtpPass: !!process.env.SMTP_PASS,
        smtpHost: process.env.SMTP_HOST || 'not set',
        smtpPort: process.env.SMTP_PORT || 'not set',
        smtpUser: process.env.SMTP_USER || 'not set',
        frontendUrl: process.env.FRONTEND_URL || 'not set'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
