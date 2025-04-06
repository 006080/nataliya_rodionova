import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import Review from '../Models/Review.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Review rate limiter
const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 30, 
    message: 'Too many reviews submitted. Please try again later.'
});

// Cloudinary storage configuration
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

router.post('/api/reviews', reviewLimiter, upload.single('image'), async (req, res) => {
    try {
        const { name, message, rating } = req.body;

        if (!name || !message || !rating) {
            return res.status(400).json({ error: 'Name, message, and rating are required' });
        }

        const imageUrl = req.file ? req.file.path : null;

        const newReview = new Review({
            name,
            message,
            rating: Number(rating),
            image: imageUrl,
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


router.get('/api/reviews', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        const totalReviews = await Review.countDocuments({ approved: true });
        
        const reviews = await Review.find({ approved: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        res.status(200).json({
            reviews,
            pagination: {
                totalReviews,
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                hasMore: page < Math.ceil(totalReviews / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});


export default router;