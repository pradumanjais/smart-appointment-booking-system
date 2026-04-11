const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hospital = require('../models/Hospital');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Appointment = require('../models/Appointment');

dotenv.config({ path: '../.env' });

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", 
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const standardDepartments = [
  "General Medicine", "Cardiology", "Neurology", "Pediatrics", 
  "Orthopedics", "Dermatology", "ENT", "Ophthalmology", 
  "Psychiatry", "Gynecology"
];

const seedIndia = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-appointment';
    await mongoose.connect(connString);
    console.log('Connected to MongoDB for India Seeding...');

    // 1. Clear ALL data to start completely fresh as requested
    await Hospital.deleteMany({});
    await Provider.deleteMany({});
    await User.deleteMany({});
    await Appointment.deleteMany({});
    console.log('Database cleared.');

    // 2. Generate and Seed Hospitals
    const hospitalData = indianStates.map(state => ({
      name: `${state} General Hospital`,
      state: state,
      city: "Major City",
      address: `Main Road, ${state}`,
      departments: standardDepartments
    }));

    const insertedHospitals = await Hospital.create(hospitalData);
    console.log(`Successfully seeded ${insertedHospitals.length} Indian Hospitals (all States & UTs).`);

    console.log('Seeding Complete! You can now Register and see all States and "General Medicine".');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedIndia();
