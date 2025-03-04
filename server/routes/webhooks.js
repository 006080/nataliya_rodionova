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



import express from 'express';
// import Order from '../Models/Order.js';

const router = express.Router();

// Simple placeholder for future webhooks
router.post("/api/webhooks/:provider", (req, res) => {
  console.log(`Webhook received for ${req.params.provider}, but it's not configured yet.`);
  res.status(200).send('OK');
});

export default router;