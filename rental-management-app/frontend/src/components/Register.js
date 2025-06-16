import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Grid,
    Stepper,
    Step,
    StepLabel,
    FormHelperText,
    InputAdornment,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const steps = ['Account Information', 'Personal Details', 'Additional Information'];

const Register = () => {
    const location = useLocation();
    const [activeStep, setActiveStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'farmer',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        aadharNumber: '',
        // Farmer specific fields
        landArea: '',
        cropType: '',
        // Renter specific fields
        companyName: '',
        gstin: '',
        bankAccount: '',
        ifscCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const role = searchParams.get('role');
        if (role && (role === 'farmer' || role === 'renter')) {
            setFormData(prev => ({ ...prev, role }));
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const validateStep = (step) => {
        switch (step) {
            case 0:
                if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
                    setError('Please fill in all required fields');
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return false;
                }
                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters long');
                    return false;
                }
                if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
                    setError('Please enter a valid email address');
                    return false;
                }
                return true;

            case 1:
                if (!formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode || !formData.aadharNumber) {
                    setError('Please fill in all required fields');
                    return false;
                }
                if (!/^\d{10}$/.test(formData.phone)) {
                    setError('Please enter a valid 10-digit phone number');
                    return false;
                }
                if (!/^\d{6}$/.test(formData.pincode)) {
                    setError('Please enter a valid 6-digit pincode');
                    return false;
                }
                if (!/^\d{12}$/.test(formData.aadharNumber)) {
                    setError('Please enter a valid 12-digit Aadhar number');
                    return false;
                }
                return true;

            case 2:
                if (formData.role === 'farmer') {
                    if (!formData.landArea || !formData.cropType) {
                        setError('Please fill in all required fields');
                        return false;
                    }
                    if (isNaN(formData.landArea) || parseFloat(formData.landArea) <= 0) {
                        setError('Please enter a valid land area');
                        return false;
                    }
                } else {
                    if (!formData.companyName || !formData.gstin || !formData.bankAccount || !formData.ifscCode) {
                        setError('Please fill in all required fields');
                        return false;
                    }
                    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
                        setError('Please enter a valid GSTIN');
                        return false;
                    }
                    if (!/^\d{9,18}$/.test(formData.bankAccount)) {
                        setError('Please enter a valid bank account number');
                        return false;
                    }
                    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
                        setError('Please enter a valid IFSC code');
                        return false;
                    }
                }
                return true;

            default:
                return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Prepare additional information based on role
            const additionalInfo = {
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                aadharNumber: formData.aadharNumber
            };

            // Add role-specific information
            if (formData.role === 'farmer') {
                additionalInfo.landArea = parseFloat(formData.landArea);
                additionalInfo.cropType = formData.cropType;
            } else {
                additionalInfo.companyName = formData.companyName;
                additionalInfo.gstin = formData.gstin;
                additionalInfo.bankAccount = formData.bankAccount;
                additionalInfo.ifscCode = formData.ifscCode;
            }

            await register(
                formData.name,
                formData.email,
                formData.password,
                formData.role,
                additionalInfo
            );
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
            // If there's an error, stay on the current step
            if (activeStep > 0) {
                setActiveStep(activeStep - 1);
            }
        } finally {
            setLoading(false);
        }
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={!!error && error.includes('name')}
                                helperText={error && error.includes('name') ? error : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={!!error && error.includes('email')}
                                helperText={error && error.includes('email') ? error : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={!!error && error.includes('password')}
                                helperText={error && error.includes('password') ? error : ''}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={!!error && error.includes('password')}
                                helperText={error && error.includes('password') ? error : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    label="Role"
                                    disabled={loading}
                                >
                                    <MenuItem value="farmer">Farmer</MenuItem>
                                    <MenuItem value="renter">Equipment Owner</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={!!error && error.includes('phone')}
                                helperText={error && error.includes('phone') ? error : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={!!error && error.includes('address')}
                                helperText={error && error.includes('address') ? error : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={!!error && error.includes('city')}
                                helperText={error && error.includes('city') ? error : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="State"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={!!error && error.includes('state')}
                                helperText={error && error.includes('state') ? error : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={!!error && error.includes('pincode')}
                                helperText={error && error.includes('pincode') ? error : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Aadhar Number"
                                name="aadharNumber"
                                value={formData.aadharNumber}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                error={!!error && error.includes('aadhar')}
                                helperText={error && error.includes('aadhar') ? error : ''}
                            />
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Grid container spacing={2}>
                        {formData.role === 'farmer' ? (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Land Area (acres)"
                                        name="landArea"
                                        type="number"
                                        value={formData.landArea}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        error={!!error && error.includes('land')}
                                        helperText={error && error.includes('land') ? error : ''}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Crop Type</InputLabel>
                                        <Select
                                            name="cropType"
                                            value={formData.cropType}
                                            onChange={handleChange}
                                            label="Crop Type"
                                            required
                                            disabled={loading}
                                            error={!!error && error.includes('crop')}
                                        >
                                            <MenuItem value="wheat">Wheat</MenuItem>
                                            <MenuItem value="rice">Rice</MenuItem>
                                            <MenuItem value="cotton">Cotton</MenuItem>
                                            <MenuItem value="sugarcane">Sugarcane</MenuItem>
                                            <MenuItem value="vegetables">Vegetables</MenuItem>
                                            <MenuItem value="fruits">Fruits</MenuItem>
                                            <MenuItem value="other">Other</MenuItem>
                                        </Select>
                                        {error && error.includes('crop') && (
                                            <FormHelperText error>{error}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                            </>
                        ) : (
                            <>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Company Name"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        error={!!error && error.includes('company')}
                                        helperText={error && error.includes('company') ? error : ''}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="GSTIN"
                                        name="gstin"
                                        value={formData.gstin}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        error={!!error && error.includes('GSTIN')}
                                        helperText={error && error.includes('GSTIN') ? error : ''}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Bank Account Number"
                                        name="bankAccount"
                                        value={formData.bankAccount}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        error={!!error && error.includes('bank')}
                                        helperText={error && error.includes('bank') ? error : ''}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="IFSC Code"
                                        name="ifscCode"
                                        value={formData.ifscCode}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        error={!!error && error.includes('IFSC')}
                                        helperText={error && error.includes('IFSC') ? error : ''}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                );
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Info Section */}
                <Grid item xs={12} md={4}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 4, 
                            bgcolor: 'primary.light', 
                            color: 'white',
                            height: '100%',
                            position: 'sticky',
                            top: 24
                        }}
                    >
                        <Typography variant="h4" component="h1" gutterBottom>
                            Join Agri-Fasal-Mitra
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Transform Your Agricultural Journey
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 4 }}>
                            Whether you're a farmer looking for equipment or a provider wanting to rent out your machinery,
                            we're here to connect you with the right partners.
                        </Typography>
                        <List>
                            {[
                                'Simple and secure registration process',
                                'Verified user profiles for trust',
                                'Flexible rental options',
                                'Direct communication channels'
                            ].map((text, index) => (
                                <ListItem key={index} sx={{ py: 1 }}>
                                    <ListItemIcon sx={{ color: 'white' }}>
                                        <CheckCircleIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Registration Form Section */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom align="center">
                            Register
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Stepper activeStep={activeStep} sx={{ mb: 4 }} orientation={isMobile ? 'vertical' : 'horizontal'}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        <Box component="form" onSubmit={handleSubmit}>
                            {getStepContent(activeStep)}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                <Button
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    variant="outlined"
                                >
                                    Back
                                </Button>
                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Register'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleNext}
                                    >
                                        Next
                                    </Button>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body2">
                                Already have an account?{' '}
                                <Button
                                    color="primary"
                                    onClick={() => navigate('/login')}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Login here
                                </Button>
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Register;