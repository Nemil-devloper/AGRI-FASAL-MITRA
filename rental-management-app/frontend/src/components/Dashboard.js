import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Agriculture as EquipmentIcon,
    EventNote as BookingIcon,
    Payments as MoneyIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import equipmentService from '../services/equipmentService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [myEquipment, setMyEquipment] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalEquipment: 0,
        activeBookings: 0,
        completedBookings: 0,
        totalEarnings: 0,
        totalSpent: 0
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState(null);

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            if (user.role === 'farmer') {
                try {
                    // Fetch equipment owned by the farmer using the my-equipment endpoint
                    const myEquipmentList = await equipmentService.getMyEquipment();
                    setMyEquipment(Array.isArray(myEquipmentList) ? myEquipmentList : []);
                    
                    // Fetch bookings for the farmer's equipment
                    const bookings = await bookingService.getAllBookings();
                    const myEquipmentBookings = bookings.filter(b => 
                        myEquipmentList.some(e => e._id === b.equipment._id)
                    );
                    setMyBookings(myEquipmentBookings);

                    // Calculate statistics
                    setStats({
                        totalEquipment: myEquipmentList.length,
                        activeBookings: myEquipmentBookings.filter(b => b.status === 'confirmed').length,
                        completedBookings: myEquipmentBookings.filter(b => b.status === 'completed').length,
                        totalEarnings: myEquipmentBookings
                            .filter(b => b.status === 'completed')
                            .reduce((sum, b) => sum + b.totalAmount, 0),
                        totalSpent: 0
                    });
                } catch (equipmentError) {
                    console.error('Error fetching farmer equipment:', equipmentError);
                    setError('Failed to load your equipment. Please try again later.');
                }
            } else {
                // For renters, fetch their bookings
                try {
                    const bookings = await bookingService.getAllBookings();
                    const myRenterBookings = bookings.filter(b => b.renter._id === user._id);
                    setMyBookings(myRenterBookings);

                    // Calculate statistics for renters
                    setStats({
                        totalEquipment: 0,
                        activeBookings: myRenterBookings.filter(b => b.status === 'confirmed').length,
                        completedBookings: myRenterBookings.filter(b => b.status === 'completed').length,
                        totalEarnings: 0,
                        totalSpent: myRenterBookings
                            .filter(b => b.status === 'completed')
                            .reduce((sum, b) => sum + b.totalAmount, 0)
                    });
                } catch (bookingError) {
                    console.error('Error fetching renter bookings:', bookingError);
                    setError('Failed to load your bookings. Please try again later.');
                }
            }
        } catch (err) {
            console.error('Error loading dashboard:', err);
            setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [user]); // Add user as dependency since we use user.role and user._id

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            await bookingService.updateBookingStatus(bookingId, newStatus);
            
            // Refresh both bookings and equipment data
            if (user.role === 'farmer') {
                // Fetch equipment owned by the farmer
                const equipment = await equipmentService.getAllEquipment();
                const myEquipmentList = equipment.filter(e => e.owner._id === user._id);
                setMyEquipment(myEquipmentList);
                
                // Fetch bookings for the farmer's equipment
                const bookings = await bookingService.getAllBookings();
                const myEquipmentBookings = bookings.filter(b => 
                    myEquipmentList.some(e => e._id === b.equipment._id)
                );
                setMyBookings(myEquipmentBookings);

                // Update statistics
                setStats(prev => ({
                    ...prev,
                    activeBookings: myEquipmentBookings.filter(b => b.status === 'confirmed').length,
                    completedBookings: myEquipmentBookings.filter(b => b.status === 'completed').length,
                    totalEarnings: myEquipmentBookings
                        .filter(b => b.status === 'completed')
                        .reduce((sum, b) => sum + b.totalAmount, 0)
                }));

                // Trigger equipment list refresh
                window.dispatchEvent(new Event('bookingStatusChanged'));
            } else {
                // For renters, just refresh bookings
                const bookings = await bookingService.getAllBookings();
                const myRenterBookings = bookings.filter(b => b.renter._id === user._id);
                setMyBookings(myRenterBookings);

                // Update statistics for renters
                setStats(prev => ({
                    ...prev,
                    activeBookings: myRenterBookings.filter(b => b.status === 'confirmed').length,
                    completedBookings: myRenterBookings.filter(b => b.status === 'completed').length,
                    totalSpent: myRenterBookings
                        .filter(b => b.status === 'completed')
                        .reduce((sum, b) => sum + b.totalAmount, 0)
                }));

                // Trigger equipment list refresh for renters too
                window.dispatchEvent(new Event('bookingStatusChanged'));
            }
        } catch (err) {
            setError('Failed to update booking status');
            console.error('Error updating booking status:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'confirmed':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const handleDeleteClick = (equipment) => {
        setEquipmentToDelete(equipment);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            if (equipmentToDelete) {
                await equipmentService.deleteEquipment(equipmentToDelete._id);
                setDeleteDialogOpen(false);
                setEquipmentToDelete(null);
                // Refresh the equipment list
                const equipment = await equipmentService.getAllEquipment();
                const myEquipmentList = equipment.filter(e => e.owner._id === user._id);
                setMyEquipment(myEquipmentList);
            }
        } catch (err) {
            setError('Failed to delete equipment: ' + (err.message || 'Unknown error'));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setEquipmentToDelete(null);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </Container>
        );
    }

    return (
        <Container>
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user.name}!
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {user.role === 'farmer' ? 'Equipment Owner Dashboard' : 'Renter Dashboard'}
                </Typography>
                {user.role === 'farmer' && (
                    <Button
                        component={RouterLink}
                        to="/equipment/new"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                    >
                        Add New Equipment
                    </Button>
                )}
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {user.role === 'farmer' && (
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <EquipmentIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Total Equipment</Typography>
                                </Box>
                                <Typography variant="h4">{stats.totalEquipment}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <BookingIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Active Bookings</Typography>
                            </Box>
                            <Typography variant="h4">{stats.activeBookings}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Completed Bookings</Typography>
                            </Box>
                            <Typography variant="h4">{stats.completedBookings}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">
                                    {user.role === 'farmer' ? 'Total Earnings' : 'Total Spent'}
                                </Typography>
                            </Box>
                            <Typography variant="h4">
                                ${user.role === 'farmer' ? stats.totalEarnings : stats.totalSpent}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Equipment List (for farmers) */}
            {user.role === 'farmer' && (
                <Paper sx={{ p: 2, mb: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            My Equipment
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/equipment/new"
                            variant="contained"
                            color="primary"
                            startIcon={<EquipmentIcon />}
                        >
                            Add New Equipment
                        </Button>
                    </Box>
                    {myEquipment.length === 0 ? (
                        <Box textAlign="center" py={3}>
                            <Typography color="text.secondary" gutterBottom>
                                You haven't added any equipment yet
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="/equipment/new"
                                variant="outlined"
                                color="primary"
                                sx={{ mt: 1 }}
                            >
                                Add Your First Equipment
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Daily Rate</TableCell>
                                        <TableCell>Location</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {myEquipment.map((item) => (
                                        <TableRow key={item._id}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>${item.dailyRate}</TableCell>
                                            <TableCell>{item.location}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.availability ? 'Available' : 'Not Available'}
                                                    color={item.availability ? 'success' : 'error'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    <Button
                                                        component={RouterLink}
                                                        to={`/equipment/${item._id}`}
                                                        size="small"
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteClick(item)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Delete Equipment</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete {equipmentToDelete?.name}? This action cannot be undone.
                    </Typography>
                    {equipmentToDelete && !equipmentToDelete.availability && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            This equipment has active bookings. Please cancel all bookings before deleting.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error" 
                        variant="contained"
                        disabled={equipmentToDelete && !equipmentToDelete.availability}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bookings List */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    {user.role === 'farmer' ? 'Equipment Bookings' : 'My Bookings'}
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Equipment</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                                <TableCell>Total Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {myBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography color="text.secondary">No bookings found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                myBookings.map((booking) => (
                                    <TableRow key={booking._id}>
                                        <TableCell>
                                            {booking.equipment ? booking.equipment.name : 'Unknown Equipment'}
                                        </TableCell>
                                        <TableCell>
                                            {booking.renter ? booking.renter.name : 'Unknown Customer'}
                                        </TableCell>
                                        <TableCell>
                                            {booking.renter ? booking.renter.phone : 'Not provided'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(booking.startDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(booking.endDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>${booking.totalAmount}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.status}
                                                color={getStatusColor(booking.status)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {user.role === 'farmer' && booking.status === 'pending' && (
                                                <Box>
                                                    <Button
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            )}
                                            {user.role === 'renter' && booking.status === 'confirmed' && (
                                                <Button
                                                    size="small"
                                                    color="success"
                                                    onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                >
                                                    Mark Complete
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default Dashboard;