const { validateApiKey } = require('./apiKeyMiddleware');
const redis = require('../config/redis');
const { usageQueue } = require('../queues/usageQueue');

// Rate limiting and usage tracking middleware
const gatewayMiddleware = [
  // 1. Validate the API Key (attaches req.apiContext)
  validateApiKey,
  
  // 2. Enforce Rate Limits & Track Usage
  async (req, res, next) => {
    try {
      const { apiId, userId } = req.apiContext;
      const apiKeyString = req.headers['x-api-key'];
      
      const currentTime = Math.floor(Date.now() / 1000);
      const windowInSeconds = 60; // 1 minute window
      const limit = 100; // 100 requests per minute
      
      const redisKey = `rate_limit:${apiKeyString}`;
      
      // Atomic increment using Redis pipeline
      const pipeline = redis.pipeline();
      pipeline.incr(redisKey);
      pipeline.ttl(redisKey);
      const results = await pipeline.exec();
      
      const requestCount = results[0][1];
      const ttl = results[1][1];
      
      // If this is the first request in the window, set the expiration
      if (ttl === -1) {
        await redis.expire(redisKey, windowInSeconds);
      }
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - requestCount));
      
      if (requestCount > limit) {
        return res.status(429).json({ 
          message: 'Too Many Requests. Rate limit exceeded (100 req/min).' 
        });
      }
      
      // 3. Track Usage Asynchronously via BullMQ
      // We capture the start time and listen for the response to finish
      const startTime = Date.now();
      
      res.on('finish', async () => {
        const latency = Date.now() - startTime;
        const status = res.statusCode;

        await usageQueue.add('trackUsage', {
          apiId,
          userId,
          endpoint: req.originalUrl,
          latency,
          status,
          timestamp: new Date(),
        });
      });
      
      next();
    } catch (error) {
      console.error('Gateway Middleware Error:', error);
      res.status(500).json({ message: 'Internal Server Error in Gateway' });
    }
  }
];

module.exports = { gatewayMiddleware };
