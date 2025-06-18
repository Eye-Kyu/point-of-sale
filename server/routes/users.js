const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Fix: Correctly import the middleware functions
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET all users (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// DELETE a user by ID (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.role === 'admin' && user._id.toString() === req.user.id) {
            return res.status(403).json({ error: 'Admins cannot delete their own account' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
