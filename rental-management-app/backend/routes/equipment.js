const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Get all equipment
router.get('/', async (req, res) => {
    try {
        const equipment = await Equipment.find()
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment' });
    }
});

// Get equipment by owner (farmer)
router.get('/my-equipment', auth, async (req, res) => {
    try {
        console.log('Fetching equipment for owner:', req.user._id);
        
        if (req.user.role !== 'farmer') {
            return res.status(403).json({ message: 'Only farmers can access their equipment' });
        }

        const equipment = await Equipment.find({ owner: req.user._id })
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });

        console.log('Found equipment count:', equipment.length);
        console.log('Equipment data:', JSON.stringify(equipment, null, 2));

        if (!equipment || equipment.length === 0) {
            console.log('No equipment found for owner:', req.user._id);
            return res.json([]);
        }

        res.json(equipment);
    } catch (error) {
        console.error('Error fetching owner equipment:', error);
        res.status(500).json({ message: 'Server error while fetching equipment' });
    }
});

// Add new equipment
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'farmer') {
            return res.status(403).json({ message: 'Only farmers can add equipment' });
        }

        const equipment = new Equipment({
            ...req.body,
            owner: req.user._id
        });

        await equipment.save();
        res.status(201).json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Error adding equipment' });
    }
});

// Update equipment
router.put('/:id', auth, async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        if (equipment.owner.toString() !== req.user._id) {
            return res.status(403).json({ message: 'Not authorized to update this equipment' });
        }

        const updatedEquipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedEquipment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating equipment' });
    }
});

// Delete equipment
router.delete('/:id', auth, async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        if (equipment.owner.toString() !== req.user._id) {
            return res.status(403).json({ message: 'Not authorized to delete this equipment' });
        }

        // Check for active bookings
        const activeBookings = await Booking.find({
            equipment: req.params.id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeBookings.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete equipment with active bookings' 
            });
        }

        await equipment.remove();
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting equipment' });
    }
});

module.exports = router; 