const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createUserSchema, createStoreSchema } = require('../validators/adminValidator');

// Protect all admin routes: must be authenticated and have ADMIN role
router.use(authenticate, authorizeRole('ADMIN'));

// Dashboard Stats
router.get('/stats', adminController.getStats);

// User Management
router.get('/users', adminController.getUsers);
router.post('/users', validate(createUserSchema), adminController.createUser);
router.get('/users/:id', adminController.getUserById);

// Store Management
router.get('/stores', adminController.getStores);
router.post('/stores', validate(createStoreSchema), adminController.createStore);

module.exports = router;
