import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    IconButton,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import equipmentService from '../services/equipmentService';
import { useAuth } from '../context/AuthContext';

const AddEquipment = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        dailyRate: '',
        location: '',
        specifications: {
            brand: '',
            model: '',
            year: '',
            horsepower: '',
            fuelType: '',
            operatingHours: '',
            maintenanceHistory: '',
            lastServiceDate: null,
            nextServiceDue: null
        },
        requirements: {
            operatorLicense: true,
            operatorExperience: '',
            specialTraining: '',
            insuranceRequired: true,
            depositAmount: 0
        },
        operatingInstructions: '',
        safetyGuidelines: '',
        contactInfo: {
            phone: user?.phone || '',
            email: user?.email || '',
            preferredContactTime: '',
            emergencyContact: ''
        }
    });

    useEffect(() => {
        // Pre-fill form with user information
        if (user) {
            setFormData(prev => ({
                ...prev,
                contactInfo: {
                    ...prev.contactInfo,
                    phone: user.phone || '',
                    email: user.email || '',
                    preferredContactTime: user.preferredContactTime || '',
                    emergencyContact: user.emergencyContact || ''
                },
                location: user.location || ''
            }));
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        const newImages = files.map(file => {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return null;
            }
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed');
                return null;
            }
            return URL.createObjectURL(file);
        }).filter(Boolean);

        setImages(prev => [...prev, ...newImages]);
        setError('');
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSpecificationChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [name]: value
            }
        }));
    };

    const handleRequirementChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            requirements: {
                ...prev.requirements,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    const handleContactInfoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            contactInfo: {
                ...prev.contactInfo,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields
            if (!formData.name || !formData.description || !formData.category || 
                !formData.dailyRate || !formData.location || !formData.operatingInstructions || 
                !formData.safetyGuidelines) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            if (images.length === 0) {
                setError('Please upload at least one image');
                setLoading(false);
                return;
            }

            const submitData = new FormData();
            
            // Append basic information
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('dailyRate', formData.dailyRate);
            submitData.append('location', formData.location);
            
            // Append specifications
            submitData.append('specifications', JSON.stringify(formData.specifications));
            
            // Append requirements
            submitData.append('requirements', JSON.stringify(formData.requirements));
            
            // Append instructions and guidelines
            submitData.append('operatingInstructions', formData.operatingInstructions);
            submitData.append('safetyGuidelines', formData.safetyGuidelines);
            
            // Append contact information
            submitData.append('contactInfo', JSON.stringify(formData.contactInfo));
            
            // Append images
            for (const imageUrl of images) {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], `image-${Date.now()}.jpg`, { type: 'image/jpeg' });
                submitData.append('images', file);
            }

            await equipmentService.createEquipment(submitData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create equipment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Add New Equipment
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Basic Information</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Equipment Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    label="Category"
                                >
                                    <MenuItem value="Tractors">Tractors</MenuItem>
                                    <MenuItem value="Harvesters">Harvesters</MenuItem>
                                    <MenuItem value="Planters">Planters</MenuItem>
                                    <MenuItem value="Sprayers">Sprayers</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                type="number"
                                label="Daily Rate ($)"
                                name="dailyRate"
                                value={formData.dailyRate}
                                onChange={handleInputChange}
                                InputProps={{
                                    inputProps: { min: 0 }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        {/* Specifications */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Specifications</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Brand"
                                name="brand"
                                value={formData.specifications.brand}
                                onChange={handleSpecificationChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Model"
                                name="model"
                                value={formData.specifications.model}
                                onChange={handleSpecificationChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Year"
                                name="year"
                                value={formData.specifications.year}
                                onChange={handleSpecificationChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Horsepower"
                                name="horsepower"
                                value={formData.specifications.horsepower}
                                onChange={handleSpecificationChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Fuel Type"
                                name="fuelType"
                                value={formData.specifications.fuelType}
                                onChange={handleSpecificationChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Operating Hours"
                                name="operatingHours"
                                value={formData.specifications.operatingHours}
                                onChange={handleSpecificationChange}
                            />
                        </Grid>

                        {/* Requirements */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Requirements</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="operatorLicense"
                                        checked={formData.requirements.operatorLicense}
                                        onChange={handleRequirementChange}
                                    />
                                }
                                label="Operator License Required"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="insuranceRequired"
                                        checked={formData.requirements.insuranceRequired}
                                        onChange={handleRequirementChange}
                                    />
                                }
                                label="Insurance Required"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Operator Experience Required"
                                name="operatorExperience"
                                value={formData.requirements.operatorExperience}
                                onChange={handleRequirementChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Special Training Required"
                                name="specialTraining"
                                value={formData.requirements.specialTraining}
                                onChange={handleRequirementChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Deposit Amount ($)"
                                name="depositAmount"
                                value={formData.requirements.depositAmount}
                                onChange={handleRequirementChange}
                            />
                        </Grid>

                        {/* Contact Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Contact Information</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.contactInfo.phone}
                                onChange={handleContactInfoChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.contactInfo.email}
                                onChange={handleContactInfoChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Preferred Contact Time"
                                name="preferredContactTime"
                                value={formData.contactInfo.preferredContactTime}
                                onChange={handleContactInfoChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Emergency Contact"
                                name="emergencyContact"
                                value={formData.contactInfo.emergencyContact}
                                onChange={handleContactInfoChange}
                            />
                        </Grid>

                        {/* Instructions and Guidelines */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Instructions and Guidelines</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                multiline
                                rows={4}
                                label="Operating Instructions"
                                name="operatingInstructions"
                                value={formData.operatingInstructions}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                multiline
                                rows={4}
                                label="Safety Guidelines"
                                name="safetyGuidelines"
                                value={formData.safetyGuidelines}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        {/* Images */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Equipment Images</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Upload up to 5 images (max 5MB each)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {images.map((image, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            position: 'relative',
                                            width: 150,
                                            height: 150,
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <img
                                            src={image}
                                            alt={`Equipment ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <IconButton
                                            onClick={() => removeImage(index)}
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                bgcolor: 'rgba(255, 255, 255, 0.8)'
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}
                                {images.length < 5 && (
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        sx={{
                                            width: 150,
                                            height: 150,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                        />
                                        <AddIcon sx={{ fontSize: 40, mb: 1 }} />
                                        <Typography>Add Images</Typography>
                                    </Button>
                                )}
                            </Box>
                        </Grid>

                        {/* Submit Buttons */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/dashboard')}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    startIcon={loading && <CircularProgress size={20} />}
                                >
                                    {loading ? 'Creating...' : 'Create Equipment'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default AddEquipment; 