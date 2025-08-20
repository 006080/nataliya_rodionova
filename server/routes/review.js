import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import Review from '../Models/Review.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { businessLogger } from '../middleware/logging.js';
import logger from '../services/logger.js';

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
            await logger.warn('REVIEW_VALIDATION_ERROR', 'POST /api/reviews', 'Review submission with missing required fields', {
                ip: req.ip,
                userAgent: req.get('User-Agent')?.substring(0, 200),
                hasName: !!name,
                hasMessage: !!message,
                hasRating: !!rating
            });
            return res.status(400).json({ error: 'Name, message, and rating are required' });
        }

        // Validate rating value
        const ratingValue = Number(rating);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            await logger.warn('REVIEW_INVALID_RATING', 'POST /api/reviews', `Invalid rating value submitted: ${rating}`, {
                ip: req.ip,
                name: name,
                rating: rating
            });
            return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
        }

        const imageUrl = req.file ? req.file.path : null;

        if (req.file) {
            await logger.debug('REVIEW_IMAGE_UPLOAD', 'POST /api/reviews', `Review image uploaded successfully for ${name}`, {
                ip: req.ip,
                imageUrl: imageUrl,
                fileSize: req.file.size
            });
        }

        const newReview = new Review({
            name,
            message,
            rating: Number(rating),
            image: imageUrl,
            approved: false,
            createdAt: new Date()
        });

        await newReview.save();

        businessLogger.reviewSubmitted(req, name, ratingValue);

        await logger.info('REVIEW_CREATED', 'POST /api/reviews', `Review created successfully by ${name} with rating ${ratingValue}`, {
            ip: req.ip,
            reviewId: newReview._id.toString(),
            rating: ratingValue,
            hasImage: !!imageUrl
        });

        res.status(201).json({ message: 'Review submitted successfully', review: newReview });
    } catch (error) {
        console.error('Error saving review:', error);
                if (error.code === 'LIMIT_FILE_SIZE') {
            await logger.warn('REVIEW_FILE_TOO_LARGE', 'POST /api/reviews', `File size exceeded for review submission`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')?.substring(0, 200)
            });
            return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed.' });
        }
        
        if (error.message === 'Please upload an image file') {
            await logger.warn('REVIEW_INVALID_FILE_TYPE', 'POST /api/reviews', `Invalid file type uploaded for review`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')?.substring(0, 200)
            });
            return res.status(400).json({ error: 'Please upload an image file (jpg, jpeg, png, webp).' });
        }

        await logger.error('REVIEW_ERROR', 'POST /api/reviews', `Review submission failed: ${error.message}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent')?.substring(0, 200)
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/api/reviews', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1 || limit > 50) {
            await logger.warn('REVIEW_INVALID_PAGINATION', 'GET /api/reviews', `Invalid pagination parameters: page=${page}, limit=${limit}`, {
                ip: req.ip
            });
            return res.status(400).json({ error: 'Invalid pagination parameters' });
        }

        const totalReviews = await Review.countDocuments({ approved: true });
        
        const reviews = await Review.find({ approved: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            // .select('name message rating image createdAt') // Only select needed fields
            // .lean(); // Use lean for better performance
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
        await logger.error('REVIEW_FETCH_ERROR', 'GET /api/reviews', `Failed to fetch reviews: ${error.message}`, {
            ip: req.ip
        });
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});


export default router;