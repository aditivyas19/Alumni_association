const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');
const authRouter = require('./routes/authRoutes');
const alumniRouter = require('./routes/alumniRoutes');
const jobRouter = require('./routes/jobRoutes');
const eventRouter = require('./routes/eventRoutes');
const connectionRouter = require('./routes/connectionRoutes');
const donationRouter = require('./routes/donationRoutes');
const storyRouter = require('./routes/storyRoutes');

const app = express();

// 1. GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Rate limiting: Limit requests from same IP
const limiter = rateLimit({
    max: 100, // Limit each IP to 100 requests per 15 mins
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// 2. ROUTES
app.use('/api/auth', authRouter);
app.use('/api/alumni', alumniRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/events', eventRouter);
app.use('/api/connections', connectionRouter);
app.use('/api/donations', donationRouter);
app.use('/api/stories', storyRouter);

app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: {
            host: mongoose.connection.host,
            state: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        }
    });
});

// Handle undefined routes
app.all('*', (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    res.status(404);
    next(err);
});

// 3. GLOBAL ERROR HANDLER
app.use(errorHandler);

module.exports = app;
