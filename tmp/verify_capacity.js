const mongoose = require('mongoose');
const Provider = require('../backend/models/Provider');
const Appointment = require('../backend/models/Appointment');

async function testCapacity() {
  await mongoose.connect('mongodb://localhost:27017/smart-appointment'); // Adjust DB URL if needed

  const provider = await Provider.findOne({ specialization: 'Cardiology' });
  if (!provider) {
    console.log('No provider found');
    process.exit(1);
  }

  console.log(`Testing with Provider: ${provider.userId}, Capacity: ${provider.throughputCapacity}`);

  const date = '2026-04-25';
  const startTime = '10:00';

  // Count existing appointments
  const existingCount = await Appointment.countDocuments({
    providerId: provider._id,
    date,
    startTime,
    status: { $in: ['pending', 'confirmed'] },
  });

  console.log(`Existing appointments: ${existingCount}`);

  if (existingCount >= (provider.throughputCapacity || 1)) {
    console.log('Slot is FULL (Expected behavior)');
  } else {
    console.log('Slot has SPACE');
  }

  process.exit(0);
}

testCapacity().catch(err => {
  console.error(err);
  process.exit(1);
});
