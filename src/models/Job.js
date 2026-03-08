const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            index: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
        },
        description: {
            type: String,
            required: [true, 'Job description is required'],
        },
        salaryRange: {
            type: String,
        },
        category: {
            type: String,
            required: [true, 'Job category is required'],
            enum: ['Engineering', 'Technology', 'Management', 'Finance', 'Design', 'Other'],
        },
        jobType: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
            default: 'Full-time',
        },
        applyLink: {
            type: String,
            required: [true, 'Application link or contact info is required'],
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Job must belong to a user'],
        },
        deadline: Date,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
