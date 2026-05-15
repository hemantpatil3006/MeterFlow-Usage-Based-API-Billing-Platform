const { Queue, Worker } = require('bullmq');
const redis = require('../config/redis');
const Usage = require('../models/Usage');
const socket = require('../socket');

// Create the Queue
const usageQueue = new Queue('UsageQueue', { connection: redis });

// Create the Worker to process jobs
const usageWorker = new Worker(
  'UsageQueue',
  async (job) => {
    try {
      const { apiId, userId, endpoint, latency, status, timestamp } = job.data;
      
      // Save the usage log to MongoDB asynchronously
      const usage = await Usage.create({
        apiId,
        userId,
        endpoint,
        requestCount: 1,
        latency,
        status,
        createdAt: timestamp,
      });

      // Emit real-time update
      try {
        const io = socket.getIO();
        io.to(userId).emit('usage_updated', {
          apiId,
          endpoint,
          latency,
          status,
          timestamp,
        });
      } catch (err) {
        // Socket might not be initialized if worker runs separately
        console.error('Socket emission error:', err.message);
      }
      
    } catch (error) {
      console.error('Error processing usage job:', error);
      throw error;
    }
  },
  { connection: redis }
);

usageWorker.on('completed', (job) => {
  // console.log(`Usage job ${job.id} completed successfully`);
});

usageWorker.on('failed', (job, err) => {
  console.error(`Usage job ${job.id} failed with error ${err.message}`);
});

module.exports = {
  usageQueue,
  usageWorker,
};
