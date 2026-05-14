const mongoose = require('mongoose');

const apiKeySchema = mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    apiId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Api',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ApiKey', apiKeySchema);
