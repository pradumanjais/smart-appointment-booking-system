const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  // Identity & Verification
  // ---------------------------------------------------
  registrationNumber: { type: String, trim: true },
  medicalCouncil: { type: String, trim: true },
  registrationCertificate: { type: String },
  isVerified: { type: Boolean, default: false },
  fathersName: { type: String, trim: true },
  mothersName: { type: String, trim: true },
  address: { type: String, trim: true },
  state: { type: String, trim: true },
  pinCode: { type: String, trim: true },

  // Qualifications
  // ---------------------------------------------------
  degrees: [String],
  medicalCollege: { type: String },
  yearOfDegreeAchieved: { type: Number },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
  },
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
  },
  awards: [String],
  languages: [String],

  // Practice Details
  // ---------------------------------------------------
  clinicName: { type: String },
  clinicAddress: { type: String },
  clinicState: { type: String },
  clinicPinCode: { type: String },
  consultationFees: {
    inPerson: { type: Number, default: 0 },
    online: { type: Number, default: 0 }
  },
  consultationModes: {
    type: [String],
    enum: ['In-person', 'Video', 'Phone'],
    default: ['In-person']
  },

  // Smart Scheduling
  // ---------------------------------------------------
  slotDuration: { type: Number, default: 15 }, // in minutes
  bufferTime: { type: Number, default: 5 }, // buffer between appts in mins
  autoAccept: { type: Boolean, default: true },
  throughputCapacity: { type: Number, default: 1 }, // max patients per slot
  maxPatientsPerSlot: { type: Number, default: 1 }, // Legacy field, keeping for compatibility
  breakTimes: [
    {
      startTime: String,
      endTime: String
    }
  ],
  availability: [
    {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      slots: [
        {
          startTime: String,
          endTime: String,
        },
      ],
    },
  ],

  // Payouts & Legal
  // ---------------------------------------------------
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    upiId: String
  },
  gstNumber: { type: String },
  visibility: { 
    type: String, 
    enum: ['public', 'private'], 
    default: 'public' 
  },

  bio: {
    type: String,
    trim: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: false, // Will be filled during setup wizard
  },
  location: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
