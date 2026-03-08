const Connection = require('../models/Connection');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Send a connection request
 * @route   POST /api/connections/request/:id
 * @access  Private
 */
exports.sendRequest = catchAsync(async (req, res, next) => {
    const recipientId = req.params.id;
    const requesterId = req.user._id;

    // 1) Prevent sending request to yourself
    if (recipientId === requesterId.toString()) {
        const error = new Error('You cannot send a connection request to yourself');
        res.status(400);
        return next(error);
    }

    // 2) Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
        const error = new Error('User not found');
        res.status(404);
        return next(error);
    }

    // 3) Check if connection already exists (any status)
    const existingConnection = await Connection.findOne({
        $or: [
            { requester: requesterId, recipient: recipientId },
            { requester: recipientId, recipient: requesterId }
        ]
    });

    if (existingConnection) {
        let message = 'Connection request already exists';
        if (existingConnection.status === 'accepted') message = 'You are already connected';

        const error = new Error(message);
        res.status(400);
        return next(error);
    }

    // 4) Create connection request
    const connection = await Connection.create({
        requester: requesterId,
        recipient: recipientId,
        status: 'pending'
    });

    res.status(201).json({
        status: 'success',
        data: {
            connection
        }
    });
});

/**
 * @desc    Accept or Reject a connection request
 * @route   PATCH /api/connections/respond/:id
 * @access  Private
 */
exports.respondToRequest = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const requestId = req.params.id;

    if (!['accepted', 'rejected'].includes(status)) {
        const error = new Error('Invalid status. Use "accepted" or "rejected"');
        res.status(400);
        return next(error);
    }

    // Find the connection where the current user is the recipient
    const connection = await Connection.findOne({
        _id: requestId,
        recipient: req.user._id,
        status: 'pending'
    });

    if (!connection) {
        const error = new Error('Connection request not found or unauthorized');
        res.status(404);
        return next(error);
    }

    connection.status = status;
    await connection.save();

    res.status(200).json({
        status: 'success',
        data: {
            connection
        }
    });
});

/**
 * @desc    Get all accepted connections for the logged-in user
 * @route   GET /api/connections/my-network
 * @access  Private
 */
exports.getMyNetwork = catchAsync(async (req, res, next) => {
    const connections = await Connection.find({
        $or: [{ requester: req.user._id }, { recipient: req.user._id }],
        status: 'accepted'
    }).populate('requester recipient', 'firstName lastName graduationYear degree major currentJob profilePicture');

    // Filter out the current user from the results to only show the "other" person
    const network = connections.map(conn => {
        return conn.requester._id.toString() === req.user._id.toString()
            ? conn.recipient
            : conn.requester;
    });

    res.status(200).json({
        status: 'success',
        results: network.length,
        data: network
    });
});

/**
 * @desc    Get pending connection requests for the logged-in user
 * @route   GET /api/connections/requests
 * @access  Private
 */
exports.getPendingRequests = catchAsync(async (req, res, next) => {
    const requests = await Connection.find({
        recipient: req.user._id,
        status: 'pending'
    }).populate('requester', 'firstName lastName graduationYear degree major currentJob profilePicture');

    res.status(200).json({
        status: 'success',
        results: requests.length,
        data: requests
    });
});
