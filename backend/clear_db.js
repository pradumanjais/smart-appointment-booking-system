const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Provider = require('./models/Provider');
const Hospital = require('./models/Hospital');
const Appointment = require('./models/Appointment');

dotenv.config();

const clearData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-appointment');
    console.log('Connected to MongoDB for clearing data...');

    // Clear and log counts
    const userResult = await User.deleteMany({});
    const providerResult = await Provider.deleteMany({});
    const hospitalResult = await Hospital.deleteMany({});
    const appointmentResult = await Appointment.deleteMany({});

    console.log(`Deleted ${userResult.deletedCount} users`);
    console.log(`Deleted ${providerResult.deletedCount} provider profiles`);
    console.log(`Deleted ${hospitalResult.deletedCount} hospitals`);
    console.log(`Deleted ${appointmentResult.deletedCount} appointments`);

    console.log('Database successfully cleared!');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing database:', err);
    process.exit(1);
  }
};

clearData();
