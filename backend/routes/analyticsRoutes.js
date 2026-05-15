const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getDetailedAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardMetrics);
router.get('/detailed', protect, getDetailedAnalytics);

module.exports = router;
