import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import Review from './Models/Review.js';
import Feedback from './Models/Feedback.js';
// import User from '../Models/User.js'; // Uncomment if needed
// import { Server } from 'socket.io'; // Uncomment if needed
import http from 'http';
import sanitizeHtml from 'sanitize-html';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import Joi from 'joi';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import bodyParser from "body-parser";
// import { Buffer } from "node:buffer";
import paypalRoutes from './routes/paypal.js';
// import paymentRoutes from './routes/payment.js';
import productRoutes from './routes/product.js';

dotenv.config({ path: './.env.local' });


const app = express();
app.use(cors());
// app.use(express.json());
app.use(bodyParser.json());
const server = http.createServer(app);

// Load environment variables
dotenv.config({ path: './.env.local' });

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true); 
} else {
    app.set('trust proxy', false); 
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'reviews', 
        allowed_formats: ['jpg', 'jpeg', 'png'],
        // transformation: [{ width: 1000, height: 1000, crop: 'limit' }], 
    }, 
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Please upload an image file'), false);
        }
        cb(null, true);
    }
});


const { 
    MONGO_URI, 
    PORT, 
    FRONTEND_URL_LOCAL, 
    FRONTEND_URL_PROD,
    EMAIL_USER,
    EMAIL_PASS,
    RECAPTCHA_SECRET_KEY
} = process.env;


if (!MONGO_URI || !PORT || !FRONTEND_URL_LOCAL || !FRONTEND_URL_PROD || !EMAIL_USER || !EMAIL_PASS || !RECAPTCHA_SECRET_KEY) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // 3 reviews per IP
    message: 'Too many reviews submitted. Please try again later.'
});

const feedbackLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 1 hour
    max: 100, // 3 reviews per IP
    message: 'Too many feedbacks submitted. Please try again later.'
});

// Middleware
app.use("/api/feedback", feedbackLimiter);

app.use(helmet()); 

app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [FRONTEND_URL_LOCAL, FRONTEND_URL_PROD, 'http://localhost:5173/cart' ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

const feedbackSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    surname: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).allow(""),
    message: Joi.string().min(2).max(1000).required(),
    captchaToken: Joi.string().required(),
    terms: Joi.string().valid("yes").required() 
  });


async function verifyCaptcha(token) {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      { method: "POST" }
    );
    const data = await response.json();
    return data.success;
  }

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });


// MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // setupChangeStream();
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });


app.post("/api/feedback", async (req, res) => {
    const { name, surname, email, phone, message, captchaToken, terms } = req.body;
  
    const { error } = feedbackSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
  
    if (terms !== "yes") {
        return res.status(400).json({ message: "You must agree to the terms." });
      }

    const captchaValid = await verifyCaptcha(captchaToken);
    if (!captchaValid)
      return res.status(400).json({ message: "reCAPTCHA error. Please try again." });
  
    const sanitizedMessage = sanitizeHtml(message, {
      allowedTags: [],
      allowedAttributes: {},
    });
  
    try {
      const feedback = new Feedback({ name, surname, email, phone, message });
      await feedback.save();

      const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `New message from ${name} ${surname}`,
        text: `
          Name: ${name}
          Surname: ${surname}
          Email: ${email}
          Phone: ${phone || "not provided"}
          Message:
          ${sanitizedMessage}
        `,
      };
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: "Message sent successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  });


app.post('/api/reviews', reviewLimiter, upload.single('image'), async (req, res) => { 
    try {
        const { name, rating, message } = req.body;

        if (!name || !rating || !message) {
            return res.status(400).json({ 
                error: 'Name, rating, and message are required' 
            });
        }

        const numericRating = Number(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ 
                error: 'Rating must be a number between 1 and 5' 
            });
        }

        // Sanitize inputs
        const sanitizedMessage = sanitizeHtml(message, {
            allowedTags: [],
            allowedAttributes: {}
        });

        const imageUrl = req.file ? req.file.path : null;

        const newReview = new Review({
            name: name.trim(),
            rating: numericRating,
            message: sanitizedMessage.trim(),
            image: imageUrl,
            approved: false,
            ipAddress: req.ip,
            // userAgent: req.get('user-agent')
        });

        const savedReview = await newReview.save();

        // Remove sensitive data from response
        const responseReview = {
            id: savedReview._id,
            name: savedReview.name,
            rating: savedReview.rating,
            message: savedReview.message,
            image: savedReview.image,
            createdAt: savedReview.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully and pending approval',
            data: responseReview
        });

    } catch (error) {
        console.error('Error submitting review:', error);
        
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ 
                error: `File upload error: ${error.message}` 
            });
        }

        if (error.message && error.message.includes('file size')) {
            return res.status(400).json({ 
                error: 'File size too large. Please upload an image less than 5MB.' 
            });
        }

        if (error.message && error.message.includes('cloudinary')) {
            return res.status(400).json({ 
                error: 'Image upload failed. Please try again with a different image.' 
            });
        }

        res.status(500).json({ 
            error: 'Failed to submit review. Please try again later.' 
        });
    }
});

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            error: `Upload error: ${error.message}`
        });
    }
    next(error);
});


