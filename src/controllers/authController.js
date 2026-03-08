const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

/**
 * Sign JWT Token
 */
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

/**
 * Send Token Response
 */
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        password,
        graduationYear,
        degree,
        major
    } = req.body;

    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        graduationYear,
        degree,
        major
    });

    createSendToken(newUser, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        const error = new Error('Please provide email and password');
        res.status(400);
        return next(error);
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        const error = new Error('Incorrect email or password');
        res.status(401);
        return next(error);
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
});

/**
 * @desc    Update password
 * @route   POST /api/auth/update-password
 * @access  Private
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection and add password field
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if posted current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        const error = new Error('Your current password is wrong');
        res.status(401);
        return next(error);
    }

    // 3) Update password
    user.password = req.body.password;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});
