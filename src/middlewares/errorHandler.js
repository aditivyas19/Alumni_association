const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = `Resource not found`;
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `Duplicate value for '${field}'. Please use a different value.`;
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map((val) => val.message);
        statusCode = 400;
    }

    // JWT errors (fallback in case not caught upstream)
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token. Please log in again.';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        message = 'Your token has expired. Please log in again.';
        statusCode = 401;
    }

    const isProduction = process.env.NODE_ENV === 'production';

    res.status(statusCode).json({
        status: 'error',
        message,
        ...(isProduction ? {} : { stack: err.stack }),
    });
};

module.exports = errorHandler;
