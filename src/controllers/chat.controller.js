const Channel = require('../models/Channel.model');
const Message = require('../models/Message.model');

// Get all channels for the user
exports.getChannels = async (req, res) => {
    try {
        const userId = req.user.id;

        const channels = await Channel.find({
            isDeleted: false,
            $or: [
                { members: userId },
                { isPrivate: false }
            ]
        })
            .populate('project', 'name')
            .populate('createdBy', 'name email')
            .sort({ updatedAt: -1 });

        // Get unread count for each channel
        const channelsWithUnread = await Promise.all(channels.map(async (channel) => {
            const unreadCount = await Message.countDocuments({
                channel: channel._id,
                sender: { $ne: userId },
                readBy: { $ne: userId }
            });

            return {
                ...channel.toObject(),
                unreadCount
            };
        }));

        res.status(200).json({
            success: true,
            channels: channelsWithUnread
        });
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching channels'
        });
    }
};

// Get messages for a specific channel
exports.getMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.id;
        const { limit = 50 } = req.query;

        const messages = await Message.find({
            channel: channelId,
            isDeleted: false
        })
            .populate('sender', 'name email')
            .populate({
                path: 'replyTo',
                populate: {
                    path: 'sender',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Mark messages as read
        const updateResult = await Message.updateMany(
            {
                channel: channelId,
                sender: { $ne: userId },
                readBy: { $ne: userId }
            },
            {
                $addToSet: { readBy: userId }
            }
        );

        // If messages were marked as read, emit event for real-time update
        if (updateResult.modifiedCount > 0) {
            const io = req.app.get('io');
            if (io) {
                io.emit('messages_marked_read', { userId, channelId });
            }
        }

        res.status(200).json({
            success: true,
            messages: messages.reverse()
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
};

// Send a message (also handled by Socket.io, but this is for REST API)
exports.sendMessage = async (req, res) => {
    try {
        const { channelId, text, replyTo } = req.body;
        const userId = req.user.id;

        if (!channelId || !text) {
            return res.status(400).json({
                success: false,
                message: 'Channel ID and text are required'
            });
        }

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

        res.status(201).json({
            success: true,
            message: populatedMessage
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
};

// Create a new channel
exports.createChannel = async (req, res) => {
    try {
        const { name, description, projectId, isPrivate } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Channel name is required'
            });
        }

        const channel = await Channel.create({
            name,
            description,
            project: projectId,
            isPrivate: isPrivate || false,
            createdBy: userId,
            members: [userId]
        });

        const populatedChannel = await Channel.findById(channel._id)
            .populate('project', 'name')
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            channel: populatedChannel
        });
    } catch (error) {
        console.error('Error creating channel:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating channel'
        });
    }
};

// Delete a message (Admin only)
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if user is admin
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete messages'
            });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        if (message.isDeleted) {
            return res.status(400).json({
                success: false,
                message: 'Message already deleted'
            });
        }

        // Soft delete
        message.isDeleted = true;
        message.deletedBy = userId;
        message.deletedAt = new Date();
        await message.save();

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
            messageId: messageId
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting message'
        });
    }
};

// Update/Edit a message (Admin only)
exports.updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if user is admin
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can edit messages'
            });
        }

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message text is required'
            });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        if (message.isDeleted) {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit deleted message'
            });
        }

        // Update message
        message.text = text.trim();
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate('sender', 'name email')
            .populate({
                path: 'replyTo',
                populate: {
                    path: 'sender',
                    select: 'name email'
                }
            });

        res.status(200).json({
            success: true,
            message: 'Message updated successfully',
            data: updatedMessage
        });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating message'
        });
    }
};

// Update/Edit a channel (Admin only)
exports.updateChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { name, description, isPrivate } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if user is admin
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can edit channels'
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Channel name is required'
            });
        }

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        if (channel.isDeleted) {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit deleted channel'
            });
        }

        // Update channel
        channel.name = name.trim();
        if (description !== undefined) channel.description = description;
        if (isPrivate !== undefined) channel.isPrivate = isPrivate;
        await channel.save();

        const updatedChannel = await Channel.findById(channelId)
            .populate('project', 'name')
            .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Channel updated successfully',
            channel: updatedChannel
        });
    } catch (error) {
        console.error('Error updating channel:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating channel'
        });
    }
};

// Get total unread message count across all channels
exports.getTotalUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all channels the user has access to
        const channels = await Channel.find({
            isDeleted: false,
            $or: [
                { members: userId },
                { isPrivate: false }
            ]
        }).select('_id');

        const channelIds = channels.map(ch => ch._id);

        // Count all unread messages across all channels
        const totalUnreadCount = await Message.countDocuments({
            channel: { $in: channelIds },
            sender: { $ne: userId },
            readBy: { $ne: userId },
            isDeleted: false
        });

        res.status(200).json({
            success: true,
            count: totalUnreadCount
        });
    } catch (error) {
        console.error('Error fetching total unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unread count'
        });
    }
};

// Delete a channel (Admin only)
exports.deleteChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if user is admin
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete channels'
            });
        }

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        if (channel.isDeleted) {
            return res.status(400).json({
                success: false,
                message: 'Channel already deleted'
            });
        }

        // Soft delete channel
        channel.isDeleted = true;
        channel.deletedBy = userId;
        channel.deletedAt = new Date();
        await channel.save();

        // Also soft delete all messages in the channel
        await Message.updateMany(
            { channel: channelId, isDeleted: false },
            {
                isDeleted: true,
                deletedBy: userId,
                deletedAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            message: 'Channel and all messages deleted successfully',
            channelId: channelId
        });
    } catch (error) {
        console.error('Error deleting channel:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting channel'
        });
    }
};
