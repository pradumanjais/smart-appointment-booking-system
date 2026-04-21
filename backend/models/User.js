const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password in queries by default
  },
  phone: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
  },
  dob: {
    type: Date,
  },
  fathersName: {
    type: String,
    trim: true,
  },
  mothersName: {
    type: String,
    trim: true,
  },
  bloodGroup: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  pinCode: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  patientId: {
    type: String,
    unique: true,
    sparse: true, // Allow nulls for old users until generated
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
  },
  govtId: {
    type: String,
    trim: true,
  },
  // Medical Details
  allergies: [String],
  conditions: [String],
  medications: [String],
  pastSurgeries: [String],
  // Emergency Contact
  emergencyContact: {
    name: String,
    relation: String,
    phone: String,
  },
  // Preferences
  notificationPreferences: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    app: { type: Boolean, default: true },
  },
  languagePreference: {
    type: String,
    default: 'English',
  },
  privacySettings: {
    dataShared: { type: Boolean, default: false },
    profileVisible: { type: Boolean, default: true },
  },
  // Insurance
  insurance: {
    provider: String,
    policyNumber: String,
  },
  avatar: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/147/147144.png',
  },
  role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
