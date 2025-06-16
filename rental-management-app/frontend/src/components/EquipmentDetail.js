import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Button,
    Box,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Rating,
    Chip,
    IconButton,
    Divider,
    Tab,
    Tabs,
    CircularProgress,
    Card,
    CardMedia,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    AttachMoney as MoneyIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Star as StarIcon,
    Share as ShareIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import equipmentService from '../services/equipmentService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import Review from './Review';
import { reviewService } from '../services/reviewService';

const EquipmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [equipment, setEquipment] = useState({
        name: '',
        description: '',
        category: '',
        dailyRate: 0,
        location: '',
        images: [],
        specifications: {
            brand: '',
            model: '',
            year: '',
            horsepower: '',
            fuelType: '',
            operatingHours: ''
        },
        requirements: {
            operatorLicense: false,
            operatorExperience: '',
            specialTraining: '',
            insuranceRequired: false,
            depositAmount: 0
        },
        operatingInstructions: '',
        safetyGuidelines: '',
        contactInfo: {
            phone: '',
            email: '',
            preferredContactTime: '',
            emergencyContact: ''
        },
        owner: {
            name: ''
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openBooking, setOpenBooking] = useState(false);
    const [bookingData, setBookingData] = useState({
        startDate: null,
        endDate: null,
        operator: {
            name: '',
            licenseNumber: '',
            experience: '',
            contactNumber: ''
        },
        delivery: {
            required: false,
            address: '',
            date: null,
            time: '',
            instructions: ''
        },
        insurance: {
            provided: false,
            policyNumber: '',
            coverageDetails: '',
            expiryDate: null
        },
        notes: {
            specialRequirements: '',
            additionalEquipment: '',
            siteConditions: ''
        }
    });
    const [bookingError, setBookingError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [activeStep, setActiveStep] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        loadEquipment();
        if (user?.role === 'farmer') {
            loadBookings();
        }
        loadReviews();
    }, [id, user]);

    const loadEquipment = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Loading equipment with ID:', id); // Debug log
            const data = await equipmentService.getEquipmentById(id);
            console.log('Loaded equipment data:', data); // Debug log
            
            if (!data) {
                setError('Equipment not found');
                return;
            }

            // Ensure all nested objects exist
            const formattedData = {
                ...data,
                specifications: data.specifications || {},
                requirements: data.requirements || {},
                contactInfo: data.contactInfo || {},
                images: data.images || [],
                owner: data.owner || {},
                reviews: data.reviews || []
            };

            setEquipment(formattedData);
            
            // Check if equipment is in user's favorites
            if (user) {
                const isFav = user.favorites?.includes(id);
                setIsFavorite(isFav);
            }
        } catch (err) {
            console.error('Error loading equipment:', err); // Debug log
            setError(err.message || 'Failed to load equipment details');
        } finally {
            setLoading(false);
        }
    };

    const loadBookings = async () => {
        try {
            setLoadingBookings(true);
            const data = await bookingService.getAllBookings();
            const equipmentBookings = data.filter(booking => booking.equipment._id === id);
            setBookings(equipmentBookings);
        } catch (err) {
            console.error('Error loading bookings:', err);
            setError('Failed to load booking history');
        } finally {
            setLoadingBookings(false);
        }
    };

    const loadReviews = async () => {
        try {
            setLoadingReviews(true);
            setReviewError('');
            const data = await reviewService.getEquipmentReviews(id);
            setReviews(data);
        } catch (err) {
            console.error('Error loading reviews:', err);
            setReviewError('Failed to load reviews');
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleBookingSubmit = async () => {
        try {
            if (!bookingData.startDate || !bookingData.endDate) {
                setBookingError('Please select both start and end dates');
                return;
            }

            if (bookingData.startDate > bookingData.endDate) {
                setBookingError('End date must be after start date');
                return;
            }

            // Calculate total amount
            const days = Math.ceil((bookingData.endDate - bookingData.startDate) / (1000 * 60 * 60 * 24));
            const totalAmount = days * equipment.dailyRate;

            // Create booking data
            const bookingDataToSubmit = {
                equipmentId: id,
                startDate: bookingData.startDate.toISOString(),
                endDate: bookingData.endDate.toISOString(),
                totalAmount: totalAmount,
                status: 'pending',
                operator: bookingData.operator,
                delivery: {
                    deliveryRequired: bookingData.delivery.required,
                    deliveryAddress: bookingData.delivery.address,
                    deliveryDate: bookingData.delivery.date,
                    deliveryTime: bookingData.delivery.time,
                    deliveryInstructions: bookingData.delivery.instructions
                },
                insurance: {
                    required: equipment?.requirements?.insuranceRequired || false,
                    provided: bookingData.insurance.provided,
                    policyNumber: bookingData.insurance.policyNumber,
                    coverageDetails: bookingData.insurance.coverageDetails,
                    expiryDate: bookingData.insurance.expiryDate
                },
                notes: bookingData.notes,
                renter: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    companyName: user.companyName
                }
            };

            console.log('Submitting booking data:', bookingDataToSubmit); // Debug log
            await bookingService.createBooking(bookingDataToSubmit);
            setOpenBooking(false);
            navigate('/dashboard');
        } catch (err) {
            setBookingError(err.response?.data?.message || err.message || 'Failed to create booking');
            console.error('Error creating booking:', err);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleFavorite = async () => {
        try {
            if (isFavorite) {
                await equipmentService.removeFromFavorites(id);
            } else {
                await equipmentService.addToFavorites(id);
            }
            setIsFavorite(!isFavorite);
        } catch (err) {
            setError('Failed to update favorites');
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/equipment/${id}`;
        setShareUrl(url);
        setShowShareDialog(true);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/600x400';
        if (imagePath.startsWith('http')) return imagePath;
        return `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${imagePath}`;
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await bookingService.updateBookingStatus(bookingId, newStatus);
            await loadBookings(); // Reload bookings after status update
        } catch (err) {
            console.error('Error updating booking status:', err);
            setError('Failed to update booking status');
        }
    };

    const handleReviewSubmitted = () => {
        loadReviews();
        loadEquipment(); // Reload equipment to update average rating
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !equipment) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <Typography color="error">{error || 'Equipment not found'}</Typography>
            </Box>
        );
    }

    return (
        <Container>
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Grid container spacing={4}>
                    {/* Image Gallery */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ position: 'relative', width: '100%', height: 400 }}>
                            <img
                                src={getImageUrl(equipment?.images?.[0])}
                                alt={equipment?.name || 'Equipment'}
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/600x400';
                                }}
                            />
                            {equipment?.images?.length > 1 && (
                                <Box sx={{ 
                                    position: 'absolute', 
                                    bottom: 16, 
                                    left: '50%', 
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: 1,
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    p: 1,
                                    borderRadius: '20px'
                                }}>
                                    {equipment.images.map((image, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: 'white',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    {/* Basic Information */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h4" gutterBottom>
                                {equipment?.name || 'Loading...'}
                            </Typography>
                            <Box>
                                <IconButton onClick={handleFavorite}>
                                    {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                </IconButton>
                                <IconButton onClick={handleShare}>
                                    <ShareIcon />
                                </IconButton>
                            </Box>
                        </Box>
                        <Typography variant="h5" color="primary" gutterBottom>
                            ${equipment?.dailyRate || 0}/day
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {equipment?.description || 'No description available'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Chip 
                                icon={<LocationIcon />} 
                                label={equipment?.location || 'Location not specified'}
                                variant="outlined"
                            />
                            <Chip 
                                label={equipment?.category || 'Category not specified'}
                                variant="outlined"
                            />
                            <Chip
                                label={equipment?.availability ? 'Available' : 'Not Available'}
                                color={equipment?.availability ? 'success' : 'error'}
                                variant="outlined"
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={equipment?.rating || 0} readOnly />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({equipment?.reviews?.length || 0} reviews)
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Owner: {equipment?.owner?.name || 'Owner not specified'}
                        </Typography>
                        {user && user.role === 'renter' && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setOpenBooking(true)}
                                sx={{ mt: 2 }}
                            >
                                Book Now
                            </Button>
                        )}
                    </Grid>

                    {/* Specifications */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Specifications</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2">Brand</Typography>
                                <Typography>{equipment?.specifications?.brand || 'Not specified'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2">Model</Typography>
                                <Typography>{equipment?.specifications?.model || 'Not specified'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2">Year</Typography>
                                <Typography>{equipment?.specifications?.year || 'Not specified'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2">Horsepower</Typography>
                                <Typography>{equipment?.specifications?.horsepower || 'Not specified'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2">Fuel Type</Typography>
                                <Typography>{equipment?.specifications?.fuelType || 'Not specified'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2">Operating Hours</Typography>
                                <Typography>{equipment?.specifications?.operatingHours || 'Not specified'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2">Maintenance History</Typography>
                                <Typography>{equipment?.specifications?.maintenanceHistory || 'Not specified'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2">Last Service Date</Typography>
                                <Typography>
                                    {equipment?.specifications?.lastServiceDate 
                                        ? new Date(equipment.specifications.lastServiceDate).toLocaleDateString()
                                        : 'Not specified'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2">Next Service Due</Typography>
                                <Typography>
                                    {equipment?.specifications?.nextServiceDue 
                                        ? new Date(equipment.specifications.nextServiceDue).toLocaleDateString()
                                        : 'Not specified'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Requirements */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Requirements</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Operator Requirements</Typography>
                                <Box component="ul" sx={{ pl: 2 }}>
                                    {equipment?.requirements?.operatorLicense && (
                                        <li>Operator License Required</li>
                                    )}
                                    {equipment?.requirements?.operatorExperience && (
                                        <li>Experience: {equipment.requirements.operatorExperience}</li>
                                    )}
                                    {equipment?.requirements?.specialTraining && (
                                        <li>Special Training: {equipment.requirements.specialTraining}</li>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Insurance & Deposit</Typography>
                                <Box component="ul" sx={{ pl: 2 }}>
                                    {equipment?.requirements?.insuranceRequired && (
                                        <li>Insurance Required</li>
                                    )}
                                    {equipment?.requirements?.depositAmount > 0 && (
                                        <li>Deposit Amount: ${equipment.requirements.depositAmount}</li>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Operating Instructions & Safety Guidelines */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Operating Instructions</Typography>
                        <Typography paragraph>{equipment?.operatingInstructions || 'No operating instructions available'}</Typography>
                        
                        <Typography variant="h6" gutterBottom>Safety Guidelines</Typography>
                        <Typography paragraph>{equipment?.safetyGuidelines || 'No safety guidelines available'}</Typography>
                    </Grid>

                    {/* Contact Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Contact Information</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Primary Contact</Typography>
                                <Typography>Phone: {equipment?.contactInfo?.phone || 'Not specified'}</Typography>
                                <Typography>Email: {equipment?.contactInfo?.email || 'Not specified'}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2">Additional Information</Typography>
                                <Typography>Preferred Contact Time: {equipment?.contactInfo?.preferredContactTime || 'Not specified'}</Typography>
                                <Typography>Emergency Contact: {equipment?.contactInfo?.emergencyContact || 'Not specified'}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Reviews */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Reviews</Typography>
                        {loadingReviews ? (
                            <Box display="flex" justifyContent="center" py={2}>
                                <CircularProgress />
                            </Box>
                        ) : reviewError ? (
                            <Alert severity="error">{reviewError}</Alert>
                        ) : reviews.length > 0 ? (
                            reviews.map((review) => (
                                <Paper key={review._id} sx={{ p: 2, mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Rating value={review.rating} readOnly size="small" />
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                            by {review.user.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                            • {new Date(review.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2">{review.comment}</Typography>
                                </Paper>
                            ))
                        ) : (
                            <Typography color="text.secondary">No reviews yet</Typography>
                        )}

                        {/* Review Form */}
                        {user && user.role === 'renter' && (
                            <>
                                {bookings.length > 0 && bookings.some(b => b.status === 'completed') ? (
                                    <Review
                                        equipmentId={id}
                                        bookingId={bookings.find(b => b.status === 'completed')?._id}
                                        onReviewSubmitted={handleReviewSubmitted}
                                    />
                                ) : (
                                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                                        You can only review equipment after completing a booking.
                                    </Typography>
                                )}
                            </>
                        )}
                    </Grid>

                    {/* Add this section after the Reviews section */}
                    {user?.role === 'farmer' && (
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Booking History</Typography>
                            {loadingBookings ? (
                                <Box display="flex" justifyContent="center" py={2}>
                                    <CircularProgress />
                                </Box>
                            ) : bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <Paper key={booking._id} sx={{ p: 2, mb: 2 }}>
                                        <Grid container spacing={2}>
                                            {/* Renter Information */}
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle1" gutterBottom>Renter Information</Typography>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">Name</Typography>
                                                    <Typography>{booking.renter.name}</Typography>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">Email</Typography>
                                                    <Typography>{booking.renter.email}</Typography>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                                                    <Typography>{booking.renter.phone || 'Not provided'}</Typography>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">Address</Typography>
                                                    <Typography>{booking.renter.address || 'Not provided'}</Typography>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">Company/Farm Name</Typography>
                                                    <Typography>{booking.renter.companyName || 'Not provided'}</Typography>
                                                </Box>
                                            </Grid>

                                            {/* Booking Details */}
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle1" gutterBottom>Booking Details</Typography>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">Status</Typography>
                                                    <Chip 
                                                        label={booking.status} 
                                                        color={
                                                            booking.status === 'confirmed' ? 'success' : 
                                                            booking.status === 'pending' ? 'warning' : 
                                                            'error'
                                                        } 
                                                        size="small" 
                                                    />
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">Start Date</Typography>
                                                    <Typography>{new Date(booking.startDate).toLocaleDateString()}</Typography>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">End Date</Typography>
                                                    <Typography>{new Date(booking.endDate).toLocaleDateString()}</Typography>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                                                    <Typography>${booking.totalAmount}</Typography>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                                                    <Chip 
                                                        label={booking.paymentStatus || 'Pending'} 
                                                        color={booking.paymentStatus === 'paid' ? 'success' : 'warning'} 
                                                        size="small" 
                                                    />
                                                </Box>
                                            </Grid>

                                            {/* Operator Information */}
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" gutterBottom>Operator Information</Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={3}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="body2" color="text.secondary">Name</Typography>
                                                            <Typography>{booking.operator?.name || 'Not provided'}</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} md={3}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="body2" color="text.secondary">License Number</Typography>
                                                            <Typography>{booking.operator?.licenseNumber || 'Not provided'}</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} md={3}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="body2" color="text.secondary">Experience</Typography>
                                                            <Typography>{booking.operator?.experience || 'Not provided'}</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} md={3}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="body2" color="text.secondary">Contact</Typography>
                                                            <Typography>{booking.operator?.contactNumber || 'Not provided'}</Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            {/* Delivery Information */}
                                            {booking.delivery?.deliveryRequired && (
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1" gutterBottom>Delivery Information</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} md={6}>
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="body2" color="text.secondary">Address</Typography>
                                                                <Typography>{booking.delivery.deliveryAddress}</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} md={3}>
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="body2" color="text.secondary">Date</Typography>
                                                                <Typography>{new Date(booking.delivery.deliveryDate).toLocaleDateString()}</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} md={3}>
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="body2" color="text.secondary">Time</Typography>
                                                                <Typography>{booking.delivery.deliveryTime}</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="body2" color="text.secondary">Instructions</Typography>
                                                                <Typography>{booking.delivery.deliveryInstructions}</Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            )}

                                            {/* Insurance Information */}
                                            {booking.insurance?.required && (
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1" gutterBottom>Insurance Information</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} md={4}>
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="body2" color="text.secondary">Policy Number</Typography>
                                                                <Typography>{booking.insurance.policyNumber || 'Not provided'}</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} md={4}>
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="body2" color="text.secondary">Coverage Details</Typography>
                                                                <Typography>{booking.insurance.coverageDetails || 'Not provided'}</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} md={4}>
                                                            <Box sx={{ mb: 2 }}>
                                                                <Typography variant="body2" color="text.secondary">Expiry Date</Typography>
                                                                <Typography>
                                                                    {booking.insurance.expiryDate 
                                                                        ? new Date(booking.insurance.expiryDate).toLocaleDateString() 
                                                                        : 'Not provided'}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            )}

                                            {/* Additional Information */}
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" gutterBottom>Additional Information</Typography>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={4}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="body2" color="text.secondary">Special Requirements</Typography>
                                                            <Typography>{booking.notes?.specialRequirements || 'Not provided'}</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="body2" color="text.secondary">Additional Equipment Needed</Typography>
                                                            <Typography>{booking.notes?.additionalEquipment || 'Not provided'}</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="body2" color="text.secondary">Site Conditions</Typography>
                                                            <Typography>{booking.notes?.siteConditions || 'Not provided'}</Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            {/* Action Buttons */}
                                            <Grid item xs={12}>
                                                <Box display="flex" gap={2} justifyContent="flex-end">
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                                            >
                                                                Confirm Booking
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                            >
                                                                Cancel Booking
                                                            </Button>
                                                        </>
                                                    )}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                ))
                            ) : (
                                <Typography color="text.secondary">No bookings found for this equipment</Typography>
                            )}
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {/* Booking Dialog */}
            <Dialog open={openBooking} onClose={() => setOpenBooking(false)} maxWidth="md" fullWidth>
                <DialogTitle>Book Equipment</DialogTitle>
                <DialogContent>
                    {bookingError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {bookingError}
                        </Alert>
                    )}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>Basic Information</Typography>
                            <DatePicker
                                label="Start Date"
                                value={bookingData.startDate}
                                onChange={(newValue) => {
                                    setBookingData({ ...bookingData, startDate: newValue });
                                }}
                                minDate={new Date()}
                                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                            />
                            <DatePicker
                                label="End Date"
                                value={bookingData.endDate}
                                onChange={(newValue) => {
                                    setBookingData({ ...bookingData, endDate: newValue });
                                }}
                                minDate={bookingData.startDate || new Date()}
                                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                            />

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Operator Information</Typography>
                            <TextField
                                label="Operator Name"
                                fullWidth
                                value={bookingData.operator.name}
                                onChange={(e) => setBookingData({
                                    ...bookingData,
                                    operator: { ...bookingData.operator, name: e.target.value }
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="License Number"
                                fullWidth
                                value={bookingData.operator.licenseNumber}
                                onChange={(e) => setBookingData({
                                    ...bookingData,
                                    operator: { ...bookingData.operator, licenseNumber: e.target.value }
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Experience"
                                fullWidth
                                multiline
                                rows={2}
                                value={bookingData.operator.experience}
                                onChange={(e) => setBookingData({
                                    ...bookingData,
                                    operator: { ...bookingData.operator, experience: e.target.value }
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Contact Number"
                                fullWidth
                                value={bookingData.operator.contactNumber}
                                onChange={(e) => setBookingData({
                                    ...bookingData,
                                    operator: { ...bookingData.operator, contactNumber: e.target.value }
                                })}
                                sx={{ mb: 2 }}
                            />

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Delivery Information</Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={bookingData.delivery.required}
                                        onChange={(e) => setBookingData({
                                            ...bookingData,
                                            delivery: { ...bookingData.delivery, required: e.target.checked }
                                        })}
                                    />
                                }
                                label="Delivery Required"
                                sx={{ mb: 2 }}
                            />
                            {bookingData.delivery.required && (
                                <>
                                    <TextField
                                        label="Delivery Address"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={bookingData.delivery.address}
                                        onChange={(e) => setBookingData({
                                            ...bookingData,
                                            delivery: { ...bookingData.delivery, address: e.target.value }
                                        })}
                                        sx={{ mb: 2 }}
                                    />
                                    <DatePicker
                                        label="Delivery Date"
                                        value={bookingData.delivery.date}
                                        onChange={(newValue) => {
                                            setBookingData({
                                                ...bookingData,
                                                delivery: { ...bookingData.delivery, date: newValue }
                                            });
                                        }}
                                        renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                                    />
                                    <TextField
                                        label="Delivery Time"
                                        fullWidth
                                        value={bookingData.delivery.time}
                                        onChange={(e) => setBookingData({
                                            ...bookingData,
                                            delivery: { ...bookingData.delivery, time: e.target.value }
                                        })}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        label="Delivery Instructions"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={bookingData.delivery.instructions}
                                        onChange={(e) => setBookingData({
                                            ...bookingData,
                                            delivery: { ...bookingData.delivery, instructions: e.target.value }
                                        })}
                                        sx={{ mb: 2 }}
                                    />
                                </>
                            )}

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Insurance Information</Typography>
                            {equipment?.requirements?.insuranceRequired && (
                                <>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={bookingData.insurance.provided}
                                                onChange={(e) => setBookingData({
                                                    ...bookingData,
                                                    insurance: { ...bookingData.insurance, provided: e.target.checked }
                                                })}
                                            />
                                        }
                                        label="Insurance Required"
                                        sx={{ mb: 2 }}
                                    />
                                    {bookingData.insurance.provided && (
                                        <>
                                            <TextField
                                                label="Policy Number"
                                                fullWidth
                                                value={bookingData.insurance.policyNumber}
                                                onChange={(e) => setBookingData({
                                                    ...bookingData,
                                                    insurance: { ...bookingData.insurance, policyNumber: e.target.value }
                                                })}
                                                sx={{ mb: 2 }}
                                            />
                                            <TextField
                                                label="Coverage Details"
                                                fullWidth
                                                multiline
                                                rows={2}
                                                value={bookingData.insurance.coverageDetails}
                                                onChange={(e) => setBookingData({
                                                    ...bookingData,
                                                    insurance: { ...bookingData.insurance, coverageDetails: e.target.value }
                                                })}
                                                sx={{ mb: 2 }}
                                            />
                                            <DatePicker
                                                label="Insurance Expiry Date"
                                                value={bookingData.insurance.expiryDate}
                                                onChange={(newValue) => {
                                                    setBookingData({
                                                        ...bookingData,
                                                        insurance: { ...bookingData.insurance, expiryDate: newValue }
                                                    });
                                                }}
                                                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Additional Information</Typography>
                            <TextField
                                label="Special Requirements"
                                fullWidth
                                multiline
                                rows={2}
                                value={bookingData.notes.specialRequirements}
                                onChange={(e) => setBookingData({
                                    ...bookingData,
                                    notes: { ...bookingData.notes, specialRequirements: e.target.value }
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Additional Equipment Needed"
                                fullWidth
                                multiline
                                rows={2}
                                value={bookingData.notes.additionalEquipment}
                                onChange={(e) => setBookingData({
                                    ...bookingData,
                                    notes: { ...bookingData.notes, additionalEquipment: e.target.value }
                                })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Site Conditions"
                                fullWidth
                                multiline
                                rows={2}
                                value={bookingData.notes.siteConditions}
                                onChange={(e) => setBookingData({
                                    ...bookingData,
                                    notes: { ...bookingData.notes, siteConditions: e.target.value }
                                })}
                                sx={{ mb: 2 }}
                            />

                            {bookingData.startDate && bookingData.endDate && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1">
                                        Total Amount: ${Math.ceil((bookingData.endDate - bookingData.startDate) / (1000 * 60 * 60 * 24)) * equipment.dailyRate}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBooking(false)}>Cancel</Button>
                    <Button 
                        onClick={handleBookingSubmit} 
                        variant="contained" 
                        color="primary"
                        disabled={!bookingData.startDate || !bookingData.endDate}
                    >
                        Confirm Booking
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EquipmentDetail; 