app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ approved: true })
            .select('-ipAddress -userAgent')
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});



//===========================================================
// const getPayPalAccessToken = async () => {
//     const clientId = process.env.PAYPAL_CLIENT_ID;
//     const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
//     if (!clientId || !clientSecret) {
//       throw new Error("PayPal Client ID or Secret is missing!");
//     }
  
//     const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

//     try {
//     const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
//         method: "POST",
//         headers: {
//             "Authorization": `Basic ${auth}`,
//             "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: "grant_type=client_credentials",
//     });

//     if (!response.ok) {
//         throw new Error(`PayPal token request failed: ${response.status} ${response.statusText}`);
//       }
  
//     const data = await response.json();
  
//     if (!data.access_token) {
//         throw new Error("❌ Failed to get PayPal access token");
//     }
  
//     return data.access_token;

//     } catch (error) {
//         console.error("PayPal token error:", error);
//         throw new Error("Failed to authenticate with PayPal");
//     }
//   };
  
  
//   const createPayPalOrder = async (cart = []) => {
//     const accessToken = await getPayPalAccessToken(); 
  
//     const orderData = {
//         intent: "CAPTURE",
//         purchase_units: [
//           {
//               items: [
//                   {
//                       name: 'Scarf',
//                       description: 'Super scarf',
//                       quantity: 1,
//                       unit_amount: {
//                           currency_code: 'EUR',
//                           value: '100.00'
//                       }
//                   }
//               ],
  
//               amount: {
//                   currency_code: 'EUR',
//                   value: '100.00',
//                   breakdown: {
//                       item_total: {
//                           currency_code: 'EUR',
//                           value: '100.00'
//                       }
//                   }
//               }
//           }
//         ],
//         payment_source: {
//             paypal: {
//                 experience_context: {
//                     brand_name: 'VARONA'
//                 },
//             },
//           },
//     };
  
//     try {
//     const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${accessToken}`,
//             "PayPal-Request-Id": `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
//         },
//         body: JSON.stringify(orderData),
//     });

//     if (!response.ok) {
//         const errorText = await response.text();
//         console.error("PayPal order creation failed:", errorText);
//         throw new Error(`Failed to create PayPal order: ${response.status}`);
//       }
  
//     const data = await response.json();
//     console.log("🟢 PayPal API Response:", data); 

//     return data;

//     } catch (error) {
//         console.error("Error in createPayPalOrder:", error);
//         throw error;
//     }
//   };
  

//   app.post("/api/orders", async (req, res) => {
//     try {
//         console.log("📩 Received request to create order:", req.body);
  
//         const { cart } = req.body;
//         if (!cart || !Array.isArray(cart)) {
//           return res.status(400).json({ error: "Invalid cart data" });
//         }

//         const order = await createPayPalOrder(cart); // Make sure this function returns the order object
//         console.log("🟢 PayPal Order Created:", order); 
  
//         if (!order || !order.id) {
//             return res.status(500).json({ error: "Failed to create order" });
//           }
  
//         res.json({ id: order.id });  // ✅ Ensure response includes the order ID

//     } catch (error) {
//         console.error("❌ Error creating order:", error);
//         res.status(500).json({ 
//           error: "Internal Server Error",
//           message: error.message 
//         });
//       }
//   });
  
//   app.post("/api/orders/:orderID/capture", async (req, res) => {
//     try {
//         const { orderID } = req.params;

//         if (!orderID) {
//             return res.status(400).json({ error: "Order ID is required" });
//           }
  
//         const accessToken = await getPayPalAccessToken();
//         const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${accessToken}`,
//                 "PayPal-Request-Id": `capture-${orderID}-${Date.now()}` // Idempotency key
//             }
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             console.error("PayPal capture failed:", errorText);
//             return res.status(response.status).json({ 
//               error: "Failed to capture payment",
//               details: errorText
//             });
//           }
  
//           const data = await response.json();
    
//           // Handle successful payment here (update database, send confirmation email, etc.)
          
//           res.json(data);

//         } catch (error) {
//             console.error("Error capturing order:", error);
//             res.status(500).json({ 
//               error: "Failed to capture order",
//               message: error.message
//             });
//           }
//   });


app.use(paypalRoutes);

app.use(productRoutes);
// app.use(paymentRoutes);

//===========================================================

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
    console.log('Shutting down gracefully...');
    server.close(() => {
        mongoose.connection.close(false, () => {
            console.log('Server and MongoDB connection closed');
            process.exit(0);
        });
    });
}