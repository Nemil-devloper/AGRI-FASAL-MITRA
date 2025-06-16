import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Box,
    Avatar,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { equipmentService } from '../services/equipmentService';
import { bookingService } from '../services/bookingService';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [openEdit, setOpenEdit] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        email: ''
    });
    const [stats, setStats] = useState({
        totalEquipment: 0,
        activeBookings: 0,
        completedBookings: 0,
        totalEarnings: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUserStats();
    }, [user]);

    const loadUserStats = async () => {
        try {
            if (user.role === 'farmer') {
                const equipment = await equipmentService.getAllEquipment();
                const myEquipment = equipment.filter(e => e.owner._id === user.id);
                setStats(prev => ({ ...prev, totalEquipment: myEquipment.length }));
            }

            const bookings = await bookingService.getAllBookings();
            const myBookings = bookings.filter(b => 
                b.renter._id === user.id || b.equipment.owner._id === user.id
            );

            setStats(prev => ({
                ...prev,
                activeBookings: myBookings.filter(b => b.status === 'confirmed').length,
                completedBookings: myBookings.filter(b => b.status === 'completed').length,
                totalEarnings: user.role === 'farmer' 
                    ? myBookings.filter(b => b.status === 'completed')
                        .reduce((sum, b) => sum + b.totalAmount, 0)
                    : 0
            }));
        } catch (err) {
            setError('Failed to load user statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfile = () => {
        setEditData({
            name: user.name,
            email: user.email
        });
        setOpenEdit(true);
    };

    const handleUpdateProfile = async () => {
        try {
            await updateProfile(editData);
            setOpenEdit(false);
            loadUserStats();
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    if (loading) {
        return <Typography>Loading profile...</Typography>;
    }

    return (
        <Container>
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Avatar
                                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                                src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                            />
                            <Typography variant="h5" gutterBottom>
                                {user.name}
                            </Typography>
                            <Chip 
                                label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                color={user.role === 'farmer' ? 'primary' : 'secondary'}
                                sx={{ mb: 2 }}
                            />
                            <Button
                                variant="outlined"
                                onClick={handleEditProfile}
                                sx={{ mb: 2 }}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                            Profile Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Email
                                </Typography>
                                <Typography variant="body1">
                                    {user.email}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Member Since
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Statistics
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                {user.role === 'farmer' && (
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="h4" color="primary">
                                                {stats.totalEquipment}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Equipment
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h4" color="primary">
                                            {stats.activeBookings}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Active Bookings
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h4" color="primary">
                                            {stats.completedBookings}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Completed Bookings
                                        </Typography>
                                    </Paper>
                                </Grid>
                                {user.role === 'farmer' && (
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="h4" color="primary">
                                                ${stats.totalEarnings}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Earnings
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Name"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button onClick={handleUpdateProfile} variant="contained" color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Profile; 