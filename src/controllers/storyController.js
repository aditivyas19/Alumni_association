const SuccessStory = require('../models/SuccessStory');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Submit a new success story
 * @route   POST /api/stories
 * @access  Private
 */
exports.createStory = catchAsync(async (req, res, next) => {
    const { title, content, achievement, company, year, mediaUrl, tags } = req.body;

    const newStory = await SuccessStory.create({
        alumni: req.user._id,
        title,
        content,
        achievement,
        company,
        year,
        mediaUrl,
        tags,
        isApproved: false // Always false by default for moderation
    });

    res.status(201).json({
        status: 'success',
        data: {
            story: newStory
        }
    });
});

/**
 * @desc    Get all approved success stories
 * @route   GET /api/stories
 * @access  Public
 */
exports.getAllStories = catchAsync(async (req, res, next) => {
    // 1) Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // 2) Build Query (Only approved stories, newest first)
    const query = SuccessStory.find({ isApproved: true })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('alumni', 'firstName lastName graduationYear major profilePicture');

    // 3) Execute Query
    const stories = await query;

    // 4) Get totals
    const totalResults = await SuccessStory.countDocuments({ isApproved: true });
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
        status: 'success',
        totalResults,
        totalPages,
        currentPage: page,
        data: stories
    });
});

/**
 * @desc    Get single success story details
 * @route   GET /api/stories/:id
 * @access  Public
 */
exports.getStory = catchAsync(async (req, res, next) => {
    const story = await SuccessStory.findById(req.params.id)
        .populate('alumni', 'firstName lastName graduationYear major profilePicture');

    if (!story || (!story.isApproved && req.user?.role !== 'admin')) {
        const error = new Error('No approved story found with that ID');
        res.status(404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            story
        }
    });
});

/**
 * @desc    Update/Approve success story (Admin only)
 * @route   PATCH /api/stories/:id
 * @access  Private/Admin
 */
exports.updateStory = catchAsync(async (req, res, next) => {
    const { title, content, isApproved, featured, achievement, company, year } = req.body;

    const updatedStory = await SuccessStory.findByIdAndUpdate(
        req.params.id,
        { title, content, isApproved, featured, achievement, company, year },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedStory) {
        const error = new Error('No story found with that ID');
        res.status(404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            story: updatedStory
        }
    });
});

/**
 * @desc    Delete success story (Admin only)
 * @route   DELETE /api/stories/:id
 * @access  Private/Admin
 */
exports.deleteStory = catchAsync(async (req, res, next) => {
    const story = await SuccessStory.findByIdAndDelete(req.params.id);

    if (!story) {
        const error = new Error('No story found with that ID');
        res.status(404);
        return next(error);
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
