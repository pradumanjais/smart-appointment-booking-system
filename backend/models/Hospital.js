const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    unique: true,
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  departments: [{
    type: String,
  }],
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital;
