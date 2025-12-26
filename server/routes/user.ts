import { Router, Response } from 'express';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
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

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users (search)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { search } = req.query;
        const query: any = { _id: { $ne: req.userId } };

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(query)
            .select('username email avatar bio status lastSeen')
            .limit(50);

        res.json({ users });
    } catch (error: any) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user by ID
router.get('/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('username email avatar bio status lastSeen');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let avatarUrl = '';

        // Try Cloudinary first
        if (process.env.CLOUDINARY_CLOUD_NAME) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'messenger/avatars',
                        transformation: [
                            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                            { quality: 'auto:good' },
                        ],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file!.buffer);
            });
            avatarUrl = (result as any).secure_url;
        } else {
            // Fallback to base64 (not recommended for production)
            avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        // Update user avatar
        await User.findByIdAndUpdate(req.userId, { avatar: avatarUrl });

        res.json({ avatarUrl });
    } catch (error: any) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// Update user profile
router.patch('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { username, bio, avatar, phone } = req.body;
        const updates: any = {};

        if (username) updates.username = username;
        if (bio !== undefined) updates.bio = bio;
        if (avatar !== undefined) updates.avatar = avatar;
        if (phone !== undefined) updates.phone = phone;

        const user = await User.findByIdAndUpdate(
            req.userId,
            updates,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add contact
router.post('/contacts/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        const contact = await User.findById(req.params.userId);

        if (!user || !contact) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.contacts.includes(contact._id)) {
            return res.status(400).json({ error: 'Contact already added' });
        }

        user.contacts.push(contact._id);
        await user.save();

        res.json({ message: 'Contact added successfully' });
    } catch (error: any) {
        console.error('Add contact error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove contact
router.delete('/contacts/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.contacts = user.contacts.filter(
            (id) => id.toString() !== req.params.userId
        );
        await user.save();

        res.json({ message: 'Contact removed successfully' });
    } catch (error: any) {
        console.error('Remove contact error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
