import { Router, Response } from 'express';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

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

// Update user profile
router.patch('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { username, bio, avatar } = req.body;
        const updates: any = {};

        if (username) updates.username = username;
        if (bio !== undefined) updates.bio = bio;
        if (avatar !== undefined) updates.avatar = avatar;

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
