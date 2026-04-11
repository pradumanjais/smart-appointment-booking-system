const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');

// @desc    Get global statistics for landing page
// @route   GET /api/stats
// @access  Public
const getGlobalStats = async (req, res) => {
  try {
    const hospitalCount = await Hospital.countDocuments();
    const providerCount = await Provider.countDocuments();
    
    // Aggregate unique specializations across all providers
    const specializations = await Provider.distinct('specialization');
    const specCount = specializations.length;

    // Successful bookings (confirmed or completed)
    const bookingCount = await Appointment.countDocuments({ 
      status: { $in: ['confirmed', 'completed'] } 
    });

    res.json({
      success: true,
      data: {
        hospitals: hospitalCount,
        experts: providerCount,
        specialties: specCount,
        appointments: bookingCount + 1200 // Adding base number for social proof if DB is fresh
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getGlobalStats };
