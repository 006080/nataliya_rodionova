// routes/reviewRoutes.js

// const express = require('express');
// const router = express.Router();
// const Review = require('../models/Review');

// // POST route to submit a review
// router.post('/submit', async (req, res) => {
//     try {
//         const { rating, message, image } = req.body;

//         // Validate the request body
//         if (!rating || !message) {
//             return res.status(400).json({ error: 'Rating and message are required.' });
//         }

//         // Ensure the rating is within a valid range (1-5)
//         if (rating < 1 || rating > 5) {
//             return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
//         }

//         // Create a new review document
//         const newReview = new Review({ rating, message, image });

//         // Save the review to the database
//         const savedReview = await newReview.save();

//         res.status(201).json({ message: 'Review submitted successfully!', data: savedReview });
//     } catch (error) {
//         console.error('Error submitting review:', error);
//         res.status(500).json({ error: 'Failed to submit review. Please try again later.' });
//     }
// });

// // GET route to fetch all reviews
// router.get('/all', async (req, res) => {
//     try {
//         const reviews = await Review.find().sort({ createdAt: -1 }); // Sort by most recent
//         res.status(200).json({ message: 'Reviews fetched successfully!', data: reviews });
//     } catch (error) {
//         console.error('Error fetching reviews:', error);
//         res.status(500).json({ error: 'Failed to fetch reviews. Please try again later.' });
//     }
// });

// // GET route to fetch a single review by ID (optional)
// router.get('/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const review = await Review.findById(id);

//         if (!review) {
//             return res.status(404).json({ error: 'Review not found.' });
//         }

//         res.status(200).json({ message: 'Review fetched successfully!', data: review });
//     } catch (error) {
//         console.error('Error fetching review:', error);
//         res.status(500).json({ error: 'Failed to fetch review. Please try again later.' });
//     }
// });

// // DELETE route to delete a review by ID (optional)
// router.delete('/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const deletedReview = await Review.findByIdAndDelete(id);

//         if (!deletedReview) {
//             return res.status(404).json({ error: 'Review not found.' });
//         }

//         res.status(200).json({ message: 'Review deleted successfully!', data: deletedReview });
//     } catch (error) {
//         console.error('Error deleting review:', error);
//         res.status(500).json({ error: 'Failed to delete review. Please try again later.' });
//     }
// });

// // PUT route to update a review by ID (optional)
// router.put('/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { rating, message, image } = req.body;

//         // Validate the request body
//         if (!rating || !message) {
//             return res.status(400).json({ error: 'Rating and message are required.' });
//         }

//         const updatedReview = await Review.findByIdAndUpdate(
//             id,
//             { rating, message, image },
//             { new: true } // Return the updated document
//         );

//         if (!updatedReview) {
//             return res.status(404).json({ error: 'Review not found.' });
//         }

//         res.status(200).json({ message: 'Review updated successfully!', data: updatedReview });
//     } catch (error) {
//         console.error('Error updating review:', error);
//         res.status(500).json({ error: 'Failed to update review. Please try again later.' });
//     }
// });

// module.exports = router;
