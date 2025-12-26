import { Router, Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        // Allow images, videos, and documents
        const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    },
});

// Configure Cloudinary (if credentials are available)
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

const router = Router();

// Upload file endpoint
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
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
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'messenger',
                    resource_type: 'auto',
                });

                url = result.secure_url;
            } catch (cloudinaryError) {
                console.error('Cloudinary upload failed, using base64 fallback:', cloudinaryError);
                // Fall back to base64
                url = `data:${file.mimetype};base64,${Buffer.from(file.buffer).toString('base64')}`;
            }
        } else {
            // Use base64 if Cloudinary not configured
            console.log('Cloudinary not configured, using base64 encoding');
            url = `data:${file.mimetype};base64,${Buffer.from(file.buffer).toString('base64')}`;
        }

        // Determine message type
        let type = 'file';
        if (file.mimetype.startsWith('image')) {
            type = 'image';
        } else if (file.mimetype.startsWith('video')) {
            type = 'video';
        } else if (file.mimetype.startsWith('audio')) {
            type = 'audio';
        }

        res.json({
            url: url,
            type: type,
        });
    } catch (error: any) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});


// Get conversations
router.get('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const conversations = await Conversation.find({
            participants: req.userId,
        })
            .populate('participants', 'username avatar status')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 });

        res.json({ conversations });
    } catch (error: any) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create or get direct conversation
router.post('/conversations/direct', authenticateToken, async (req: AuthRequest, res: Response) => {
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
        let conversation = await Conversation.findOne({
            type: 'direct',
            participants: { $all: [req.userId, participantId] },
        })
            .populate('participants', 'username avatar status')
            .populate('lastMessage');

        if (!conversation) {
            // Create new conversation
            conversation = new Conversation({
                type: 'direct',
                participants: [req.userId, participantId],
                createdBy: req.userId,
            });
            await conversation.save();
            await conversation.populate('participants', 'username avatar status');
        }

        res.json({ conversation });
    } catch (error: any) {
        console.error('Create conversation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create group conversation
router.post('/conversations/group', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { name, participantIds, avatar, description } = req.body;

        if (!name || !participantIds || participantIds.length < 2) {
            return res.status(400).json({
                error: 'Group name and at least 2 participants required',
            });
        }

        const conversation = new Conversation({
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
    } catch (error: any) {
        console.error('Create group error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get messages for a conversation
router.get('/conversations/:conversationId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;

        const query: any = {
            conversationId,
            isDeleted: false,
        };

        if (before) {
            query.createdAt = { $lt: new Date(before as string) };
        }

        const messages = await Message.find(query)
            .populate('sender', 'username avatar')
            .populate('replyTo')
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.json({ messages: messages.reverse() });
    } catch (error: any) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send message (HTTP fallback, mainly using Socket.io)
router.post('/send', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { conversationId, content, type = 'text', replyTo } = req.body;

        if (!conversationId || !content) {
            return res.status(400).json({ error: 'Conversation ID and content required' });
        }

        const message = new Message({
            conversationId,
            sender: req.userId,
            content,
            type,
            replyTo,
        });

        await message.save();
        await message.populate('sender', 'username avatar');

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            lastMessageAt: new Date(),
        });

        res.status(201).json({ message });
    } catch (error: any) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete message
router.delete('/:messageId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const message = await Message.findById(req.params.messageId);

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
    } catch (error: any) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
