const express = require('express');
const cors = require('cors');  // ✅ Added
const mongoose = require('mongoose');
const battleRoutes = require('./routes/battleRoutes');
const config = require('./config/env');  // ✅ Added

const app = express();

// Middleware
app.use(cors());  // ✅ Added CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // ✅ Added

// Database connection
const connectDB = require('./config/database');
connectDB();
// Routes
app.use('/', battleRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'battle-service', 
    status: 'running' 
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
});
