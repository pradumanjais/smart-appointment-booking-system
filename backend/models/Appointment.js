const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: [true, 'Provider ID is required'],
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: false, // Optional for clinic-based bookings
  },
  clinicName: String,
  clinicAddress: String,
  hospitalState: String,
  clinicPinCode: String,
  appointmentMode: {
    type: String,
    enum: ['Physical', 'Video'],
    required: true,
  },
  appointmentType: {
    type: String,
    enum: ['New', 'Follow-up'],
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required'],
  },
  startTime: {
    type: String, // "09:00"
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: String, // "10:00"
    required: [true, 'End time is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  notes: {
    type: String,
    trim: true,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
