const express = require('express');
const router = express.Router();
const { getWebhooks, createWebhook, deleteWebhook, getAuditLogs } = require('../controllers/advancedController');
const { protect } = require('../middleware/authMiddleware');

router.get('/webhooks', protect, getWebhooks);
router.post('/webhooks', protect, createWebhook);
router.delete('/webhooks/:id', protect, deleteWebhook);

router.get('/audit-logs', protect, getAuditLogs);

module.exports = router;
