import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import Review from './Models/Review.js';
import Feedback from './Models/Feedback.js';
import http from 'http';
import sanitizeHtml from 'sanitize-html';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import Joi from 'joi';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import bodyParser from "body-parser";
import paypalRoutes from './routes/paypal.js';
import productRoutes from './routes/product.js';

dotenv.config({ path: './.env.local' });

const app = express();
const server = http.createServer(app);

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

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "Ellements",
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
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

// Ensure required environment variables are present
if (!MONGO_URI || !PORT || !FRONTEND_URL_LOCAL || !FRONTEND_URL_PROD || !EMAIL_USER || !EMAIL_PASS || !RECAPTCHA_SECRET_KEY) {
    console.error('Missing required environment variables');
    process.exit(1);
}

// Rate limiters for review and feedback routes
const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 30, 
    message: 'Too many reviews submitted. Please try again later.'
});

const feedbackLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 100, 
    message: 'Too many feedbacks submitted. Please try again later.'
});

// Middleware
app.use("/api/feedback", feedbackLimiter);
app.use(helmet()); 

app.use(express.json({ limit: '10mb' })); 
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [FRONTEND_URL_LOCAL, FRONTEND_URL_PROD, 'http://localhost:5173/cart'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

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


// Reviews Route
// Reviews Route
app.post('/api/reviews', async (req, res) => {
    try {
        const { name, message, rating, image } = req.body;

        if (!name || !message || !rating) {
            return res.status(400).json({ error: 'Name, message, and rating are required' });
        }

        const newReview = new Review({
            name,
            message,
            rating,
            image,
            approved: false,
            createdAt: new Date()
        });

        await newReview.save();
        res.status(201).json({ message: 'Review submitted successfully', review: newReview });
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Reviews GET route
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ approved: true })
            .select('-ipAddress')  // Excluding 'ipAddress' from the response
            .sort({ createdAt: -1 }); // Sorting reviews by creation date, newest first

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Product and PayPal routes
app.use(productRoutes);
app.use(paypalRoutes);

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// General error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Health Check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
