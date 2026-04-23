const express = require('express');
const { registerUser, loginUser, getMe, updateProfile, getUserById } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerValidator, registerUser);

// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginValidator, loginUser);

// @route   GET /api/auth/me
// @access  Private
router.get('/me', authMiddleware, getMe);

// @route   GET /api/auth/profile
// @access  Private
router.put('/profile', authMiddleware, updateProfile);

// @route   GET /api/auth/user/:id
// @access  Private
router.get('/user/:id', authMiddleware, getUserById);

module.exports = router;
