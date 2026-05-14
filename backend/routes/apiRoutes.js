const express = require('express');
const router = express.Router();
const {
  createApi,
  getApis,
  regenerateApiKey,
} = require('../controllers/apiController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getApis).post(protect, createApi);
router.post('/:id/regenerate', protect, regenerateApiKey);

module.exports = router;
