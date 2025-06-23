const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const auth = require('../middleware/auth');

// Get all bookings for a user
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching bookings for user:', req.user._id, 'with role:', req.user.role);
        
        // First, get all equipment owned by the user if they are a farmer
        let query = {};
        if (req.user.role === 'farmer') {
            const userEquipment = await Equipment.find({ owner: req.user._id });
            console.log('Found equipment for farmer:', userEquipment);
            
            const equipmentIds = userEquipment.map(e => e._id);
            query = { equipment: { $in: equipmentIds } };
        } else {
            query = { renter: req.user._id };
        }

        console.log('Query for bookings:', query);

        const bookings = await Booking.find(query)
            .populate({
                path: 'equipment',
                populate: {
                    path: 'owner',
                    select: 'name email phone'
                }
            })
            .populate('renter', 'name email phone address')
            .sort({ createdAt: -1 });

        console.log('Found bookings count:', bookings.length);
        console.log('Bookings data:', JSON.stringify(bookings, null, 2));

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error while fetching bookings' });
    }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate({
                path: 'equipment',
                populate: {
                    path: 'owner',
                    select: 'name email phone'
                }
            })
            .populate('renter', 'name email phone address');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is authorized to view this booking
        if (booking.renter._id.toString() !== req.user._id.toString() &&
            booking.equipment.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new booking
router.post('/',
    auth,
    [
        body('equipmentId').isMongoId().withMessage('Invalid equipment ID'),
        body('startDate').isISO8601().withMessage('Invalid start date'),
        body('endDate').isISO8601().withMessage('Invalid end date')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { 
                equipmentId, 
                startDate, 
                endDate,
                operator,
                delivery,
                insurance,
                notes
            } = req.body;

            // Check if equipment exists and is available
            const equipment = await Equipment.findById(equipmentId);
            if (!equipment) {
                return res.status(404).json({ message: 'Equipment not found' });
            }

            if (!equipment.availability) {
                return res.status(400).json({ message: 'Equipment is not available' });
            }

            // Check for overlapping bookings
            const overlappingBooking = await Booking.findOne({
                equipment: equipmentId,
                status: { $ne: 'cancelled' },
                $or: [
                    {
                        startDate: { $lte: new Date(endDate) },
                        endDate: { $gte: new Date(startDate) }
                    }
                ]
            });

            if (overlappingBooking) {
                return res.status(400).json({ message: 'Equipment is already booked for these dates' });
            }

            // Calculate total amount
            const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
            const totalAmount = days * equipment.dailyRate;

            // Create booking with all information
            const booking = new Booking({
                equipment: equipmentId,
                renter: req.user._id,
                startDate,
                endDate,
                totalAmount,
                status: 'pending',
                operator: operator || {},
                delivery: delivery || {},
                insurance: insurance || {},
                notes: notes || {}
            });

            await booking.save();

            // Populate the response with equipment and renter details
            const populatedBooking = await Booking.findById(booking._id)
                .populate({
                    path: 'equipment',
                    populate: {
                        path: 'owner',
                        select: 'name email'
                    }
                })
                .populate('renter', 'name email phone address companyName');

            console.log('Created booking:', populatedBooking); // Debug log
            res.status(201).json(populatedBooking);
        } catch (error) {
            console.error('Error creating booking:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Update booking status (owner or renter)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id)
            .populate('equipment');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is authorized to update this booking
        if (booking.renter.toString() !== req.user._id.toString() &&
            booking.equipment.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        // Update booking status
        booking.status = status;
        await booking.save();

        // Update equipment availability based on booking status
        if (status === 'completed') {
            // When booking is completed, make equipment available again
            await Equipment.findByIdAndUpdate(booking.equipment._id, {
                availability: true
            });
        } else if (status === 'confirmed' || status === 'pending') {
            // When booking is confirmed or pending, make equipment unavailable
            await Equipment.findByIdAndUpdate(booking.equipment._id, {
                availability: false
            });
        } else if (status === 'cancelled') {
            // When booking is cancelled, make equipment available again
            await Equipment.findByIdAndUpdate(booking.equipment._id, {
                availability: true
            });
        }

        // Get updated booking with populated fields
        const updatedBooking = await Booking.findById(booking._id)
            .populate({
                path: 'equipment',
                populate: {
                    path: 'owner',
                    select: 'name email phone'
                }
            })
            .populate('renter', 'name email phone address');

        res.json(updatedBooking);
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 