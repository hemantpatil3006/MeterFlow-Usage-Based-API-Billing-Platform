const express = require('express');
const router = express.Router();
const { gatewayMiddleware } = require('../middleware/gatewayMiddleware');

// Mount the gateway middleware for all routes on this router
router.use(gatewayMiddleware);

// Mock Gateway Endpoint for testing
router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Gateway passed! Request validated, rate limited, and tracked successfully.',
    data: {
      userId: req.apiContext.userId,
      apiId: req.apiContext.apiId,
    }
  });
});

module.exports = router;
