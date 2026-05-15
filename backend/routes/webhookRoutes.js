const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Billing = require('../models/Billing');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

// @desc    Handle Stripe Webhooks
// @route   POST /api/webhooks
// @access  Public
router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      // If STRIPE_WEBHOOK_SECRET is not set, we can't verify signature (useful for local dev mock testing)
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } else {
        // Fallback for mock testing without signature verification
        event = JSON.parse(req.body);
      }
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const billId = session.client_reference_id;

        try {
          const bill = await Billing.findById(billId);
          if (bill) {
            bill.status = 'paid';
            bill.stripePaymentIntentId = session.payment_intent;
            await bill.save();

            // Ensure user subscription status is active
            await User.findByIdAndUpdate(bill.userId, {
              subscriptionStatus: 'active',
            });
            console.log(`Bill ${billId} marked as paid.`);
          }
        } catch (error) {
          console.error('Error updating bill after webhook:', error);
        }
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  }
);

module.exports = router;
