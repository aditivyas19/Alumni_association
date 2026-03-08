const Donation = require('../models/Donation');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Create a new donation record
 * @route   POST /api/donations
 * @access  Private
 */
exports.createDonation = catchAsync(async (req, res, next) => {
    const { amount, currency, purpose, transactionId, message, isAnonymous } = req.body;

    // 1) Basic validation for amount
    if (!amount || amount <= 0) {
        const error = new Error('Please provide a valid donation amount');
        res.status(400);
        return next(error);
    }

    // 2) Create donation record (status defaults to completed for tracking purposes in this module)
    const donation = await Donation.create({
        donor: req.user._id,
        amount,
        currency: currency || 'USD',
        purpose,
        transactionId: transactionId || `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        status: 'completed',
        message,
        isAnonymous
    });

    res.status(201).json({
        status: 'success',
        data: {
            donation
        }
    });
});

/**
 * @desc    Get all donations (Admin only)
 * @route   GET /api/donations
 * @access  Private/Admin
 */
exports.getAllDonations = catchAsync(async (req, res, next) => {
    // 1) Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // 2) Build Query
    const query = Donation.find()
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('donor', 'firstName lastName email profilePicture');

    // 3) Execute Query
    const donations = await query;

    // 4) Get totals
    const totalResults = await Donation.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
        status: 'success',
        totalResults,
        totalPages,
        currentPage: page,
        data: donations
    });
});

/**
 * @desc    Get current user's donation history
 * @route   GET /api/donations/my-donations
 * @access  Private
 */
exports.getMyDonations = catchAsync(async (req, res, next) => {
    // 1) Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // 2) Build Query
    const query = Donation.find({ donor: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    // 3) Execute Query
    const donations = await query;

    // 4) Get totals
    const totalResults = await Donation.countDocuments({ donor: req.user._id });
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
        status: 'success',
        totalResults,
        totalPages,
        currentPage: page,
        data: donations
    });
});
