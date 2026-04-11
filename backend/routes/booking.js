const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getProviderAppointments,
  updateAppointmentStatus
} = require('../controllers/bookingController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.post('/book', authMiddleware, bookAppointment);
router.get('/my-appointments', authMiddleware, getMyAppointments);
router.get('/provider-appointments', authMiddleware, roleMiddleware(['provider']), getProviderAppointments);
router.patch('/:id/status', authMiddleware, roleMiddleware(['provider']), updateAppointmentStatus);

module.exports = router;
