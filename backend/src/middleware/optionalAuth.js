const jwt = require('jsonwebtoken');

/**
 * Optional authentication middleware
 * Attaches user to req.user if a valid token is provided, but does not block if not
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'store_rating_platform_super_secret_key_2026';
    const decoded = jwt.verify(token, secret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
  } catch (err) {
    // If token is invalid/expired, just proceed unauthenticated
    req.user = null;
  }

  next();
};

module.exports = optionalAuth;
