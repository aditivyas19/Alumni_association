const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware to protect routes - checks if user is logged in
 */
exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // 1) Getting token and check if it's there
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        const error = new Error('You are not logged in! Please log in to get access.');
        res.status(401);
        return next(error);
    }

    // 2) Verification token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
        const message = jwtErr.name === 'TokenExpiredError'
            ? 'Your token has expired. Please log in again.'
            : 'Invalid token. Please log in again.';
        const error = new Error(message);
        res.status(401);
        return next(error);
    }

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        const error = new Error('The user belonging to this token no longer exists.');
        res.status(401);
        return next(error);
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

/**
 * Middleware to restrict access to certain roles
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'moderator']. role='alumni'
        if (!roles.includes(req.user.role)) {
            const error = new Error('You do not have permission to perform this action');
            res.status(403);
            return next(error);
        }
        next();
    };
};
