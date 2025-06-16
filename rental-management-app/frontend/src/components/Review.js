import React, { useState } from 'react';
import {
    Box,
    Typography,
    Rating,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { reviewService } from '../services/reviewService';

const Review = ({ equipmentId, bookingId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating || !comment) {
            setError('Please provide both a rating and a comment');
            return;
        }

        if (!bookingId) {
            setError('No completed booking found to review');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await reviewService.createReview({
                equipmentId,
                bookingId,
                rating,
                comment
            });
            setSuccess(true);
            setRating(0);
            setComment('');
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Write a Review
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Review submitted successfully!
                </Alert>
            )}
            <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Rating</Typography>
                    <Rating
                        value={rating}
                        onChange={(event, newValue) => {
                            setRating(newValue);
                        }}
                        precision={0.5}
                    />
                </Box>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Your Review"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !rating || !comment || !bookingId}
                >
                    {loading ? <CircularProgress size={24} /> : 'Submit Review'}
                </Button>
            </form>
        </Paper>
    );
};

export default Review; 