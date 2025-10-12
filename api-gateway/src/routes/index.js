const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config/env');
const { aiLimiter, authLimiter } = require('../middleware/rateLimiter');

// Helper for restreaming body to downstream service
const reStreamBody = (proxyReq, req) => {
  if (
    req.method !== 'GET' &&
    req.method !== 'HEAD' &&
    req.body &&
    Object.keys(req.body).length
  ) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }
};

module.exports = (app) => {
  // Health check for gateway
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      service: 'api-gateway',
      status: 'running',
      timestamp: new Date().toISOString(),
      services: {
        auth: config.services.auth,
        battle: config.services.battle,
        ai: config.services.ai,
      },
    });
  });

  // Auth microservice proxy
  app.use(
    '/api/auth',
    authLimiter,
    createProxyMiddleware({
      target: config.services.auth,
      changeOrigin: true,
      logLevel: 'debug',
      proxyTimeout: 30000,
      timeout: 30000,
      pathRewrite: { '^/api/auth': '/api/auth' },
      onProxyReq: (proxyReq, req, res) => {
        reStreamBody(proxyReq, req);
        console.log(`[AUTH] Proxying ${req.method} ${req.url} -> ${config.services.auth}${req.url}`);
      },
      onError: (err, req, res) => {
        console.error('[AUTH] Proxy Error:', err);
        res.status(500).json({ success: false, message: 'Auth service unavailable', error: err.message });
      },
    })
  );

  // Battle microservice proxy
  app.use(
    '/api/battles',
    createProxyMiddleware({
      target: config.services.battle,
      changeOrigin: true,
      logLevel: 'debug',
      proxyTimeout: 30000,
      timeout: 30000,
      pathRewrite: { '^/api/battles': '/api/battles' },
      onProxyReq: (proxyReq, req, res) => {
        reStreamBody(proxyReq, req);
        console.log(`[BATTLE] Proxying ${req.method} ${req.url} -> ${config.services.battle}${req.url}`);
      },
      onError: (err, req, res) => {
        console.error('[BATTLE] Proxy Error:', err);
        res.status(500).json({ success: false, message: 'Battle service unavailable', error: err.message });
      },
    })
  );

  // AI microservice proxy
  app.use(
    '/api/ai',
    aiLimiter,
    createProxyMiddleware({
      target: config.services.ai,
      changeOrigin: true,
      logLevel: 'debug',
      proxyTimeout: 30000,
      timeout: 30000,
      pathRewrite: { '^/api/ai': '/api/ai' },
      onProxyReq: (proxyReq, req, res) => {
        reStreamBody(proxyReq, req);
        console.log(`[AI] Proxying ${req.method} ${req.url} -> ${config.services.ai}${req.url}`);
      },
      onError: (err, req, res) => {
        console.error('[AI] Proxy Error:', err);
        res.status(500).json({ success: false, message: 'AI service unavailable', error: err.message });
      },
    })
  );

  // Microservices health check
  app.get('/services/health', async (req, res) => {
    try {
      const axios = require('axios');
      const checks = await Promise.allSettled([
        axios.get(`${config.services.auth}/health`, { timeout: 5000 }),
        axios.get(`${config.services.battle}/health`, { timeout: 5000 }),
        axios.get(`${config.services.ai}/health`, { timeout: 5000 }),
      ]);
      const serviceStatus = {
        auth: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        battle: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        ai: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      };
      const allHealthy = Object.values(serviceStatus).every(s => s === 'healthy');
      res.status(allHealthy ? 200 : 503).json({
        success: allHealthy,
        gateway: 'healthy',
        services: serviceStatus,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to check service health', error: error.message });
    }
  });

  // Catch-all for 404
  app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
  });
};
