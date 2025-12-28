"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSocketConnection = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const User_1 = __importDefault(require("../models/User"));
const userSockets = new Map(); // userId -> socketId
const handleSocketConnection = (io, socket) => {
    const userId = socket.data.userId;
    // Store user socket mapping
    userSockets.set(userId, socket.id);
    // Update user status to online
    updateUserStatus(userId, 'online');
    // Join user's personal room
    socket.join(`user:${userId}`);
    // Handle joining conversation rooms
    socket.on('join:conversation', async (conversationId) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);
    });
    // Handle leaving conversation rooms
    socket.on('leave:conversation', (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
        console.log(`User ${userId} left conversation ${conversationId}`);
    });
    // Handle sending messages
    socket.on('message:send', async (data) => {
        try {
            const { conversationId, content, type = 'text', replyTo, fileUrl, fileName, fileSize } = data;
            // Create message
            const message = new Message_1.default({
                conversationId,
                sender: userId,
                content,
                type,
                replyTo,
                fileUrl,
                fileName,
                fileSize,
                status: 'sent',
                sentAt: new Date(),
            });
            await message.save();
            await message.populate('sender', 'username avatar');
            if (replyTo) {
                await message.populate('replyTo');
            }
            // Update conversation
            await Conversation_1.default.findByIdAndUpdate(conversationId, {
                lastMessage: message._id,
                lastMessageAt: new Date(),
            });
            // Emit to conversation room
            const messageWithTempId = {
                ...message.toObject(),
                tempId: data.tempId,
            };
            io.to(`conversation:${conversationId}`).emit('message:new', messageWithTempId);
            // Send delivery confirmation to sender
            socket.emit('message:sent', { tempId: data.tempId, message });
            // Auto-mark as delivered for online users in conversation
            setTimeout(async () => {
                const conversation = await Conversation_1.default.findById(conversationId);
                if (conversation) {
                    message.status = 'delivered';
                    message.deliveredAt = new Date();
                    await message.save();
                    io.to(`conversation:${conversationId}`).emit('message:delivered', {
                        messageId: message._id,
                        deliveredAt: message.deliveredAt,
                    });
                }
            }, 100);
        }
        catch (error) {
            console.error('Send message error:', error);
            socket.emit('message:error', { error: 'Failed to send message' });
        }
    });
    // Handle typing indicators
    socket.on('typing:start', (conversationId) => {
        socket.to(`conversation:${conversationId}`).emit('typing:user', {
            userId,
            conversationId,
            isTyping: true,
        });
    });
    socket.on('typing:stop', (conversationId) => {
        socket.to(`conversation:${conversationId}`).emit('typing:user', {
            userId,
            conversationId,
            isTyping: false,
        });
    });
    // Handle message reactions
    socket.on('message:react', async (data) => {
        try {
            const { messageId, emoji } = data;
            const message = await Message_1.default.findById(messageId);
            if (!message) {
                return socket.emit('message:error', { error: 'Message not found' });
            }
            // Check if user already reacted with this emoji
            const existingReaction = message.reactions.find((r) => r.userId.toString() === userId && r.emoji === emoji);
            if (existingReaction) {
                // Remove reaction
                message.reactions = message.reactions.filter((r) => !(r.userId.toString() === userId && r.emoji === emoji));
            }
            else {
                // Add reaction
                message.reactions.push({ userId, emoji });
            }
            await message.save();
            io.to(`conversation:${message.conversationId}`).emit('message:reaction', {
                messageId,
                userId,
                emoji,
                action: existingReaction ? 'remove' : 'add',
            });
        }
        catch (error) {
            console.error('React to message error:', error);
            socket.emit('message:error', { error: 'Failed to react to message' });
        }
    });
    // Handle message read receipts
    socket.on('message:read', async (data) => {
        try {
            const { messageId, conversationId } = data;
            const message = await Message_1.default.findById(messageId);
            if (!message)
                return;
            // Check if already marked as read
            const alreadyRead = message.readBy.some((r) => r.userId.toString() === userId);
            if (!alreadyRead) {
                message.readBy.push({ userId, readAt: new Date() });
                message.status = 'seen';
                message.seenAt = new Date();
                await message.save();
                io.to(`conversation:${conversationId}`).emit('message:read', {
                    messageId,
                    userId,
                    readAt: new Date(),
                });
                // Notify sender about seen status
                io.to(`conversation:${conversationId}`).emit('message:seen', {
                    messageId,
                    seenAt: message.seenAt,
                });
            }
        }
        catch (error) {
            console.error('Mark message as read error:', error);
        }
    });
    // Handle message edit
    socket.on('message:edit', async (data) => {
        try {
            const { messageId, newContent } = data;
            const message = await Message_1.default.findById(messageId);
            if (!message || message.sender.toString() !== userId) {
                return socket.emit('message:error', { error: 'Unauthorized' });
            }
            // Save to edit history
            if (!message.editHistory) {
                message.editHistory = [];
            }
            message.editHistory.push({
                content: message.content,
                editedAt: new Date(),
            });
            message.content = newContent;
            message.isEdited = true;
            await message.save();
            io.to(`conversation:${message.conversationId}`).emit('message:edited', {
                messageId,
                newContent,
                editedAt: new Date(),
            });
        }
        catch (error) {
            console.error('Edit message error:', error);
            socket.emit('message:error', { error: 'Failed to edit message' });
        }
    });
    // Handle message deletion (for me / for everyone)
    socket.on('message:delete', async (data) => {
        try {
            const { messageId, deleteForEveryone = false } = data;
            const message = await Message_1.default.findById(messageId);
            if (!message) {
                return socket.emit('message:error', { error: 'Message not found' });
            }
            if (deleteForEveryone) {
                // Delete for everyone (only sender can do this)
                if (message.sender.toString() !== userId) {
                    return socket.emit('message:error', { error: 'Unauthorized' });
                }
                message.isDeleted = true;
                message.deletedAt = new Date();
                message.content = 'This message was deleted';
                await message.save();
                io.to(`conversation:${message.conversationId}`).emit('message:deleted', {
                    messageId,
                    deleteForEveryone: true,
                });
            }
            else {
                // Delete for me only
                if (!message.deletedFor) {
                    message.deletedFor = [];
                }
                message.deletedFor.push(userId);
                await message.save();
                socket.emit('message:deleted', {
                    messageId,
                    deleteForEveryone: false,
                });
            }
        }
        catch (error) {
            console.error('Delete message error:', error);
            socket.emit('message:error', { error: 'Failed to delete message' });
        }
    });
    // Handle user status updates
    socket.on('status:update', async (status) => {
        await updateUserStatus(userId, status);
        // Notify all contacts
        io.emit('user:status', { userId, status });
    });
    // Handle disconnect
    socket.on('disconnect', async () => {
        console.log(`User ${userId} disconnected`);
        userSockets.delete(userId);
        await updateUserStatus(userId, 'offline');
        io.emit('user:status', { userId, status: 'offline' });
    });
};
exports.handleSocketConnection = handleSocketConnection;
async function updateUserStatus(userId, status) {
    try {
        await User_1.default.findByIdAndUpdate(userId, {
            status,
            lastSeen: new Date(),
        });
    }
    catch (error) {
        console.error('Update user status error:', error);
    }
}
