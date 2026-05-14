const crypto = require('crypto');
const Api = require('../models/Api');
const ApiKey = require('../models/ApiKey');

// Generate a secure API Key
const generateKey = () => {
  return 'mf_' + crypto.randomBytes(32).toString('hex');
};

// @desc    Create a new API
// @route   POST /api/apis
// @access  Private
const createApi = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please add an API name' });
    }

    // Create the API record
    const api = await Api.create({
      name,
      description,
      userId: req.user.id,
    });

    // Generate and store the first API key for this API
    const keyString = generateKey();
    const apiKey = await ApiKey.create({
      key: keyString,
      userId: req.user.id,
      apiId: api._id,
    });

    res.status(201).json({
      api,
      apiKey: apiKey.key,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user APIs
// @route   GET /api/apis
// @access  Private
const getApis = async (req, res) => {
  try {
    const apis = await Api.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    // For each API, fetch its active API key to send to the client
    const apiData = await Promise.all(apis.map(async (api) => {
      const apiKey = await ApiKey.findOne({ apiId: api._id }).sort({ createdAt: -1 });
      return {
        ...api._doc,
        apiKey: apiKey ? apiKey.key : null,
      };
    }));

    res.status(200).json(apiData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Regenerate API Key
// @route   POST /api/apis/:id/regenerate
// @access  Private
const regenerateApiKey = async (req, res) => {
  try {
    const api = await Api.findById(req.params.id);

    if (!api) {
      return res.status(404).json({ message: 'API not found' });
    }

    // Make sure the logged in user owns the API
    if (api.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete the old key(s)
    await ApiKey.deleteMany({ apiId: api._id });

    // Create the new key
    const newKeyString = generateKey();
    const newApiKey = await ApiKey.create({
      key: newKeyString,
      userId: req.user.id,
      apiId: api._id,
    });

    res.status(200).json({ apiKey: newApiKey.key });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createApi,
  getApis,
  regenerateApiKey,
};
