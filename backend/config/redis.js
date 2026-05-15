const Redis = require('ioredis');

// Default to localhost if REDIS_URI is not set
const redisConfig = (process.env.REDIS_URI || 'redis://localhost:6379').trim();

const redisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  family: 0, // Force IPv4 to prevent ENOENT resolution errors
  keepAlive: 10000,
  pingInterval: 10000, // App-level ping to prevent Upstash timeout
};

// If using Upstash (rediss://), enforce TLS
if (redisConfig.startsWith('rediss://')) {
  redisOptions.tls = { rejectUnauthorized: false };
}

const redis = new Redis(redisConfig, redisOptions);

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

module.exports = redis;
