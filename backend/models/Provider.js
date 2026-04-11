const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
  },
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
  },
  pricePerHour: {
    type: Number,
    default: 0,
  },
  availability: [
    {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      slots: [
        {
          startTime: String, // "09:00"
          endTime: String,   // "10:00"
        },
      ],
    },
  ],
  bio: {
    type: String,
    trim: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: [true, 'Hospital allocation is required'],
  },
  location: {
    type: String, // Keep as backup for specific room/floor
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
