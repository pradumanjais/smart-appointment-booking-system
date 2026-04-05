const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');

// @desc    Book an appointment
// @route   POST /api/bookings/book
// @access  Private/User
const bookAppointment = async (req, res) => {
  try {
    const { providerId, date, startTime, endTime, notes } = req.body;

    // Check if provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // 1. Check for slot conflict (Is provider already booked?)
    const conflict = await Appointment.findOne({
      providerId,
      date,
      startTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (conflict) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    // 2. Optional: Detailed availability check (Is slot within provider working hours?)
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = provider.availability.find((a) => a.day === dayName);

    if (!dayAvailability) {
      return res.status(400).json({ message: `Provider is not available on ${dayName}` });
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId: req.user.id,
      providerId,
      date,
      startTime,
      endTime,
      notes,
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user appointments
// @route   GET /api/bookings/my-appointments
// @access  Private
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate('providerId')
      .populate('userId', 'name email avatar');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get provider appointments
// @route   GET /api/bookings/provider-appointments
// @access  Private/Provider
const getProviderAppointments = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) return res.status(404).json({ message: 'Provider profile not found' });

    const appointments = await Appointment.find({ providerId: provider._id })
      .populate('userId', 'name email avatar');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getProviderAppointments,
};
