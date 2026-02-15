import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';
// Fix: Import CloudinaryStorage directly as a named export
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import Review from '../Models/Review.js';
import { businessLogger } from '../middleware/logging.js';
import logger from '../services/logger.js';

const router = express.Router();

// Rate limiter
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: 'Too many reviews submitted. Please try again later.'
});

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for multer + Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Ellements',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

// Multer setup
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload an image file'), false);
    }
    cb(null, true);
  }
});

// POST /api/reviews
router.post(
  '/api/reviews',
  reviewLimiter,
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, message, rating } = req.body;
      if (!name || !message || !rating) {
        return res.status(400).json({ error: 'Name, message, and rating are required' });
      }

      const ratingValue = Number(rating);
      if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const imageUrl = req.file ? req.file.path : null;

      const newReview = new Review({
        name,
        message,
        rating: ratingValue,
        image: imageUrl,
        approved: false,
        createdAt: new Date()
      });

      await newReview.save();
      res.status(201).json({ message: 'Review submitted', review: newReview });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/reviews
router.get('/api/reviews', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 6, 50);
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
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;