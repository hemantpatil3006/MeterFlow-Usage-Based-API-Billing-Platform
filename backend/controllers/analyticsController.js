const Usage = require('../models/Usage');
const Api = require('../models/Api');
const Billing = require('../models/Billing');
const mongoose = require('mongoose');

// @desc    Get dashboard metrics (total calls, monthly usage, costs)
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total API calls
    const totalUsage = await Usage.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$requestCount' } } }
    ]);
    const totalCalls = totalUsage.length > 0 ? totalUsage[0].total : 0;

    // Get current month's cost
    const currentDate = new Date();
    const currentMonth = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
    
    const bills = await Billing.find({ userId, billingPeriod: currentMonth });
    const currentCost = bills.reduce((acc, bill) => acc + bill.cost, 0);

    // Get usage trend for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usageTrend = await Usage.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          calls: { $sum: '$requestCount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalCalls,
      currentCost,
      usageTrend: usageTrend.map(t => ({ date: t._id, calls: t.calls }))
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get detailed analytics (latency, errors)
// @route   GET /api/analytics/detailed
// @access  Private
const getDetailedAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { apiId } = req.query; // Optional filter

    let matchQuery = { userId: new mongoose.Types.ObjectId(userId) };
    if (apiId) {
      matchQuery.apiId = new mongoose.Types.ObjectId(apiId);
    }

    // Average latency per API
    const latencyStats = await Usage.aggregate([
      { $match: { ...matchQuery, latency: { $exists: true } } },
      {
        $group: {
          _id: '$apiId',
          avgLatency: { $avg: '$latency' }
        }
      }
    ]);

    // Populate API names for latency stats
    const populatedLatency = await Api.populate(latencyStats, { path: '_id', select: 'name' });

    // Error rates (status >= 400)
    const errorStats = await Usage.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            apiId: '$apiId',
            isError: { $gte: ['$status', 400] }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      latencyStats: populatedLatency.map(l => ({ apiName: l._id?.name || 'Unknown', avgLatency: l.avgLatency || 0 })),
      errorStats // Need to parse on frontend
    });
  } catch (error) {
    console.error('Error fetching detailed analytics:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getDashboardMetrics,
  getDetailedAnalytics
};
