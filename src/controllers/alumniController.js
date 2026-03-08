const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Get alumni profile by ID
 * @route   GET /api/alumni/profile/:id
 * @access  Public
 */
exports.getAlumniProfile = catchAsync(async (req, res, next) => {
    const alumni = await User.findById(req.params.id);

    if (!alumni) {
        const error = new Error('No alumni found with that ID');
        res.status(404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            alumni,
        },
    });
});

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/alumni/me
 * @access  Private
 */
exports.getMe = catchAsync(async (req, res, next) => {
    // req.user is already attached by protect middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

/**
 * @desc    Update current user profile
 * @route   PATCH /api/alumni/me
 * @access  Private
 */
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password) {
        const error = new Error('This route is not for password updates. Please use /api/auth/update-password.');
        res.status(400);
        return next(error);
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    // For production, we should only allow specific fields
    const filteredBody = {};
    const allowedFields = [
        'firstName',
        'lastName',
        'graduationYear',
        'degree',
        'major',
        'currentJob',
        'socialLinks',
        'profilePicture',
        'bio'
    ];

    Object.keys(req.body).forEach(el => {
        if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
    });

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

/**
 * @desc    Get alumni directory with search, filter and pagination
 * @route   GET /api/alumni/directory
 * @access  Public
 */
exports.getAlumniDirectory = catchAsync(async (req, res, next) => {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering for nested fields (e.g., company)
    let queryStr = JSON.stringify(queryObj);
    // Special case for company as it is nested in currentJob
    if (req.query.company) {
        queryObj['currentJob.company'] = req.query.company;
        delete queryObj.company;
    }

    // 2) Build Query
    let query = User.find(queryObj);

    // 3) Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // 4) Execute Query
    const alumni = await query;

    // 5) Get total results for pagination metadata
    const totalResults = await User.countDocuments(queryObj);
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
        status: 'success',
        totalResults,
        totalPages,
        currentPage: page,
        data: alumni,
    });
});
