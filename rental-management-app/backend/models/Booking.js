const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    equipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: true
    },
    renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    payment: {
        depositPaid: {
            type: Boolean,
            default: false
        },
        depositAmount: Number,
        depositPaidDate: Date,
        depositRefunded: {
            type: Boolean,
            default: false
        },
        depositRefundDate: Date,
        finalPaymentStatus: {
            type: String,
            enum: ['pending', 'partial', 'completed'],
            default: 'pending'
        },
        finalPaymentDate: Date
    },
    insurance: {
        required: Boolean,
        provided: Boolean,
        policyNumber: String,
        coverageDetails: String,
        expiryDate: Date
    },
    operator: {
        name: String,
        licenseNumber: String,
        experience: String,
        contactNumber: String
    },
    delivery: {
        deliveryRequired: Boolean,
        deliveryAddress: String,
        deliveryDate: Date,
        deliveryTime: String,
        deliveryInstructions: String,
        deliveryStatus: {
            type: String,
            enum: ['pending', 'scheduled', 'completed'],
            default: 'pending'
        }
    },
    notes: {
        specialRequirements: String,
        additionalEquipment: String,
        siteConditions: String,
        farmerNotes: String,
        renterNotes: String
    },
    inspection: {
        preRental: {
            completed: Boolean,
            date: Date,
            notes: String,
            photos: [String]
        },
        postRental: {
            completed: Boolean,
            date: Date,
            notes: String,
            photos: [String],
            damageReport: String
        }
    }
}, {
    timestamps: true
});

// Validate that endDate is after startDate
bookingSchema.pre('save', function(next) {
    if (this.endDate <= this.startDate) {
        next(new Error('End date must be after start date'));
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema, 'bookings'); 