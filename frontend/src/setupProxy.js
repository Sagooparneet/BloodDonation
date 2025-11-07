const { createProxyMiddleware } = require('http-proxy-middleware');

// Use environment variable or default to production API
const API_URL = process.env.REACT_APP_API_URL || 'https://api.parneet.me';

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: API_URL,
      changeOrigin: true,
    })
  );
  app.use(
    '/auth',
    createProxyMiddleware({
      target: API_URL,
      changeOrigin: true,
    })
  );
};
