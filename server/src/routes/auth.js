const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { rateLimit } = require('express-rate-limit');
const User = require('../models/User');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// slow down password guessing and signup spam, per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please wait a few minutes and try again.' }
});

router.use(authLimiter);

const createToken = (user) => {
    return jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// POST route for user signup
router.post('/signup', async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        if (!name) {
            return res.status(400).json({ error: 'Please enter your name' });
        }
        if (!EMAIL_PATTERN.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email' });
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // hash the pass
        const hashedPassword = await bcrypt.hash(password, 10);

        // create new user and save
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        // log the new user straight in
        res.status(201).json({ message: 'User created successfully', token: createToken(user) });

    } catch (err) {
        res.status(500).json({ error: 'Signup failed' });
    }
});

// POST route for user login
router.post('/login', async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        // find user's email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // check pass
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        res.json ({ message: 'Login successful', token: createToken(user) });

    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
