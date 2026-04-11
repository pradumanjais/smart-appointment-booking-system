const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Provider = require('./models/Provider');
const Hospital = require('./models/Hospital');

dotenv.config();

const hospitals = [
  { name: 'City Central Hospital', state: 'New York', city: 'Manhattan', departments: ['Cardiology', 'Neurology', 'Pediatrics'] },
  { name: 'Valley Medical Center', state: 'California', city: 'San Francisco', departments: ['Dermatology', 'Psychiatry', 'ENT'] },
  { name: 'Lakeside Health', state: 'Illinois', city: 'Chicago', departments: ['Pediatrics', 'General Medicine'] },
];

const doctors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.j@example.com',
    password: 'password123',
    role: 'provider',
    specialization: 'Cardiologist',
    hospitalName: 'City Central Hospital',
    department: 'Cardiology',
    experience: 12,
    location: 'Building A, Floor 3',
    pricePerHour: 150,
    bio: 'Board-certified cardiologist with over 12 years of experience in heart health and surgery.',
    availability: [
      {
        day: 'Monday',
        slots: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '10:00', endTime: '11:00' }]
      }
    ]
  },
  {
    name: 'Dr. Michael Chen',
    email: 'm.chen@example.com',
    password: 'password123',
    role: 'provider',
    specialization: 'Dermatologist',
    hospitalName: 'Valley Medical Center',
    department: 'Dermatology',
    experience: 8,
    location: 'West Wing, Suite 402',
    pricePerHour: 120,
    bio: 'Specializing in skincare, acne treatment, and laser therapy.',
    availability: [
      {
        day: 'Tuesday',
        slots: [{ startTime: '11:00', endTime: '12:00' }]
      }
    ]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-appointment');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({ role: 'provider' });
    await Provider.deleteMany({});
    await Hospital.deleteMany({});

    // 1. Seed Hospitals
    const createdHospitals = await Hospital.create(hospitals);
    console.log(`Created ${createdHospitals.length} hospitals`);

    for (const doc of doctors) {
      // Create user
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: doc.password,
        role: doc.role
      });

      // Find hospital
      const hospital = createdHospitals.find(h => h.name === doc.hospitalName);

      // Create provider profile
      await Provider.create({
        userId: user._id,
        hospitalId: hospital._id,
        specialization: doc.specialization,
        experience: doc.experience,
        location: doc.location,
        pricePerHour: doc.pricePerHour,
        bio: doc.bio,
        availability: doc.availability,
        rating: (Math.random() * 2 + 3).toFixed(1)
      });
    }

    console.log('Successfully seeded Hospitals & Providers!');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
