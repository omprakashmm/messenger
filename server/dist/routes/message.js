"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Message_1 = __importDefault(require("../models/Message"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
// Configure multer for memory storage
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        // Allow images, videos, and documents
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    },
});
// Configure Cloudinary (if credentials are available)
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
const router = (0, express_1.Router)();
// Upload file endpoint
router.post('/upload', auth_1.authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const file = req.file;
        let url = '';
        // Try Cloudinary if configured
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
            try {
                // Convert buffer to base64
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = `data:${file.mimetype};base64,${b64}`;
                // Upload to Cloudinary
                const result = await cloudinary_1.v2.uploader.upload(dataURI, {
                    folder: 'messenger',
                    resource_type: 'auto',
                });
                url = result.secure_url;
            }
            catch (cloudinaryError) {
                console.error('Cloudinary upload failed, using base64 fallback:', cloudinaryError);
                // Fall back to base64
                url = `data:${file.mimetype};base64,${Buffer.from(file.buffer).toString('base64')}`;
            }
        }
        else {
            // Use base64 if Cloudinary not configured
            console.log('Cloudinary not configured, using base64 encoding');
            url = `data:${file.mimetype};base64,${Buffer.from(file.buffer).toString('base64')}`;
        }
        // Determine message type
        let type = 'file';
        if (file.mimetype.startsWith('image')) {
            type = 'image';
        }
        else if (file.mimetype.startsWith('video')) {
            type = 'video';
        }
        else if (file.mimetype.startsWith('audio')) {
            type = 'audio';
        }
        res.json({
            url: url,
            type: type,
        });
    }
    catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});
// Get conversations
router.get('/conversations', auth_1.authenticateToken, async (req, res) => {
    try {
        const conversations = await Conversation_1.default.find({
            participants: req.userId,
        })
            .populate('participants', 'username avatar status')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 });
        res.json({ conversations });
    }
    catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Create or get direct conversation
router.post('/conversations/direct', auth_1.authenticateToken, async (req, res) => {
    try {
        const { participantId } = req.body;
        if (!participantId) {
            return res.status(400).json({ error: 'Participant ID required' });
        }
        // Prevent self-conversation
        if (participantId === req.userId) {
            return res.status(400).json({ error: 'Cannot create conversation with yourself' });
        }
        // Check if conversation already exists
        let conversation = await Conversation_1.default.findOne({
            type: 'direct',
            participants: { $all: [req.userId, participantId] },
        })
            .populate('participants', 'username avatar status')
            .populate('lastMessage');
        if (!conversation) {
            // Create new conversation
            conversation = new Conversation_1.default({
                type: 'direct',
                participants: [req.userId, participantId],
                createdBy: req.userId,
            });
            await conversation.save();
            await conversation.populate('participants', 'username avatar status');
        }
        res.json({ conversation });
    }
    catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Create group conversation
router.post('/conversations/group', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name, participantIds, avatar, description } = req.body;
        if (!name || !participantIds || participantIds.length < 2) {
            return res.status(400).json({
                error: 'Group name and at least 2 participants required',
            });
        }
        const conversation = new Conversation_1.default({
            type: 'group',
            name,
            participants: [req.userId, ...participantIds],
            admins: [req.userId],
            avatar,
            description,
            createdBy: req.userId,
        });
        await conversation.save();
        await conversation.populate('participants', 'username avatar status');
        res.status(201).json({ conversation });
    }
    catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get messages for a conversation
router.get('/conversations/:conversationId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;
        const query = {
            conversationId,
            isDeleted: false,
        };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }
        const messages = await Message_1.default.find(query)
            .populate('sender', 'username avatar')
            .populate('replyTo')
            .sort({ createdAt: -1 })
            .limit(Number(limit));
        res.json({ messages: messages.reverse() });
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Send message (HTTP fallback, mainly using Socket.io)
router.post('/send', auth_1.authenticateToken, async (req, res) => {
    try {
        const { conversationId, content, type = 'text', replyTo } = req.body;
        if (!conversationId || !content) {
            return res.status(400).json({ error: 'Conversation ID and content required' });
        }
        const message = new Message_1.default({
            conversationId,
            sender: req.userId,
            content,
            type,
            replyTo,
        });
        await message.save();
        await message.populate('sender', 'username avatar');
        // Update conversation
        await Conversation_1.default.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            lastMessageAt: new Date(),
        });
        res.status(201).json({ message });
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Delete message
router.delete('/:messageId', auth_1.authenticateToken, async (req, res) => {
    try {
        const message = await Message_1.default.findById(req.params.messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        if (message.sender.toString() !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        message.isDeleted = true;
        message.deletedAt = new Date();
        await message.save();
        res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
