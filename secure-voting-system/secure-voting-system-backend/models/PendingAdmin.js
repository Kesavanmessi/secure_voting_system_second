const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const PendingAdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'Manager Admin',
        enum: ['Manager Admin'] // Currently only allowing Manager Admin signup
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to hash password before saving
PendingAdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const PendingAdmin = mongoose.model('PendingAdmin', PendingAdminSchema);
module.exports = PendingAdmin;
