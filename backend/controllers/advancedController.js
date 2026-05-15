const UserWebhook = require('../models/UserWebhook');
const AuditLog = require('../models/AuditLog');

// @desc    Get user webhooks
// @route   GET /api/advanced/webhooks
// @access  Private
const getWebhooks = async (req, res) => {
  try {
    const webhooks = await UserWebhook.find({ userId: req.user._id });
    res.json(webhooks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create user webhook
// @route   POST /api/advanced/webhooks
// @access  Private
const createWebhook = async (req, res) => {
  try {
    const { endpointUrl, events } = req.body;
    const webhook = await UserWebhook.create({
      userId: req.user._id,
      endpointUrl,
      events,
    });
    res.status(201).json(webhook);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user webhook
// @route   DELETE /api/advanced/webhooks/:id
// @access  Private
const deleteWebhook = async (req, res) => {
  try {
    const webhook = await UserWebhook.findOne({ _id: req.params.id, userId: req.user._id });
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    await webhook.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get audit logs (admin sees all, user sees own)
// @route   GET /api/advanced/audit-logs
// @access  Private
const getAuditLogs = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Helper function to create an audit log (to be used across controllers)
const createAuditLog = async (userId, action, details, ipAddress) => {
  try {
    await AuditLog.create({ userId, action, details, ipAddress });
  } catch (error) {
    console.error('Failed to create audit log', error);
  }
};

module.exports = {
  getWebhooks,
  createWebhook,
  deleteWebhook,
  getAuditLogs,
  createAuditLog
};
