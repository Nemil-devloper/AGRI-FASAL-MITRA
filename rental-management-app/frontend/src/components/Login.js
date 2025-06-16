import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Container, 
    Paper, 
    TextField, 
    Button, 
    Typography, 
    Box, 
    Alert, 
    CircularProgress,
    Grid,
    useTheme,
    useMediaQuery,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={3} sx={{ minHeight: '80vh', alignItems: 'center' }}>
                {/* Info Section */}
                <Grid item xs={12} md={6}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 4, 
                            bgcolor: 'primary.light', 
                            color: 'white',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography variant="h4" component="h1" gutterBottom>
                            Welcome to Agri-Fasal-Mitra
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Your Trusted Agricultural Equipment Rental Platform
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 4 }}>
                            Join our community of farmers and equipment providers to revolutionize 
                            agricultural practices through accessible and affordable equipment rental services.
                        </Typography>
                        <List>
                            {[
                                'Access modern farming equipment at affordable rates',
                                'Connect with verified equipment providers',
                                'Streamlined booking and payment process',
                                'Enhance farm productivity with the right tools'
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

                {/* Login Form Section */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom align="center">
                            Login
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                margin="normal"
                                required
                                disabled={loading}
                                error={!!error}
                                helperText={error && error.includes('email') ? error : ''}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                margin="normal"
                                required
                                disabled={loading}
                                error={!!error}
                                helperText={error && error.includes('password') ? error : ''}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                sx={{ mt: 3 }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Login'}
                            </Button>
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Typography variant="body2">
                                    Don't have an account?{' '}
                                    <Link to="/register" style={{ textDecoration: 'none' }}>
                                        Register here
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Login;