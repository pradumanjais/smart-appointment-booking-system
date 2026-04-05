const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { getProviders, getProviderById, updateProviderProfile } = require('../controllers/providerController');
const { providerProfileValidator } = require('../validators/providerValidator');

const router = express.Router();

// @route   GET /api/providers
// @desc    Get all providers
// @access  Public
router.get('/', getProviders);

// @route   GET /api/providers/:id
// @desc    Get single provider
// @access  Public
router.get('/:id', getProviderById);

// @route   POST /api/providers/profile
// @desc    Create/Update provider profile
// @access  Private/Provider
router.post('/profile', authMiddleware, roleMiddleware(['provider']), providerProfileValidator, updateProviderProfile);

module.exports = router;
