import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Chip,
    CircularProgress,
    Alert,
    Pagination,
    Rating,
    IconButton,
    InputAdornment,
    CardActions
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    LocationOn as LocationIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import equipmentService from '../services/equipmentService';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 12;

const EquipmentList = () => {
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [location, setLocation] = useState('');
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const { user } = useAuth();
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                setLoading(true);
                const data = await equipmentService.getAllEquipment();
                // Filter out unavailable equipment unless explicitly requested
                const filteredData = showAll ? data : data.filter(item => item.availability);
                setEquipment(filteredData);
            } catch (err) {
                setError('Failed to load equipment');
                console.error('Error loading equipment:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, [showAll]);

    // Add a function to refresh equipment list
    const refreshEquipmentList = async () => {
        try {
            setLoading(true);
            const data = await equipmentService.getAllEquipment();
            const filteredData = showAll ? data : data.filter(item => item.availability);
            setEquipment(filteredData);
        } catch (err) {
            setError('Failed to refresh equipment list');
            console.error('Error refreshing equipment:', err);
        } finally {
            setLoading(false);
        }
    };

    // Add event listener for booking status changes
    useEffect(() => {
        const handleBookingStatusChange = () => {
            refreshEquipmentList();
        };

        window.addEventListener('bookingStatusChanged', handleBookingStatusChange);
        return () => {
            window.removeEventListener('bookingStatusChanged', handleBookingStatusChange);
        };
    }, [showAll]);

    const handleViewDetails = (equipmentId) => {
        navigate(`/equipment/${equipmentId}`);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const handlePriceRangeChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const handleLocationChange = (e) => {
        setLocation(e.target.value);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = searchTerm === '' || 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === '' || item.category === category;
        const matchesPrice = item.dailyRate >= priceRange[0] && item.dailyRate <= priceRange[1];
        const matchesLocation = location === '' || 
            item.location.toLowerCase().includes(location.toLowerCase());
        return matchesSearch && matchesCategory && matchesPrice && matchesLocation;
    });

    const paginatedEquipment = filteredEquipment.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const totalPages = Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/300x200';
        if (imagePath.startsWith('http')) return imagePath;
        return `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${imagePath}`;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4, mt: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Search Equipment"
                            value={searchTerm}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box display="flex" gap={2}>
                            <Button
                                variant={showFilters ? "contained" : "outlined"}
                                startIcon={<FilterIcon />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                Filters
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {showFilters && (
                    <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={category}
                                        onChange={handleCategoryChange}
                                        label="Category"
                                    >
                                        <MenuItem value="">All Categories</MenuItem>
                                        <MenuItem value="Tractors">Tractors</MenuItem>
                                        <MenuItem value="Harvesters">Harvesters</MenuItem>
                                        <MenuItem value="Planters">Planters</MenuItem>
                                        <MenuItem value="Sprayers">Sprayers</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    value={location}
                                    onChange={handleLocationChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography gutterBottom>Price Range</Typography>
                                <Slider
                                    value={priceRange}
                                    onChange={handlePriceRangeChange}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={1000}
                                    step={10}
                                    marks
                                    valueLabelFormat={(value) => `$${value}`}
                                />
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="caption">${priceRange[0]}</Typography>
                                    <Typography variant="caption">${priceRange[1]}</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {paginatedEquipment.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={getImageUrl(item.images[0])}
                                alt={item.name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/300x200';
                                }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    {item.name}
                                </Typography>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <Rating value={item.rating || 0} readOnly size="small" />
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                        ({item.rating || 0})
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {item.description.substring(0, 100)}...
                                </Typography>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" color="primary">
                                        ${item.dailyRate}/day
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {item.location}
                                    </Typography>
                                </Box>
                                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                                    <Chip label={item.category} size="small" />
                                    <Chip
                                        label={item.availability ? 'Available' : 'Not Available'}
                                        color={item.availability ? 'success' : 'error'}
                                        size="small"
                                    />
                                </Box>
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={() => handleViewDetails(item._id)}
                                >
                                    View Details
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {filteredEquipment.length > 0 && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                    />
                </Box>
            )}

            {filteredEquipment.length === 0 && !loading && (
                <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                        No equipment found matching your criteria
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default EquipmentList; 