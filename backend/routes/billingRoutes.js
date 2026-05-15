const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Billing = require('../models/Billing');
const { protect } = require('../middleware/authMiddleware');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

// @desc    Get user's bills
// @route   GET /api/billing
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const bills = await Billing.find({ userId: req.user._id })
      .populate('apiId', 'name')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create Stripe Checkout Session
// @route   POST /api/billing/checkout
// @access  Private
router.post('/checkout', protect, async (req, res) => {
  try {
    const { billId } = req.body;

    const bill = await Billing.findOne({ _id: billId, userId: req.user._id }).populate('apiId');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'Bill is already paid' });
    }

    // Amount must be in smallest currency unit (paise for INR)
    // cost is in Rupees (e.g. 1.50). Multiplying by 100 gives paise.
    const amountInPaise = Math.round(bill.cost * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `API Usage Bill - ${bill.apiId.name} (${bill.billingPeriod})`,
              description: `${bill.totalRequests} requests`,
            },
            unit_amount: amountInPaise,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?canceled=true`,
      client_reference_id: bill._id.toString(),
      customer_email: req.user.email,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
