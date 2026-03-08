const Job = require('../models/Job');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private
 */
exports.createJob = catchAsync(async (req, res, next) => {
    const {
        title,
        description,
        company,
        location,
        salaryRange,
        applyLink,
        category
    } = req.body;

    const newJob = await Job.create({
        title,
        description,
        company,
        location,
        salaryRange,
        applyLink,
        category,
        postedBy: req.user._id,
    });

    res.status(201).json({
        status: 'success',
        data: {
            job: newJob,
        },
    });
});

/**
 * @desc    Get all job postings with filtering and pagination
 * @route   GET /api/jobs
 * @access  Public
 */
exports.getAllJobs = catchAsync(async (req, res, next) => {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2) Build Query
    let query = Job.find(queryObj).populate('postedBy', 'firstName lastName email');

    // 3) Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // 4) Execute Query
    const jobs = await query;

    // 5) Get totals for metadata
    const totalResults = await Job.countDocuments(queryObj);
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
        status: 'success',
        totalResults,
        totalPages,
        currentPage: page,
        data: jobs,
    });
});

/**
 * @desc    Get single job details
 * @route   GET /api/jobs/:id
 * @access  Public
 */
exports.getJob = catchAsync(async (req, res, next) => {
    const job = await Job.findById(req.params.id).populate('postedBy', 'firstName lastName email');

    if (!job) {
        const error = new Error('No job found with that ID');
        res.status(404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            job,
        },
    });
});

/**
 * @desc    Update a job posting
 * @route   PATCH /api/jobs/:id
 * @access  Private (Owner or Admin)
 */
exports.updateJob = catchAsync(async (req, res, next) => {
    let job = await Job.findById(req.params.id);

    if (!job) {
        const error = new Error('No job found with that ID');
        res.status(404);
        return next(error);
    }

    // Check if the user is the owner of the job or an admin
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        const error = new Error('You do not have permission to update this job');
        res.status(403);
        return next(error);
    }

    // Filter allowed fields
    const allowedFields = ['title', 'description', 'company', 'location', 'salaryRange', 'category', 'jobType', 'applyLink', 'deadline', 'isActive'];
    const filteredBody = {};
    Object.keys(req.body).forEach(el => {
        if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
    });

    job = await Job.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            job,
        },
    });
});

/**
 * @desc    Delete a job posting
 * @route   DELETE /api/jobs/:id
 * @access  Private (Owner or Admin)
 */
exports.deleteJob = catchAsync(async (req, res, next) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        const error = new Error('No job found with that ID');
        res.status(404);
        return next(error);
    }

    // Check if the user is the owner of the job or an admin
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        const error = new Error('You do not have permission to delete this job');
        res.status(403);
        return next(error);
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
