const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
    {
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Donation must be linked to a user'],
        },
        amount: {
            type: Number,
            required: [true, 'Donation amount is required'],
            min: [1, 'Amount must be at least 1'],
        },
        currency: {
            type: String,
            default: 'USD',
        },
        purpose: {
            type: String,
            enum: ['Scholarship fund', 'Infrastructure', 'Research', 'General'],
            required: [true, 'Donation purpose is required'],
        },
        transactionId: {
            type: String,
            unique: true,
            required: [true, 'Transaction ID is required'],
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        message: {
            type: String,
            maxlength: 200,
        },
        isAnonymous: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
