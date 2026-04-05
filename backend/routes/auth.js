const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidator, registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginValidator, loginUser);

module.exports = router;
