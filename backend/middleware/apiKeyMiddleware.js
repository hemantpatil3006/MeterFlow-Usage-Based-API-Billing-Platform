const ApiKey = require('../models/ApiKey');

const validateApiKey = async (req, res, next) => {
  const apiKeyString = req.headers['x-api-key'];

  if (!apiKeyString) {
    return res.status(401).json({ message: 'API key is missing' });
  }

  try {
    const apiKeyDoc = await ApiKey.findOne({ key: apiKeyString });

    if (!apiKeyDoc) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Attach user and API context to request for further processing (e.g., billing)
    req.apiContext = {
      userId: apiKeyDoc.userId,
      apiId: apiKeyDoc.apiId,
    };

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error while validating API key' });
  }
};

module.exports = { validateApiKey };
