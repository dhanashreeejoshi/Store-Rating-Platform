const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const ratingController = require('../controllers/ratingController');
const optionalAuth = require('../middleware/optionalAuth');
const authenticate = require('../middleware/authMiddleware');

// Get stores (public or with user context)
router.get('/', optionalAuth, storeController.getStores);
router.get('/:id', optionalAuth, storeController.getStoreById);

// Get current user's rating for a store
router.get('/:id/rating', authenticate, ratingController.getUserRatingForStore);

module.exports = router;
