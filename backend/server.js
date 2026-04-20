const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');

dotenv.config();

// Database Connection
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const errorMiddleware = require('./middleware/errorMiddleware');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/providers', require('./routes/provider'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/hospitals', require('./routes/hospital'));
app.use('/api/stats', require('./routes/stats'));

// Custom Error Handler Middleware
app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send('Smart Appointment Booking System API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
