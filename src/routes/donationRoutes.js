const express = require('express');
const donationController = require('../controllers/donationController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All donation routes require authentication
router.use(protect);

router.post('/', donationController.createDonation);
router.get('/my-donations', donationController.getMyDonations);

// Admin-only route to see all contributions
router.get('/', restrictTo('admin'), donationController.getAllDonations);

module.exports = router;
