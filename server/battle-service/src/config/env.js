require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5002,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:5003',
  nodeEnv: process.env.NODE_ENV || 'development',
};
