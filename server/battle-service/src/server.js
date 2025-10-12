const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const battleRoutes = require('./routes/battleRoutes');
const config = require('./config/env');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = require('./config/database');
connectDB();

// Routes - FIXED: Mount at /api/battles to match gateway proxy
app.use('/api/battles', battleRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'battle-service',
    status: 'running',
    port: config.port
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = config.port || 5002;
app.listen(PORT, () => {
  console.log(`Battle service running on port ${PORT}`);
  console.log(`Routes available at http://localhost:${PORT}/api/battles`);
});
