const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("Ram Ram", process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
