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
    const [year, month, day] = date.split('-').map(Number);
    const requestedDateObj = new Date(year, month - 1, day);
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

    // 1. Check if the user already has an active booking for this entire day
    // Use a range query to be robust against time components
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const userBookingExists = await Appointment.findOne({
      userId: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (userBookingExists) {
      return res.status(400).json({ message: 'You already have an active appointment scheduled for this day. Only one booking is allowed per day.' });
    }

    // 2. Check for slot capacity (Is provider's hourly limit reached?)
    const existingCount = await Appointment.countDocuments({
      providerId,
      date,
      startTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingCount >= (provider.throughputCapacity || provider.maxPatientsPerSlot || 1)) {
      return res.status(400).json({ message: 'This time slot is fully booked for this expert' });
    }

    // 2. Optional: Detailed availability check (Is slot within provider working hours?)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[requestedDateObj.getDay()];
    const dayAvailability = provider.availability.find((a) => a.day === dayName);

    if (!dayAvailability) {
      return res.status(400).json({ message: `Provider is not available on ${dayName}` });
    }

    // Detect and handle synthetic Clinic IDs
    let finalHospitalId = hospitalId;
    let actualClinicName = null;
    let clinicAddress = null;
    let clinicPinCode = null;
    let clinicState = hospitalState;

    if (typeof hospitalId === 'string' && hospitalId.startsWith('clinic:')) {
      actualClinicName = hospitalId.split(':')[1].split('-')[0];
      finalHospitalId = undefined; // Nullify so Mongoose doesn't fail Cast
      
      // Fetch clinic details from provider profile
      clinicAddress = provider.address || null;
      clinicPinCode = provider.pinCode || null;
      clinicState = provider.state || hospitalState;
    }

    // Create appointment and automatically confirm it based on strict capacity logic
    const appointment = await Appointment.create({
      userId: req.user.id,
      providerId,
      hospitalId: finalHospitalId,
      clinicName: actualClinicName,
      clinicAddress,
      clinicPinCode,
      hospitalState: clinicState,
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
    // Auto-update any confirmed appointments that have passed
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfToday = new Date(todayStr);

    // Bulk update appointments from previous days
    await Appointment.updateMany(
      { userId: req.user.id, status: 'confirmed', date: { $lt: startOfToday } },
      { status: 'not-visited' }
    );

    const appointments = await Appointment.find({ userId: req.user.id })
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name avatar' }
      })
      .populate('userId', 'name email avatar age fathersName mothersName phone bloodGroup')
      .populate('hospitalId', 'name address state pinCode phone departments');
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

    // Auto-update any confirmed appointments for this provider that have passed
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfToday = new Date(todayStr);

    await Appointment.updateMany(
      { providerId: provider._id, status: 'confirmed', date: { $lt: startOfToday } },
      { status: 'not-visited' }
    );

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
    const { hospitalId, department, date, providerId } = req.query;

    if (!hospitalId || !department || !date) {
      return res.status(400).json({ message: 'Missing required query parameters' });
    }

    const mongoose = require('mongoose');
    let finalHospitalId = hospitalId;
    let isClinicLookup = false;

    // Handle Synthetic Clinic IDs (from unified locations API)
    if (typeof hospitalId === 'string' && hospitalId.startsWith('clinic:')) {
      isClinicLookup = true;
      // Extract clinic name from synthetic ID: "clinic:Name-State"
      finalHospitalId = hospitalId.split(':')[1].split('-')[0];
    } else if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      // Resilience for name-based lookup
      const Hospital = require('../models/Hospital');
      const hosp = await Hospital.findOne({ name: hospitalId });
      if (hosp) {
        finalHospitalId = hosp._id;
      } else {
        // Fallback: Check if it's just a clinic name provided as a string
        isClinicLookup = true;
        finalHospitalId = hospitalId;
      }
    }

    // Parse the requested date to find the day of the week (locale-independent)
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[dateObj.getDay()];

    // Check if the date is in the past
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (date < todayStr) {
      return returnUnavailableBlock();
    }

    // Find all providers matching the criteria
    // If we have a specific providerId, we prioritize that and relax other filters to prevent silent mismatches
    const query = {
      ...(isClinicLookup ? { clinicName: finalHospitalId } : { hospitalId: finalHospitalId }),
      ...(providerId ? { _id: providerId } : { specialization: department })
    };

    const providers = await Provider.find(query);

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
      // Must have availability set up and work on this day
      if (!p.availability || p.availability.length === 0) return false; 
      return p.availability.some(a => a.day === dayOfWeek);
    });

    if (activeProviders.length === 0) {
      // If no providers are working on this day, entire campus is blocked for this department
      return returnUnavailableBlock();
    }

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

    // Check if the requested date is today
    const isToday = date === todayStr;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    timeSlots.forEach(time => {
      const [slotHour, slotMinute] = time.split(':').map(Number);
      
      // Calculate capacity for this specific timeslot
      const providersForSlot = activeProviders.filter(p => {
        const daySched = p.availability.find(a => a.day === dayOfWeek);
        // Check if the requested 'time' fits within any of the provider's defined slots for that day
        return daySched && daySched.slots.some(s => {
          // If a doctor works from 09:00 to 13:00, they are available for 09:00, 10:00, 11:00, 12:00
          return time >= s.startTime && time < s.endTime;
        });
      });

      const currentSlotCapacity = providersForSlot.reduce((sum, p) => sum + (p.throughputCapacity || p.maxPatientsPerSlot || 1), 0);
      const bookedNum = appointments.filter(a => a.startTime === time).length;
      
      let state = 'available';
      const percent = currentSlotCapacity > 0 ? (bookedNum / currentSlotCapacity) * 100 : 100;

      // 1. Check if the slot time has already passed for today
      if (isToday) {
        if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
          state = 'unavailable';
        }
      }

      // 2. Map 'unavailable' if no providers work this specific slot
      if (currentSlotCapacity === 0) {
        state = 'unavailable';
      }

      // 3. Check for capacity if not already marked unavailable
      if (state !== 'unavailable') {
        if (percent >= 100) state = 'full';
        else if (percent >= 50) state = 'partial';
      }

      capacityMap[time] = {
        booked: bookedNum,
        total: currentSlotCapacity,
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
