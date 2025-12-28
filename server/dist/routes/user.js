"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
// Configure multer for memory storage
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
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
// Get current user
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Return user with consistent 'id' field
        res.json({
            id: user._id,
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            status: user.status,
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get all users (search)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { search } = req.query;
        const query = { _id: { $ne: req.userId } };
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const users = await User_1.default.find(query)
            .select('username email avatar bio status lastSeen')
            .limit(50);
        res.json({ users });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get user by ID
router.get('/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.userId)
            .select('username email avatar bio status lastSeen');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Upload avatar
router.post('/avatar', auth_1.authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        let avatarUrl = '';
        // Try Cloudinary first
        if (process.env.CLOUDINARY_CLOUD_NAME) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: 'messenger/avatars',
                    transformation: [
                        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                        { quality: 'auto:good' },
                    ],
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                uploadStream.end(req.file.buffer);
            });
            avatarUrl = result.secure_url;
        }
        else {
            // Fallback to base64 (not recommended for production)
            avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
        // Update user avatar
        await User_1.default.findByIdAndUpdate(req.userId, { avatar: avatarUrl });
        res.json({ avatarUrl });
    }
    catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});
// Update user profile
router.patch('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { username, bio, avatar, phone } = req.body;
        const updates = {};
        if (username)
            updates.username = username;
        if (bio !== undefined)
            updates.bio = bio;
        if (avatar !== undefined)
            updates.avatar = avatar;
        if (phone !== undefined)
            updates.phone = phone;
        const user = await User_1.default.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                status: user.status,
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Add contact
router.post('/contacts/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.userId);
        const contact = await User_1.default.findById(req.params.userId);
        if (!user || !contact) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.contacts.includes(contact._id)) {
            return res.status(400).json({ error: 'Contact already added' });
        }
        user.contacts.push(contact._id);
        await user.save();
        res.json({ message: 'Contact added successfully' });
    }
    catch (error) {
        console.error('Add contact error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Remove contact
router.delete('/contacts/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.contacts = user.contacts.filter((id) => id.toString() !== req.params.userId);
        await user.save();
        res.json({ message: 'Contact removed successfully' });
    }
    catch (error) {
        console.error('Remove contact error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
