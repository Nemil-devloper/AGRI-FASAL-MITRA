const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const auth = require('../middleware/auth');

// Get all bookings (for farmers to see their equipment bookings)
router.get('/', auth, async (req, res) => {
    try {
        let bookings;
        if (req.user.role === 'farmer') {
            // Get all equipment owned by the farmer
            const equipment = await Equipment.find({ owner: req.user._id });
            const equipmentIds = equipment.map(e => e._id);
            
            // Get bookings for the farmer's equipment
            bookings = await Booking.find({ equipment: { $in: equipmentIds } })
                .populate('equipment')
                .populate('renter', 'name email phone')
                .sort({ createdAt: -1 });
        } else {
            // Get bookings made by the renter
            bookings = await Booking.find({ renter: req.user._id })
                .populate('equipment')
                .populate('renter', 'name email phone')
                .sort({ createdAt: -1 });
        }
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

// Create new booking
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'renter') {
            return res.status(403).json({ message: 'Only renters can create bookings' });
        }

        const { equipmentId, startDate, endDate, totalAmount } = req.body;

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
            status: { $in: ['pending', 'confirmed'] },
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

        const booking = new Booking({
            equipment: equipmentId,
            renter: req.user._id,
            startDate,
            endDate,
            totalAmount
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking' });
    }
});

// Update booking status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id)
            .populate('equipment');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization
        if (req.user.role === 'farmer') {
            if (booking.equipment.owner.toString() !== req.user._id) {
                return res.status(403).json({ message: 'Not authorized to update this booking' });
            }
        } else {
            if (booking.renter.toString() !== req.user._id) {
                return res.status(403).json({ message: 'Not authorized to update this booking' });
            }
        }

        // Update status
        booking.status = status;
        await booking.save();

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking status' });
    }
});

module.exports = router; 