const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authenticate = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createRatingSchema, updateRatingSchema } = require('../validators/ratingValidator');

// All rating creation/modification routes require authentication
router.use(authenticate);

// Submit new rating
router.post('/', validate(createRatingSchema), ratingController.createRating);

// Modify existing rating
router.put('/:id', validate(updateRatingSchema), ratingController.updateRating);

module.exports = router;
