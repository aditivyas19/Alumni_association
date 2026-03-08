const express = require('express');
const eventController = require('../controllers/eventController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);

// Protected routes
router.use(protect);

router.post('/', eventController.createEvent);
router.patch('/:id', eventController.updateEvent);
router.post('/register/:id', eventController.registerForEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;

