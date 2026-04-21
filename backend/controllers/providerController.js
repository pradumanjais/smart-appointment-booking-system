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
      hospitalId,
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

    // Hospital Filter (Supports both MongoDB ObjectIds and Synthetic Clinic IDs)
    if (hospitalId) {
      const mongoose = require('mongoose');
      if (typeof hospitalId === 'string' && hospitalId.startsWith('clinic:')) {
        // Extract clinic name from synthetic ID: "clinic:Name-State"
        const clinicName = hospitalId.split(':')[1].split('-')[0];
        matchQuery.clinicName = clinicName;
      } else if (mongoose.Types.ObjectId.isValid(hospitalId)) {
        matchQuery.hospitalId = new mongoose.Types.ObjectId(hospitalId);
      } else {
        // Fallback for name-based lookup if it's not a valid ObjectId
        matchQuery.clinicName = hospitalId;
      }
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

    // 4.5 Join with Hospitals details
    pipeline.push({
      $lookup: {
        from: 'hospitals',
        localField: 'hospitalId',
        foreignField: '_id',
        as: 'hospitalDetails'
      }
    });
    
    // Optional unwind
    pipeline.push({
      $unwind: {
        path: '$hospitalDetails',
        preserveNullAndEmptyArrays: true
      }
    });

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
        clinicAddress: 1,
        clinicState: 1,
        clinicPinCode: 1,
        location: 1,
        bio: 1,
        isVerified: 1,
        'userId.name': '$userDetails.name',
        'userId.email': '$userDetails.email',
        'userId.avatar': '$userDetails.avatar',
        'userId._id': '$userDetails._id',
        'hospitalId': {
          _id: '$hospitalDetails._id',
          name: '$hospitalDetails.name',
          address: '$hospitalDetails.address',
          state: '$hospitalDetails.state'
        }
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
      awards, languages, clinicName, clinicAddress, clinicState, clinicPinCode,
      consultationFees, consultationModes,
      slotDuration, bufferTime, autoAccept, maxPatientsPerSlot, throughputCapacity,
      breakTimes, availability, bankDetails, gstNumber,
      visibility, bio, location, hospitalId,
      fathersName, mothersName, address, state, pinCode
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
      maxPatientsPerSlot: throughputCapacity || maxPatientsPerSlot || 1,
      throughputCapacity: throughputCapacity || maxPatientsPerSlot || 1,
      breakTimes: breakTimes || [],
      availability: availability || [
        { day: 'Monday', slots: [{ startTime: '09:00', endTime: '13:00' }] },
        { day: 'Wednesday', slots: [{ startTime: '09:00', endTime: '13:00' }] },
        { day: 'Friday', slots: [{ startTime: '09:00', endTime: '13:00' }] }
      ],
      bankDetails: bankDetails || {},
      gstNumber, visibility, bio, location, hospitalId,
      clinicName, clinicAddress, clinicState, clinicPinCode,
      fathersName, mothersName, address, state, pinCode
    };

    if (provider) {
      // Update
      provider = await Provider.findOneAndUpdate(
        { userId: req.user.id },
        profileData,
        { returnDocument: 'after', runValidators: true }
      ).populate('userId', 'name email avatar phone address state pinCode fathersName mothersName role');
    } else {
      // Create
      provider = await Provider.create({
        userId: req.user.id,
        ...profileData
      });
      // Populate the newly created document
      provider = await Provider.findById(provider._id).populate('userId', 'name email avatar phone address state pinCode fathersName mothersName role');
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
      .populate('userId', 'name email avatar phone age bloodGroup role address state pinCode fathersName mothersName')
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
