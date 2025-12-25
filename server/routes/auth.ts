import { Router, Response } from 'express';
import User from '../models/User';
import { generateToken, AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req, res: Response) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken',
            });
        }

        // Create user
        const user = new User({
            username,
            email,
            password,
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                status: user.status,
            },
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login
router.post('/login', async (req, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update status
        user.status = 'online';
        user.lastSeen = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id.toString());

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                status: user.status,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Logout
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        if (user) {
            user.status = 'offline';
            user.lastSeen = new Date();
            await user.save();
        }

        res.json({ message: 'Logout successful' });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error during logout' });
    }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
