require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Microservices URLs
    services: {
        auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
        battle: process.env.BATTLE_SERVICE_URL || 'http://localhost:5002',
        ai: process.env.AI_SERVICE_URL || 'http://localhost:5003',
    },

    // Rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    },
};
