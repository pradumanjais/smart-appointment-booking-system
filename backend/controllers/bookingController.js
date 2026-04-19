const Appointment = require('../models/Appointment');
const Provider = require('../models/Provider');

// @desc    Book an appointment
// @route   POST /api/bookings/book
// @access  Private/User
const bookAppointment = async (req, res) => {
  try {
    const { 
      providerId, 
      hospitalId,
      hospitalState,
      appointmentMode,
      appointmentType,
      department,
      date, 
      startTime, 
      endTime, 
      notes 
    } = req.body;

    // Check if the requested date is in the past
    const requestedDateObj = new Date(date);
    requestedDateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDateObj < today) {
      return res.status(400).json({ message: 'Cannot book an appointment for a past date' });
    }

    // Check if provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // 1. Check for slot capacity (Is provider's hourly limit reached?)
    const existingCount = await Appointment.countDocuments({
      providerId,
      date,
      startTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingCount >= (provider.slotsPerHour || 1)) {
      return res.status(400).json({ message: 'This time slot is fully booked for this expert' });
    }

    // 2. Optional: Detailed availability check (Is slot within provider working hours?)
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = provider.availability.find((a) => a.day === dayName);

    if (!dayAvailability) {
      return res.status(400).json({ message: `Provider is not available on ${dayName}` });
    }

    // Create appointment and automatically confirm it based on strict capacity logic
    const appointment = await Appointment.create({
      userId: req.user.id,
      providerId,
      hospitalId,
      hospitalState,
      appointmentMode,
      appointmentType,
      department,
      date,
      startTime,
      endTime,
      notes,
      status: 'confirmed',
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
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name avatar' }
      })
      .populate('userId', 'name email avatar')
      .populate('hospitalId', 'name address state phone departments');
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

// @desc    Update appointment status
// @route   PATCH /api/bookings/:id/status
// @access  Private/Provider
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Role-based authorization
    const isOwner = appointment.userId.toString() === req.user.id;
    const provider = await Provider.findOne({ userId: req.user.id });
    const isProviderOfAppt = provider && appointment.providerId.toString() === provider._id.toString();

    if (!isOwner && !isProviderOfAppt) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    // Patients (owners) can ONLY cancel
    if (isOwner && !isProviderOfAppt && status !== 'cancelled') {
      return res.status(403).json({ message: 'Patients can only cancel appointments' });
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get daily capacity for a specific hospital and department
// @route   GET /api/bookings/capacity
// @access  Private/User
const getDailyCapacity = async (req, res) => {
  try {
    const { hospitalId, department, date } = req.query;

    if (!hospitalId || !department || !date) {
      return res.status(400).json({ message: 'Missing required query parameters' });
    }

    // Parse the requested date to find the day of the week
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    // Find all providers matching the criteria
    const providers = await Provider.find({ 
      hospitalId, 
      specialization: department 
    });

    // Helper block to generate a fully blocked schedule
    const returnUnavailableBlock = () => {
      const emptyMap = {};
      const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
      times.forEach(t => emptyMap[t] = { booked: 0, total: 0, percent: 0, state: 'unavailable' });
      return res.json({ capacityMap: emptyMap });
    }

    if (providers.length === 0) {
      return returnUnavailableBlock();
    }
    const activeProviders = providers.filter(p => {
      // If a provider hasn't set up an explicit availability schedule, we assume they are active.
      if (!p.availability || p.availability.length === 0) return true; 
      return p.availability.some(a => a.day === dayOfWeek);
    });

    if (activeProviders.length === 0) {
      // If no providers are working on this day, entire campus is blocked for this department
      return returnUnavailableBlock();
    }

    // Calculate total campus capacity per timeslot
    const totalHourlyCapacity = activeProviders.reduce((sum, p) => sum + (p.slotsPerHour || 1), 0);
    const providerIds = activeProviders.map(p => p._id);

    // Get all active appointments on this date for these providers
    const appointments = await Appointment.find({
      providerId: { $in: providerIds },
      date,
      status: { $in: ['pending', 'confirmed'] }
    });

    // Pre-defined slots loop
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
    const capacityMap = {};

    timeSlots.forEach(time => {
      const bookedNum = appointments.filter(a => a.startTime === time).length;
      const percent = totalHourlyCapacity > 0 ? (bookedNum / totalHourlyCapacity) * 100 : 100;
      
      let state = 'available';
      if (percent >= 100) state = 'full';
      else if (percent >= 60) state = 'partial';

      capacityMap[time] = {
        booked: bookedNum,
        total: totalHourlyCapacity,
        percent,
        state
      };
    });

    res.json({ capacityMap });
  } catch (error) {
    console.error('Error fetching capacity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getProviderAppointments,
  updateAppointmentStatus,
  getDailyCapacity,
};
