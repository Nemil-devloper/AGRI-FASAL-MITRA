const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Get all reviews for an equipment
router.get('/equipment/:equipmentId', async (req, res) => {
    try {
        const reviews = await Review.find({ equipment: req.params.equipmentId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new review
router.post('/',
    auth,
    [
        body('equipmentId').isMongoId().withMessage('Invalid equipment ID'),
        body('bookingId').isMongoId().withMessage('Invalid booking ID'),
        body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('comment').notEmpty().withMessage('Comment is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { equipmentId, bookingId, rating, comment } = req.body;

            // Check if review already exists for this booking
            const existingReview = await Review.findOne({ booking: bookingId });
            if (existingReview) {
                return res.status(400).json({ message: 'Review already exists for this booking' });
            }

            // Check if the booking exists and belongs to the user
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            if (booking.renter.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to review this booking' });
            }

            // Check if the booking is completed
            if (booking.status !== 'completed') {
                return res.status(400).json({ message: 'Can only review completed bookings' });
            }

            const review = new Review({
                equipment: equipmentId,
                user: req.user._id,
                booking: bookingId,
                rating,
                comment
            });

            const savedReview = await review.save();

            // Update equipment average rating
            const equipment = await Equipment.findById(equipmentId);
            const reviews = await Review.find({ equipment: equipmentId });
            const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
            equipment.rating = averageRating;
            await equipment.save();

            // Populate the response with user details
            const populatedReview = await Review.findById(savedReview._id)
                .populate('user', 'name');

            res.status(201).json(populatedReview);
        } catch (error) {
            console.error('Error creating review:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Update a review
router.put('/:id',
    auth,
    [
        body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('comment').notEmpty().withMessage('Comment is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const review = await Review.findById(req.params.id);
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            // Check if user owns this review
            if (review.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this review' });
            }

            const { rating, comment } = req.body;
            review.rating = rating;
            review.comment = comment;
            await review.save();

            // Update equipment average rating
            const equipment = await Equipment.findById(review.equipment);
            const reviews = await Review.find({ equipment: review.equipment });
            const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
            equipment.rating = averageRating;
            await equipment.save();

            // Populate the response with user details
            const updatedReview = await Review.findById(review._id)
                .populate('user', 'name');

            res.json(updatedReview);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Delete a review
router.delete('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns this review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await review.remove();

        // Update equipment average rating
        const equipment = await Equipment.findById(review.equipment);
        const reviews = await Review.find({ equipment: review.equipment });
        const averageRating = reviews.length > 0
            ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
            : 0;
        equipment.rating = averageRating;
        await equipment.save();

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 