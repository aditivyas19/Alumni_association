const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Event description is required'],
        },
        date: {
            type: Date,
            required: [true, 'Event date is required'],
        },
        location: {
            type: String, // Can be a physical address or a link for virtual events
            required: [true, 'Location or virtual link is required'],
        },
        type: {
            type: String,
            enum: ['Reunion', 'Workshop', 'Seminar', 'Meetup', 'Webinar'],
            default: 'Meetup',
        },
        organizedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Event must have an organizer'],
        },
        attendees: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        bannerImage: String,
        maxAttendees: Number,
        isCancelled: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
