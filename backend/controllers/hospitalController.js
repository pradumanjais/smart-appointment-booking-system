const Hospital = require('../models/Hospital');
const Provider = require('../models/Provider');

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get unified locations (Hospitals + Provider Clinics)
// @route   GET /api/hospitals/locations
// @access  Public
const getUnifiedLocations = async (req, res) => {
  try {
    // 1. Get official Hospitals
    const hospitals = await Hospital.find().lean();
    const formattedHospitals = hospitals.map(h => ({
      _id: h._id,
      name: h.name,
      state: h.state,
      address: h.address,
      departments: h.departments,
      type: 'hospital'
    }));

    // 2. Get unique Provider Clinics
    const clinics = await Provider.aggregate([
      { 
        $match: { 
          clinicName: { $exists: true, $ne: "" },
          clinicState: { $exists: true, $ne: "" }
        } 
      },
      { 
        $group: {
          _id: { 
            name: "$clinicName", 
            state: "$clinicState", 
            address: "$clinicAddress" 
          },
          departments: { $addToSet: "$specialization" }
        }
      },
      { 
        $project: {
          _id: { $concat: ["clinic:", "$_id.name", "-", "$_id.state"] }, // Synthetic ID
          name: "$_id.name",
          state: "$_id.state",
          address: "$_id.address",
          departments: 1,
          type: { $literal: 'clinic' }
        }
      }
    ]);

    res.json([...formattedHospitals, ...clinics]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getHospitals, getUnifiedLocations };
