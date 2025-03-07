// import express from 'express';
// import Order from '../Models/Order.js';
// import Stripe from 'stripe';
// import { createMollieClient } from '@mollie/api-client';

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

// // Stripe webhook
// router.post("/api/webhooks/stripe", async (req, res) => {
//   let event;
//   try {
//     const signature = req.headers['stripe-signature'];
    
//     // Verify webhook signature
//     event = stripe.webhooks.constructEvent(
//       req.rawBody, // Raw request body
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error(`Webhook signature verification failed: ${err.message}`);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   try {
//     if (event.type === 'payment_intent.succeeded') {
//       const paymentIntent = event.data.object;
      
//       // Update order status
//       await Order.findOneAndUpdate(
//         { 'paymentIds.stripePaymentIntentId': paymentIntent.id },
//         { 
//           status: 'COMPLETED',
//           isPaid: true,
//           paymentDetails: paymentIntent,
//           updatedAt: new Date()
//         }
//       );
      
//       console.log(`Payment ${paymentIntent.id} succeeded via webhook`);
//     }
    
//     res.json({ received: true });
//   } catch (error) {
//     console.error(`Error processing webhook: ${error.message}`);
//     res.status(500).send('Server error processing webhook');
//   }
// });

// // Mollie webhook
// router.post("/api/webhooks/mollie", async (req, res) => {
//   try {
//     // Mollie sends the payment ID in the request body
//     const { id } = req.body;
    
//     if (!id) {
//       return res.status(400).send('Missing payment ID');
//     }
    
//     // Get payment details from Mollie
//     const payment = await mollie.payments.get(id);
    
//     // Update order status
//     if (payment.status === 'paid') {
//       await Order.findOneAndUpdate(
//         { 'paymentIds.molliePaymentId': id },
//         { 
//           status: 'COMPLETED',
//           isPaid: true,
//           paymentDetails: payment,
//           updatedAt: new Date()
//         }
//       );
      
//       console.log(`Payment ${id} succeeded via webhook`);
//     }
    
//     res.status(200).send('OK');
//   } catch (error) {
//     console.error(`Error processing webhook: ${error.message}`);
//     res.status(500).send('Server error processing webhook');
//   }
// });

// export default router;



// import express from 'express';
// // import Order from '../Models/Order.js';

// const router = express.Router();

// // Simple placeholder for future webhooks
// router.post("/api/webhooks/:provider", (req, res) => {
//   console.log(`Webhook received for ${req.params.provider}, but it's not configured yet.`);
//   res.status(200).send('OK');
// });

// export default router;







import express from 'express';
import Order from '../Models/Order.js';
import Stripe from 'stripe';
import { createMollieClient } from '@mollie/api-client';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config({ path: './.env.local' });

const router = express.Router();

// Debug logging
console.log('Initializing payment gateways...');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('MOLLIE_API_KEY exists:', !!process.env.MOLLIE_API_KEY);

// Initialize payment gateways with error handling
let stripe = null;
let mollie = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe initialized successfully');
  } else {
    console.error('STRIPE_SECRET_KEY is missing or empty');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error.message);
}

try {
  if (process.env.MOLLIE_API_KEY) {
    mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
    console.log('Mollie initialized successfully');
  } else {
    console.error('MOLLIE_API_KEY is missing or empty');
  }
} catch (error) {
  console.error('Failed to initialize Mollie:', error.message);
}

// Stripe webhook
router.post("/api/webhooks/stripe", async (req, res) => {
  console.log('Stripe webhook received');
  
  // Verify Stripe is initialized
  if (!stripe) {
    console.error('Stripe not initialized, cannot process webhook');
    return res.status(500).send('Stripe not initialized');
  }
  
  // Verify webhook secret is available
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is missing');
    return res.status(500).send('Webhook secret missing');
  }
  
  // Debug logging
  console.log('Raw body exists:', !!req.rawBody);
  
  let event;
  try {
    const signature = req.headers['stripe-signature'];
    console.log('Stripe signature exists:', !!signature);
    
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.rawBody, // Using raw body for signature verification
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log('Stripe event verified:', event.type);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log('Processing payment_intent.succeeded:', paymentIntent.id);
      
      // Update order status
      const updatedOrder = await Order.findOneAndUpdate(
        { 'paymentIds.stripePaymentIntentId': paymentIntent.id },
        { 
          status: 'COMPLETED',
          isPaid: true,
          paymentDetails: paymentIntent,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (updatedOrder) {
        console.log(`Payment ${paymentIntent.id} succeeded, order updated`);
      } else {
        console.warn(`Payment ${paymentIntent.id} succeeded, but no matching order found`);
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    res.status(500).send('Server error processing webhook');
  }
});

// Mollie webhook
router.post("/api/webhooks/mollie", async (req, res) => {
  console.log('Mollie webhook received');
  
  // Verify Mollie is initialized
  if (!mollie) {
    console.error('Mollie not initialized, cannot process webhook');
    return res.status(500).send('Mollie not initialized');
  }
  
  try {
    // Debug the incoming request
    console.log('Mollie webhook body:', req.body);
    
    // Mollie sends the payment ID in the request body
    const id = req.body.id;
    
    if (!id) {
      console.error('Missing payment ID in Mollie webhook');
      return res.status(400).send('Missing payment ID');
    }
    
    console.log('Fetching payment details from Mollie for ID:', id);
    
    // Get payment details from Mollie
    const payment = await mollie.payments.get(id);
    console.log('Mollie payment retrieved, status:', payment.status);
    
    // Update order status
    if (payment.status === 'paid') {
      const updatedOrder = await Order.findOneAndUpdate(
        { 'paymentIds.molliePaymentId': id },
        { 
          status: 'COMPLETED',
          isPaid: true,
          paymentDetails: payment,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (updatedOrder) {
        console.log(`Payment ${id} succeeded, order updated`);
      } else {
        console.warn(`Payment ${id} succeeded, but no matching order found`);
      }
    } else {
      console.log(`Payment ${id} status is ${payment.status}, no order update needed`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error(`Error processing Mollie webhook: ${error.message}`);
    res.status(500).send('Server error processing webhook');
  }
});

export default router;