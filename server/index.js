import express from 'express';
import mongoose from 'mongoose';
// import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import Feedback from './Models/Feedback.js';
import http from 'http';
import sanitizeHtml from 'sanitize-html';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import Joi from 'joi';
import { v2 as cloudinary } from 'cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
import bodyParser from "body-parser";
import paypalRoutes from './routes/paypal.js';
import productRoutes from './routes/product.js';
import { initializeReminderSystem } from './services/paymentReminderService.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/order.js';
import cartRoutes from './routes/cart.js';
import reviewRoutes from './routes/review.js';
import favoriteRoutes from './routes/favoritesRoutes.js';


dotenv.config({ path: './.env.local' });

const app = express();
const server = http.createServer(app);


app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet()); 

// This is a security feature that helps prevent XSS and data injection attacks
app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Only allow resources from same origin by default
      scriptSrc: ["'self'", "'unsafe-inline'"], // Scripts from same origin & inline
      styleSrc: ["'self'", "'unsafe-inline'"], // Styles from same origin & inline
    //   imgSrc: ["'self'", "data:", "https://yourcdn.com"], // Images from same origin, data URIs & your CDN
    //   connectSrc: ["'self'", "https://yourapi.com"] // API connections to same origin & your API domain
    }
  }));

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [FRONTEND_URL_LOCAL, FRONTEND_URL_PROD];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Limit payload size



// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true); 
} else {
    app.set('trust proxy', false); 
}

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
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

// Ensure required environment variables are present
if (!MONGO_URI || !PORT || !FRONTEND_URL_LOCAL || !FRONTEND_URL_PROD || !EMAIL_USER || !EMAIL_PASS || !RECAPTCHA_SECRET_KEY) {
    console.error('Missing required environment variables');
    process.exit(1);
}

// Rate limiters for feedback route
const feedbackLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 100, 
    message: 'Too many feedbacks submitted. Please try again later.'
});

  
  // Stronger limits specifically for auth routes
  const authLimiter = rateLimit({
    // windowMs: 60 * 60 * 1000, // 1 hour
    windowMs: 1 * 60 * 1000, // 1 min to test
    max: 30, // 30 requests per IP
    message: { error: 'Too many requests from this IP, please try again after an hour' }
  });
  
  // Apply to auth routes
  app.use('/api/auth/', authLimiter);



// Middleware
app.use("/api/feedback", feedbackLimiter);

// Feedback schema validation
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
        // Initialize the payment reminder system
        initializeReminderSystem();
        console.log('Payment reminder system initialized');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Feedback POST route
app.post("/api/feedback", async (req, res) => {
    const { name, surname, email, phone, message, captchaToken, terms } = req.body;
    const { error } = feedbackSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
  
    if (terms !== "yes") {
        return res.status(400).json({ message: "You must agree to the terms." });
    }

    const captchaValid = await verifyCaptcha(captchaToken);
    if (!captchaValid) return res.status(400).json({ message: "reCAPTCHA error. Please try again." });

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

// Cloudinary Images Route
app.get('/api/cloudinary-images', async (req, res) => {
    try {
        const { folder } = req.query;

        if (!folder) {
            return res.status(400).json({ error: 'Folder parameter is required' });
        }

        const { resources } = await cloudinary.api.resources({
            type: 'upload',
            prefix: `${folder}`,
            max_results: 20,
        });

        res.json(resources.map(file => file.secure_url));

    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});


app.get('/api/cloudinary-folders', async (req, res) => {
    try {
        const { folders } = await cloudinary.api.root_folders();
        const folderImages = {};

        for (const folder of folders) {
            try {
                const { resources } = await cloudinary.search
                    .expression(`folder:${folder.name}/*`) // Fetch images inside the folder
                    .sort_by("created_at", "desc")
                    .max_results(15) // Limit results to avoid rate limits
                    .execute();

                folderImages[folder.name] = resources.map(file => file.secure_url);
            } catch (imageError) {
                console.error(`Error fetching images for folder ${folder.name}:`, imageError);
                folderImages[folder.name] = []; // Ensure the folder exists in response
            }
        }

        res.json(folderImages);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
});



app.use(productRoutes);
app.use(paypalRoutes);
app.use(authRoutes);
app.use(orderRoutes);
app.use(cartRoutes);
app.use(favoriteRoutes);
app.use(reviewRoutes);
  

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// General error handler
// app.use((err, req, res, next) => {
//     console.error('Server error:', err);
//     res.status(500).json({ error: 'Internal server error' });
// });
app.use((err, req, res, next) => {
    // Log detailed error internally
    console.error(err);
    
    // Send generic response to client
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message
    });
  });

// Health Check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
