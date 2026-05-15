const cron = require('node-cron');
const Usage = require('../models/Usage');
const Billing = require('../models/Billing');

const COST_PER_REQUEST = 0.01;

// Run at 00:00 on day-of-month 1
const startBillingCron = () => {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running monthly billing calculation...');
    try {
      // Calculate previous month's period string (e.g. "2026-04")
      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth(); // 0-indexed, so getMonth() is the previous month (1-12)
      if (month === 0) {
        month = 12;
        year -= 1;
      }
      const periodStr = `${year}-${String(month).padStart(2, '0')}`;

      // Calculate start and end of previous month for querying Usage
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1); // 1st day of current month

      // Aggregate usage by userId and apiId
      const usageStats = await Usage.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: { userId: '$userId', apiId: '$apiId' },
            totalRequests: { $sum: '$requestCount' },
          },
        },
      ]);

      for (const stat of usageStats) {
        const { userId, apiId } = stat._id;
        const totalRequests = stat.totalRequests;
        const cost = totalRequests * COST_PER_REQUEST;

        // Check if a billing record already exists for this period to prevent duplicates
        const existingBill = await Billing.findOne({
          userId,
          apiId,
          billingPeriod: periodStr,
        });

        if (!existingBill && totalRequests > 0) {
          await Billing.create({
            userId,
            apiId,
            totalRequests,
            cost: Number(cost.toFixed(2)),
            billingPeriod: periodStr,
            status: 'pending',
          });
        }
      }
      console.log(`Billing calculation completed for period ${periodStr}`);
    } catch (error) {
      console.error('Error in billing cron job:', error);
    }
  });
};

module.exports = startBillingCron;
