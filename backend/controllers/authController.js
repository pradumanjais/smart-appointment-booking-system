const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Provider = require('../models/Provider');

// Register User
const registerUser = async (req, res) => {
  try {
    const { 
      name, email, password, role, phone, age, gender, dob, 
      bloodGroup, state, city, pinCode, address, govtId,
      allergies, conditions, medications, pastSurgeries,
      emergencyContact, insurance 
    } = req.body;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Create user
    const user = await User.create({
      name, 
      email: normalizedEmail, // Use normalized email
      password, 
      role, 
      phone, 
      age, 
      gender, 
      dob,
      bloodGroup, 
      state, 
      city, 
      pinCode, 
      address, 
      govtId,
      allergies, 
      conditions, 
      medications, 
      pastSurgeries,
      emergencyContact, 
      insurance
    });

    if (user) {
      // If role is provider, initialize a provider document
      if (role === 'provider') {
        try {
          await Provider.create({
            userId: user._id,
            specialization: 'General', // Default placeholder
            experience: 0,
            hospitalId: null // To be filled in wizard
          });
        } catch (pErr) {
          console.error('Error initializing provider profile:', pErr);
          // We don't fail registration if provider profile creation fails, 
          // as they can re-initiate it in the dashboard.
        }
      }

      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    }
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Account creation failed: Email is already registered.' });
    }
    res.status(500).json({ message: err.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check for user (must use select('+password') since we hid it in schema)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { 
      name, phone, age, bloodGroup, avatar, state, address,
      gender, dob, govtId,
      allergies, conditions, medications, pastSurgeries,
      emergencyContact, insurance
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic & identity fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (age) user.age = age;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (avatar) user.avatar = avatar;
    if (state) user.state = state;
    if (address) user.address = address;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    if (govtId) user.govtId = govtId;

    // Update medical arrays
    if (allergies) user.allergies = allergies;
    if (conditions) user.conditions = conditions;
    if (medications) user.medications = medications;
    if (pastSurgeries) user.pastSurgeries = pastSurgeries;

    // Update nested objects
    if (emergencyContact) {
      user.emergencyContact = { ...user.emergencyContact, ...emergencyContact };
    }
    if (insurance) {
      user.insurance = { ...user.insurance, ...insurance };
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper: Generate Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = { registerUser, loginUser, getMe, updateProfile };
