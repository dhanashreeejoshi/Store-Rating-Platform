const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { changePasswordSchema } = require('../validators/authValidator');

// Protect all owner routes: must be authenticated and have STORE_OWNER role
router.use(authenticate, authorizeRole('STORE_OWNER'));

// Dashboard Stats & Store Info
router.get('/dashboard', ownerController.getDashboard);

// Customer Ratings for Owner's Stores
router.get('/ratings', ownerController.getRatings);

// Password Change
router.put('/password', validate(changePasswordSchema), ownerController.changePassword);

module.exports = router;
