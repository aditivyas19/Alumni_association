const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema(
    {
        alumni: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Story must belong to an alumni'],
        },
        title: {
            type: String,
            required: [true, 'Story title is required'],
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Story content is required'],
        },
        achievement: String,
        company: String,
        year: Number,
        mediaUrl: String, // Optional image/video link
        tags: [String],
        isApproved: {
            type: Boolean,
            default: false, // Requires admin moderation
        },
        featured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const SuccessStory = mongoose.model('SuccessStory', successStorySchema);

module.exports = SuccessStory;
