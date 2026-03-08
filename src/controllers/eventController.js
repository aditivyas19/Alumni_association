const Event = require('../models/Event');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private
 */
exports.createEvent = catchAsync(async (req, res, next) => {
    const { title, description, date, location, bannerImage, type, maxAttendees } = req.body;

    const newEvent = await Event.create({
        title,
        description,
        date,
        location,
        bannerImage,
        type,
        maxAttendees,
        organizedBy: req.user._id,
    });

    res.status(201).json({
        status: 'success',
        data: {
            event: newEvent,
        },
    });
});

/**
 * @desc    Get all events with pagination, sorted by date (upcoming first)
 * @route   GET /api/events
 * @access  Public
 */
exports.getAllEvents = catchAsync(async (req, res, next) => {
    // 1) Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // 2) Build Query (Upcoming events first)
    const query = Event.find()
        .sort({ date: 1 }) // Ascending order: soonest events first
        .skip(skip)
        .limit(limit)
        .populate('organizedBy', 'firstName lastName email');

    // 3) Execute Query
    const events = await query;

    // 4) Get totals
    const totalResults = await Event.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
        status: 'success',
        totalResults,
        totalPages,
        currentPage: page,
        data: events,
    });
});

/**
 * @desc    Get single event details
 * @route   GET /api/events/:id
 * @access  Public
 */
exports.getEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id)
        .populate('organizedBy', 'firstName lastName email')
        .populate('attendees', 'firstName lastName profilePicture');

    if (!event) {
        const error = new Error('No event found with that ID');
        res.status(404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            event,
        },
    });
});

/**
 * @desc    Update an event
 * @route   PATCH /api/events/:id
 * @access  Private (Organizer or Admin)
 */
exports.updateEvent = catchAsync(async (req, res, next) => {
    let event = await Event.findById(req.params.id);

    if (!event) {
        const error = new Error('No event found with that ID');
        res.status(404);
        return next(error);
    }

    // Check ownership or admin status
    if (event.organizedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        const error = new Error('You do not have permission to update this event');
        res.status(403);
        return next(error);
    }

    // Filter allowed fields
    const allowedFields = ['title', 'description', 'date', 'location', 'type', 'bannerImage', 'maxAttendees', 'isCancelled'];
    const filteredBody = {};
    Object.keys(req.body).forEach(el => {
        if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
    });

    event = await Event.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            event,
        },
    });
});

/**
 * @desc    Register for an event
 * @route   POST /api/events/register/:id
 * @access  Private
 */
exports.registerForEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        const error = new Error('No event found with that ID');
        res.status(404);
        return next(error);
    }

    // 1) Check if event is cancelled
    if (event.isCancelled) {
        const error = new Error('This event has been cancelled');
        res.status(400);
        return next(error);
    }

    // 2) Check if user is already registered
    if (event.attendees.includes(req.user._id)) {
        const error = new Error('You are already registered for this event');
        res.status(400);
        return next(error);
    }

    // 3) Check for capacity
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        const error = new Error('This event is already full');
        res.status(400);
        return next(error);
    }

    // 4) Add user to attendees
    event.attendees.push(req.user._id);
    await event.save();

    res.status(200).json({
        status: 'success',
        message: 'Registered successfully',
    });
});

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private (Organizer or Admin)
 */
exports.deleteEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        const error = new Error('No event found with that ID');
        res.status(404);
        return next(error);
    }

    // Check ownership or admin status
    if (event.organizedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        const error = new Error('You do not have permission to delete this event');
        res.status(403);
        return next(error);
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
