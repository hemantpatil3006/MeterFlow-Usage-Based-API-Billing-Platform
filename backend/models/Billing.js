const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema(
  {
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
    totalRequests: {
      type: Number,
      required: true,
      default: 0,
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
    },
    billingPeriod: {
      type: String, // Format: YYYY-MM
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    stripePaymentIntentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
billingSchema.index({ userId: 1, billingPeriod: 1 });
billingSchema.index({ apiId: 1, billingPeriod: 1 });

module.exports = mongoose.model('Billing', billingSchema);
