const express = require('express');
const connectionController = require('../controllers/connectionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All connection routes are protected
router.use(protect);

router.post('/request/:id', connectionController.sendRequest);
router.patch('/respond/:id', connectionController.respondToRequest);
router.get('/my-network', connectionController.getMyNetwork);
router.get('/requests', connectionController.getPendingRequests);

module.exports = router;
