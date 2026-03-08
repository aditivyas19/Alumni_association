const express = require('express');
const storyController = require('../controllers/storyController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', storyController.getAllStories);
router.get('/:id', storyController.getStory);

// Protected routes
router.use(protect);

router.post('/', storyController.createStory);

// Admin-only routes
router.use(restrictTo('admin'));
router.patch('/:id', storyController.updateStory);
router.delete('/:id', storyController.deleteStory);

module.exports = router;
