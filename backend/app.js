require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect/Initialize Portable Database
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default Home Route
app.get('/', (req, res) => {
  res.send('Gas Distribution MERN Backend Running Successfully (Portable Edition)!');
});

// Register API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/ledger', require('./routes/ledger'));
app.use('/api/reset', require('./routes/reset'));
app.use('/api/logs', require('./routes/logs'));

// Global Async Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
