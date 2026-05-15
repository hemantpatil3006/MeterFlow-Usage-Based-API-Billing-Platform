const mongoose = require('mongoose');

const usageSchema = mongoose.Schema(
  {
    apiId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Api',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    requestCount: {
      type: Number,
      required: true,
      default: 1,
    },
    endpoint: {
      type: String,
      required: true,
    },
    latency: {
      type: Number,
    },
    status: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster analytics and billing queries
usageSchema.index({ userId: 1, createdAt: -1 });
usageSchema.index({ apiId: 1, createdAt: -1 });

module.exports = mongoose.model('Usage', usageSchema);
