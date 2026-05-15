const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Webhook route must be before express.json() because Stripe needs the raw body
app.use('/api/webhooks', require('./routes/webhookRoutes'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/apis', require('./routes/apiRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/advanced', require('./routes/advancedRoutes'));
app.use('/v1', require('./routes/gatewayRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('MeterFlow API is running...');
});

const http = require('http');
const server = http.createServer(app);

// Initialize Socket.io
require('./socket').init(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start billing cron job
  const startBillingCron = require('./cron/billingCron');
  startBillingCron();
});
