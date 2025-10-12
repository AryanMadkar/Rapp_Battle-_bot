const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const config = require('./config/env');

const connectDB = require('./config/database');
connectDB();
// Initialize express
const app = express();

// Connect to database

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    service: 'auth-service', 
    status: 'running' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
