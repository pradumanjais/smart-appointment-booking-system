const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Provider = require('./models/Provider');

dotenv.config();

const doctors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.j@example.com',
    password: 'password123',
    role: 'provider',
    specialization: 'Cardiologist',
    experience: 12,
    location: 'New York, NY',
    pricePerHour: 150,
    bio: 'Board-certified cardiologist with over 12 years of experience in heart health and surgery.',
    availability: [
      {
        day: 'Monday',
        slots: [{ startTime: '09:00', endTime: '10:00' }, { startTime: '10:00', endTime: '11:00' }]
      },
      {
        day: 'Wednesday',
        slots: [{ startTime: '14:00', endTime: '15:00' }, { startTime: '15:00', endTime: '16:00' }]
      }
    ]
  },
  {
    name: 'Dr. Michael Chen',
    email: 'm.chen@example.com',
    password: 'password123',
    role: 'provider',
    specialization: 'Dermatologist',
    experience: 8,
    location: 'San Francisco, CA',
    pricePerHour: 120,
    bio: 'Specializing in skincare, acne treatment, and laser therapy.',
    availability: [
      {
        day: 'Tuesday',
        slots: [{ startTime: '11:00', endTime: '12:00' }, { startTime: '13:00', endTime: '14:00' }]
      },
      {
        day: 'Thursday',
        slots: [{ startTime: '09:00', endTime: '10:00' }]
      }
    ]
  },
  {
    name: 'Dr. Emily White',
    email: 'emily.w@example.com',
    password: 'password123',
    role: 'provider',
    specialization: 'Pediatrician',
    experience: 15,
    location: 'Chicago, IL',
    pricePerHour: 100,
    bio: 'Dedicated pediatrician focused on child development and preventative care.',
    availability: [
      {
        day: 'Friday',
        slots: [{ startTime: '08:00', endTime: '09:00' }, { startTime: '09:00', endTime: '10:00' }]
      }
    ]
  },
  {
    name: 'Dr. Robert Brown',
    email: 'robert.b@example.com',
    password: 'password123',
    role: 'provider',
    specialization: 'Neurologist',
    experience: 20,
    location: 'Boston, MA',
    pricePerHour: 200,
    bio: 'Expert in neurological disorders and brain health.',
    availability: [
      {
        day: 'Monday',
        slots: [{ startTime: '13:00', endTime: '14:00' }]
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

    for (const doc of doctors) {
      // Create user
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: doc.password,
        role: doc.role
      });

      // Create provider profile
      await Provider.create({
        userId: user._id,
        specialization: doc.specialization,
        experience: doc.experience,
        location: doc.location,
        pricePerHour: doc.pricePerHour,
        bio: doc.bio,
        availability: doc.availability,
        rating: (Math.random() * 2 + 3).toFixed(1) // Random rating between 3.0 and 5.0
      });
    }

    console.log('Successfully seeded 4 doctor profiles!');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
