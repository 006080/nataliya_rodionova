import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    email: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
    image: {
        type: String, 
        default: null
    },
    approved: {
        type: Boolean,
        default: false
    },
    ipAddress: String,
    userAgent: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    // Privacy & anonymization fields
    anonymized: { 
        type: Boolean, 
        default: false 
    },
    anonymizedAt: Date,
    pendingAnonymization: {
        type: Boolean,
        default: false
    },
    anonymizationDate: Date,
    
    // User reference (optional) - makes it easier to find all reviews from a user
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    }
});

// Index for efficient searches during anonymization process
reviewSchema.index({ email: 1 });
reviewSchema.index({ pendingAnonymization: 1, anonymizationDate: 1 });

export default mongoose.model('Review', reviewSchema);