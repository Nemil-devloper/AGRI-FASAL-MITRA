const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Tractors', 'Harvesters', 'Planters', 'Sprayers', 'Other']
    },
    dailyRate: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    // New fields for practical information
    specifications: {
        brand: String,
        model: String,
        year: Number,
        horsepower: Number,
        fuelType: String,
        operatingHours: Number,
        maintenanceHistory: String,
        lastServiceDate: Date,
        nextServiceDue: Date
    },
    requirements: {
        operatorLicense: Boolean,
        operatorExperience: String,
        specialTraining: String,
        insuranceRequired: Boolean,
        depositAmount: Number
    },
    operatingInstructions: {
        type: String,
        required: true
    },
    safetyGuidelines: {
        type: String,
        required: true
    },
    contactInfo: {
        phone: String,
        email: String,
        preferredContactTime: String,
        emergencyContact: String
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Equipment', equipmentSchema, 'equipment'); 