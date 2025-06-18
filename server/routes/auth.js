const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware'); // ✅ FIXED

// Public route
router.post('/login', login);

// Admin-only route to register users
router.post('/register', protect, adminOnly, register); // ✅ USE FIXED MIDDLEWARE

module.exports = router;
