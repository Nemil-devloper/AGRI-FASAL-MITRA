const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Equipment = require('../models/Equipment');
const auth = require('../middleware/auth');
const fs = require('fs');
const Booking = require('../models/Booking');
const cloudinaryImageUpload = require('../middleware/cloudinaryImageUpload');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/equipment');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

// Get all equipment owned by the current user
router.get('/my-equipment', auth, async (req, res) => {
    try {
        const equipment = await Equipment.find({ owner: req.user.id })
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });

        console.log('Found my equipment count:', equipment.length); // Debug log
        
        if (!equipment) {
            return res.status(404).json({ message: 'No equipment found' });
        }

        res.json(equipment);
    } catch (error) {
        console.error('Error fetching my equipment:', error);
        res.status(500).json({ message: 'Server error while fetching equipment' });
    }
});

// Get all equipment with filters
router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, location, search } = req.query;
        let query = {};

        // Only filter by availability if explicitly set
        if (req.query.availability !== undefined) {
            query.availability = req.query.availability === 'true';
        }

        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.dailyRate = {};
            if (minPrice) query.dailyRate.$gte = Number(minPrice);
            if (maxPrice) query.dailyRate.$lte = Number(maxPrice);
        }
        if (location) query.location = new RegExp(location, 'i');
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        console.log('Equipment query:', query); // Debug log

        const equipment = await Equipment.find(query)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });

        console.log('Found equipment count:', equipment.length); // Debug log
        console.log('Equipment data:', equipment); // Log the equipment data

        res.json(equipment);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ message: 'Server error while fetching equipment' });
    }
});

// Get equipment by ID
router.get('/:id', async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id)
            .populate('owner', 'name email phone')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });
            
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        // Format the response to include all fields
        const formattedEquipment = {
            ...equipment.toObject(),
            specifications: equipment.specifications || {},
            requirements: equipment.requirements || {},
            contactInfo: equipment.contactInfo || {},
            images: equipment.images || [],
            owner: equipment.owner || {},
            reviews: equipment.reviews || [],
            operatingInstructions: equipment.operatingInstructions || '',
            safetyGuidelines: equipment.safetyGuidelines || '',
            availability: equipment.availability || true,
            dailyRate: equipment.dailyRate || 0,
            category: equipment.category || '',
            location: equipment.location || '',
            description: equipment.description || '',
            name: equipment.name || ''
        };

        // Log the formatted equipment for debugging
        console.log('Sending equipment data:', formattedEquipment);

        res.json(formattedEquipment);
    } catch (error) {
        console.error('Error fetching equipment details:', error);
        res.status(500).json({ message: 'Server error while fetching equipment details' });
    }
});

// Create new equipment (farmer only)
router.post('/',
    auth,
    upload.array('images', 5),
    cloudinaryImageUpload, // Upload images to Cloudinary and attach URLs
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('description').trim().notEmpty().withMessage('Description is required'),
        body('category').isIn(['Tractors', 'Harvesters', 'Planters', 'Sprayers', 'Other'])
            .withMessage('Invalid category'),
        body('dailyRate').isFloat({ min: 0 }).withMessage('Daily rate must be a positive number'),
        body('location').trim().notEmpty().withMessage('Location is required')
    ],
    async (req, res) => {
        try {
            if (req.user.role !== 'farmer') {
                return res.status(403).json({ message: 'Only farmers can list equipment' });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            if (!req.body.images || req.body.images.length === 0) {
                return res.status(400).json({ message: 'At least one image is required' });
            }

            // Parse JSON strings back into objects
            const equipmentData = {
                ...req.body,
                specifications: JSON.parse(req.body.specifications || '{}'),
                requirements: JSON.parse(req.body.requirements || '{}'),
                contactInfo: JSON.parse(req.body.contactInfo || '{}'),
                owner: req.user._id,
                images: req.body.images
            };

            const equipment = new Equipment(equipmentData);
            await equipment.save();
            res.status(201).json(equipment);
        } catch (error) {
            console.error('Error creating equipment:', error);
            res.status(500).json({ message: 'Server error while creating equipment' });
        }
    }
);

// Update equipment (owner only)
router.put('/:id',
    auth,
    upload.array('images', 5),
    cloudinaryImageUpload, // Upload new images to Cloudinary
    async (req, res) => {
        try {
            const equipment = await Equipment.findById(req.params.id);
            if (!equipment) {
                return res.status(404).json({ message: 'Equipment not found' });
            }

            if (equipment.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this equipment' });
            }

            // Handle image updates
            if (req.body.images && req.body.images.length > 0) {
                req.body.images = req.body.images;
            } else {
                req.body.images = equipment.images;
            }

            // Parse JSON strings back into objects
            const updateData = {
                ...req.body,
                specifications: req.body.specifications ? JSON.parse(req.body.specifications) : equipment.specifications,
                requirements: req.body.requirements ? JSON.parse(req.body.requirements) : equipment.requirements,
                contactInfo: req.body.contactInfo ? JSON.parse(req.body.contactInfo) : equipment.contactInfo
            };

            Object.assign(equipment, updateData);
            await equipment.save();
            res.json(equipment);
        } catch (error) {
            console.error('Error updating equipment:', error);
            res.status(500).json({ message: 'Server error while updating equipment' });
        }
    }
);

// Delete equipment
router.delete('/:id', auth, async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        
        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        // Check if user is the owner of the equipment
        if (equipment.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this equipment' });
        }

        // Check if there are any active bookings
        const activeBookings = await Booking.find({
            equipment: req.params.id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeBookings.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete equipment with active bookings. Please cancel all bookings first.' 
            });
        }

        await Equipment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ message: 'Server error' });
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

module.exports = router;