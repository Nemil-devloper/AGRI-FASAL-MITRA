const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['farmer', 'renter'],
        required: true
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{6}$/.test(v);
            },
            message: props => `${props.value} is not a valid pincode!`
        }
    },
    aadharNumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{12}$/.test(v);
            },
            message: props => `${props.value} is not a valid Aadhar number!`
        }
    },
    // Farmer specific fields
    landArea: {
        type: Number,
        required: function() {
            return this.role === 'farmer';
        },
        min: [0, 'Land area cannot be negative']
    },
    cropType: {
        type: String,
        required: function() {
            return this.role === 'farmer';
        },
        enum: ['wheat', 'rice', 'cotton', 'sugarcane', 'vegetables', 'fruits', 'other']
    },
    // Equipment owner specific fields
    companyName: {
        type: String,
        required: function() {
            return this.role === 'renter';
        }
    },
    gstin: {
        type: String,
        required: function() {
            return this.role === 'renter';
        },
        validate: {
            validator: function(v) {
                return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
            },
            message: props => `${props.value} is not a valid GSTIN!`
        }
    },
    bankAccount: {
        type: String,
        required: function() {
            return this.role === 'renter';
        },
        validate: {
            validator: function(v) {
                return /^\d{9,18}$/.test(v);
            },
            message: props => `${props.value} is not a valid bank account number!`
        }
    },
    ifscCode: {
        type: String,
        required: function() {
            return this.role === 'renter';
        },
        validate: {
            validator: function(v) {
                return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
            },
            message: props => `${props.value} is not a valid IFSC code!`
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Update the updatedAt timestamp
userSchema.pre('findOneAndUpdate', function() {
    this.set({ updatedAt: new Date() });
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('User', userSchema, 'persons'); 