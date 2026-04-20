const Provider = require('../models/Provider');
const User = require('../models/User');

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
const getProviders = async (req, res) => {
  try {
    const { 
      search, 
      specialization, 
      minFee, 
      maxFee, 
      mode, 
      sort = 'rating' 
    } = req.query;

    const pipeline = [];

    // 1. Join with Users for name search
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails'
      }
    });

    // 2. Unwind for easy access
    pipeline.push({ $unwind: '$userDetails' });

    // 3. Filtering Logic
    const matchQuery = {};

    // Name or Specialization Search
    if (search) {
      matchQuery.$or = [
        { 'userDetails.name': { $regex: search, $options: 'i' } },
        { 'specialization': { $regex: search, $options: 'i' } },
        { 'clinicName': { $regex: search, $options: 'i' } }
      ];
    }

    // Specific Specialization Filter
    if (specialization) {
      matchQuery.specialization = { $regex: specialization, $options: 'i' };
    }

    // Fee range (Checking both modes)
    if (minFee || maxFee) {
      const feeMatch = {};
      if (minFee) feeMatch.$gte = Number(minFee);
      if (maxFee) feeMatch.$lte = Number(maxFee);
      
      matchQuery.$or = [
        { 'consultationFees.inPerson': feeMatch },
        { 'consultationFees.online': feeMatch }
      ];
    }

    // Consultation Mode
    if (mode) {
      matchQuery.consultationModes = mode;
    }

    if (Object.keys(matchQuery).length > 0) {
      pipeline.push({ $match: matchQuery });
    }

    // 4. Sorting
    const sortObj = {};
    if (sort === 'rating') sortObj.rating = -1;
    else if (sort === 'experience') sortObj.experience = -1;
    else if (sort === 'priceLow') sortObj['consultationFees.inPerson'] = 1;
    else if (sort === 'priceHigh') sortObj['consultationFees.inPerson'] = -1;
    else sortObj.createdAt = -1;

    pipeline.push({ $sort: sortObj });

    // 5. Projection (Clean up response)
    pipeline.push({
      $project: {
        _id: 1,
        specialization: 1,
        experience: 1,
        rating: 1,
        consultationFees: 1,
        consultationModes: 1,
        clinicName: 1,
        location: 1,
        bio: 1,
        isVerified: 1,
        'userId.name': '$userDetails.name',
        'userId.email': '$userDetails.email',
        'userId.avatar': '$userDetails.avatar',
        'userId._id': '$userDetails._id'
      }
    });

    const providers = await Provider.aggregate(pipeline);
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
    const { 
      registrationNumber, medicalCouncil, registrationCertificate,
      degrees, medicalCollege, yearOfDegreeAchieved, specialization, experience,
      awards, languages, clinicName, clinicAddress,
      consultationFees, consultationModes,
      slotDuration, bufferTime, autoAccept, maxPatientsPerSlot,
      breakTimes, availability, bankDetails, gstNumber,
      visibility, bio, location, hospitalId,
      fathersName, mothersName 
    } = req.body;

    let provider = await Provider.findOne({ userId: req.user.id });

    const profileData = {
      registrationNumber, medicalCouncil, registrationCertificate,
      degrees, medicalCollege, yearOfDegreeAchieved, specialization, experience,
      awards, languages, clinicName, clinicAddress,
      consultationFees: consultationFees || { inPerson: 500, online: 400 },
      consultationModes: consultationModes || ['In-person', 'Video'],
      slotDuration: slotDuration || 15,
      bufferTime: bufferTime || 5,
      autoAccept: autoAccept !== undefined ? autoAccept : true,
      maxPatientsPerSlot: maxPatientsPerSlot || 1,
      breakTimes: breakTimes || [],
      availability: availability || [
        { day: 'Monday', slots: [{ startTime: '09:00', endTime: '13:00' }] },
        { day: 'Wednesday', slots: [{ startTime: '09:00', endTime: '13:00' }] },
        { day: 'Friday', slots: [{ startTime: '09:00', endTime: '13:00' }] }
      ],
      bankDetails: bankDetails || {},
      gstNumber, visibility, bio, location, hospitalId,
      fathersName, mothersName, clinicName, clinicAddress
    };

    if (provider) {
      // Update
      provider = await Provider.findOneAndUpdate(
        { userId: req.user.id },
        profileData,
        { new: true, runValidators: true }
      ).populate('userId', 'name email avatar phone address state role');
    } else {
      // Create
      provider = await Provider.create({
        userId: req.user.id,
        ...profileData
      });
      // Populate the newly created document
      provider = await Provider.findById(provider._id).populate('userId', 'name email avatar phone address state role');
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
      .populate('userId', 'name email avatar phone age bloodGroup role address state')
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
