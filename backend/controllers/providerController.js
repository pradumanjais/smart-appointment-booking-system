const Provider = require('../models/Provider');
const User = require('../models/User');

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
const getProviders = async (req, res) => {
  try {
    const { hospitalId, specialization } = req.query;
    const query = {};
    if (hospitalId) query.hospitalId = hospitalId;
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };

    const providers = await Provider.find(query).populate('userId', 'name email avatar');
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('userId', 'name email avatar');
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create or update provider profile
// @route   POST /api/providers/profile
// @access  Private/Provider
const updateProviderProfile = async (req, res) => {
  try {
    const { specialization, experience, pricePerHour, availability, bio, location, hospitalId } = req.body;

    let provider = await Provider.findOne({ userId: req.user.id });

    if (provider) {
      // Update
      provider = await Provider.findOneAndUpdate(
        { userId: req.user.id },
        { specialization, experience, pricePerHour, availability, bio, location, hospitalId },
        { new: true, runValidators: true }
      );
    } else {
      // Create
      provider = await Provider.create({
        userId: req.user.id,
        specialization,
        experience,
        pricePerHour,
        availability,
        bio,
        location,
        hospitalId,
      });
    }

    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get current provider profile
// @route   GET /api/providers/profile
// @access  Private/Provider
const getProviderMe = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id })
      .populate('userId', 'name email avatar phone age bloodGroup role')
      .populate('hospitalId', 'name state address');

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProviders,
  getProviderById,
  updateProviderProfile,
  getProviderMe,
};
