// backend/server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

// Load env
require('dotenv').config();

// Connect DB
connectDB();

const app = express();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Create uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/rentals', require('./routes/rentals'));

// Serve static assets in production (later)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'))
  );
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 8000;


try {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
} catch (err) {
  console.error('❌ Server failed to start:', err.message);
  process.exit(1);
}