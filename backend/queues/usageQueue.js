const { Queue, Worker } = require('bullmq');
const redis = require('../config/redis');
const Usage = require('../models/Usage');

// Create the Queue
const usageQueue = new Queue('UsageQueue', { connection: redis });

// Create the Worker to process jobs
const usageWorker = new Worker(
  'UsageQueue',
  async (job) => {
    try {
      const { apiId, userId, endpoint, timestamp } = job.data;
      
      // Save the usage log to MongoDB asynchronously
      await Usage.create({
        apiId,
        userId,
        endpoint,
        requestCount: 1,
        createdAt: timestamp,
      });
      
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
