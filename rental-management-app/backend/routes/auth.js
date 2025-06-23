const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register user
router.post('/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
            .withMessage('Password must contain at least one letter and one number'),
        body('role').isIn(['farmer', 'renter']).withMessage('Invalid role'),
        body('phone').matches(/^\d{10}$/).withMessage('Phone number must be 10 digits'),
        body('address').trim().notEmpty().withMessage('Address is required'),
        body('city').trim().notEmpty().withMessage('City is required'),
        body('state').trim().notEmpty().withMessage('State is required'),
        body('pincode').matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
        body('aadharNumber').matches(/^\d{12}$/).withMessage('Aadhar number must be 12 digits'),
        // Conditional validation for farmer
        body('landArea').if(body('role').equals('farmer')).isFloat({ min: 0 }).withMessage('Land area must be a positive number'),
        body('cropType').if(body('role').equals('farmer')).isIn(['wheat', 'rice', 'cotton', 'sugarcane', 'vegetables', 'fruits', 'other']).withMessage('Invalid crop type'),
        // Conditional validation for renter
        body('companyName').if(body('role').equals('renter')).trim().notEmpty().withMessage('Company name is required'),
        body('gstin').if(body('role').equals('renter')).matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Invalid GSTIN format'),
        body('bankAccount').if(body('role').equals('renter')).matches(/^\d{9,18}$/).withMessage('Invalid bank account number'),
        body('ifscCode').if(body('role').equals('renter')).matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC code')
    ],
    async (req, res) => {
        try {
            console.log('Registration request received:', { ...req.body, password: '[REDACTED]' });
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Validation errors:', errors.array());
                return res.status(400).json({ errors: errors.array() });
            }

            const { 
                name, 
                email, 
                password, 
                role, 
                phone, 
                address, 
                city,
                state,
                pincode,
                aadharNumber,
                landArea,
                cropType,
                companyName,
                gstin,
                bankAccount,
                ifscCode
            } = req.body;

            // Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                console.log('User already exists with email:', email);
                return res.status(400).json({ message: 'User with this email already exists' });
            }

            console.log('Creating new user with role:', role);
            // Create new user
            user = new User({
                name,
                email,
                password,
                role,
                phone,
                address,
                city,
                state,
                pincode,
                aadharNumber,
                ...(role === 'farmer' ? { landArea, cropType } : {}),
                ...(role === 'renter' ? { companyName, gstin, bankAccount, ifscCode } : {})
            });

            console.log('Saving user to database...');
            await user.save();
            console.log('User saved successfully with ID:', user._id);

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'rental-management-secret-key-2024',
                { expiresIn: '24h' }
            );

            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    city: user.city,
                    state: user.state,
                    pincode: user.pincode,
                    ...(role === 'farmer' ? { landArea: user.landArea, cropType: user.cropType } : {}),
                    ...(role === 'renter' ? { companyName: user.companyName } : {})
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    }
);

// Login user
router.post('/login',
    [
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password').exists().withMessage('Password is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'rental-management-secret-key-2024',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    city: user.city,
                    state: user.state,
                    pincode: user.pincode,
                    ...(user.role === 'farmer' ? { landArea: user.landArea, cropType: user.cropType } : {}),
                    ...(user.role === 'renter' ? { companyName: user.companyName } : {})
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    }
);

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

// Update user profile
router.put('/profile', auth, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
    body('companyName').optional().trim().notEmpty().withMessage('Company name cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, phone, address, companyName } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (companyName) user.companyName = companyName;

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
});

module.exports = router; 