const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require('../validators/authValidator');

// Public authentication routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected authentication routes
router.get('/me', authenticate, authController.getMe);
router.put('/password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
