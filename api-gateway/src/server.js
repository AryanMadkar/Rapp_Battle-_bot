const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env'); // path may need to be updated
const logger = require('./middleware/logger');
const { generalLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: '*', // Set this properly for production!
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging middleware
app.use(logger);

// Rate limit for all routes
app.use(generalLimiter);

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// IMPORTANT: DO NOT use express.json() or express.urlencoded() globally!
// Only use for non-proxied routes. Gateway proxy routes should stream raw body.

// Load all proxy and local routes
routes(app);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 API GATEWAY STARTED');
  console.log('='.repeat(60));
  console.log(`📍 Gateway running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log('\n📡 Connected Services:');
  console.log(` • Auth Service: ${config.services.auth}`);
  console.log(` • Battle Service: ${config.services.battle}`);
  console.log(` • AI Service: ${config.services.ai}`);
  console.log('\n📋 Available Routes:');
  console.log(` • GET /health - Gateway health check`);
  console.log(` • GET /services/health - All services health`);
  console.log(` • POST /api/auth/register - User registration`);
  console.log(` • POST /api/auth/login - User login`);
  console.log(` • GET /api/auth/me - Get user profile`);
  console.log(` • POST /api/battles - Create battle`);
  console.log(` • GET /api/battles - Get battles`);
  console.log(` • POST /api/ai/generate - Generate AI rap`);
  console.log('='.repeat(60) + '\n');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
