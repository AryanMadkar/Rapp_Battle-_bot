const jwt = require('jsonwebtoken');
const config = require('../config/env');

// ✅ Simplified middleware - NO DATABASE NEEDED
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);

      // ✅ Just attach the decoded user info, don't query database
      req.user = {
        id: decoded.id,
        _id: decoded.id, // For compatibility
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

module.exports = { protect };
