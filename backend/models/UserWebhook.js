const mongoose = require('mongoose');

const userWebhookSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    endpointUrl: {
      type: String,
      required: true,
    },
    events: [{
      type: String,
      enum: ['quota_warning', 'quota_exceeded', 'billing_failed'],
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster queries
userWebhookSchema.index({ userId: 1 });

module.exports = mongoose.model('UserWebhook', userWebhookSchema);
