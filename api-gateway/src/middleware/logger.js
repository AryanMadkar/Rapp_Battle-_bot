const morgan = require('morgan');

// Custom token for logging service name
morgan.token('service', (req) => {
  if (req.originalUrl.startsWith('/api/auth')) return 'AUTH';
  if (req.originalUrl.startsWith('/api/battles')) return 'BATTLE';
  if (req.originalUrl.startsWith('/api/ai')) return 'AI';
  return 'GATEWAY';
});

// Custom format
const logFormat = ':method :url :status :response-time ms - :service';

module.exports = morgan(logFormat);
