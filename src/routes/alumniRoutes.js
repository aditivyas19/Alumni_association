const express = require('express');
const alumniController = require('../controllers/alumniController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/directory', alumniController.getAlumniDirectory);
router.get('/profile/:id', alumniController.getAlumniProfile);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.get('/me', alumniController.getMe);
router.patch('/me', alumniController.updateMe);

module.exports = router;
