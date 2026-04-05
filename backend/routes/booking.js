const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { bookAppointment, getMyAppointments, getProviderAppointments } = require('../controllers/bookingController');
const { bookingValidator } = require('../validators/bookingValidator');

const router = express.Router();

// @route   POST /api/bookings/book
// @desc    Book an appointment
// @access  Private/User
router.post('/book', authMiddleware, roleMiddleware(['user']), bookingValidator, bookAppointment);

// @route   GET /api/bookings/my-appointments
// @desc    Get logged in user appointments
// @access  Private
router.get('/my-appointments', authMiddleware, getMyAppointments);

// @route   GET /api/bookings/provider-appointments
// @desc    Get appointments for a provider
// @access  Private/Provider
router.get('/provider-appointments', authMiddleware, roleMiddleware(['provider']), getProviderAppointments);

module.exports = router;
