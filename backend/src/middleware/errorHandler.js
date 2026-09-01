/**
 * Centralized Express error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(' [Error Caught]:', err.message || err);

  // PostgreSQL Unique Constraint Violation error code
  if (err.code === '23505') {
    let message = 'A record with this information already exists.';
    if (err.detail && err.detail.includes('email')) {
      message = 'Email is already registered.';
    } else if (err.detail && (err.detail.includes('store_id') || err.detail.includes('user_id'))) {
      message = 'You have already rated this store.';
    } else if (err.constraint === 'unique_user_store_rating') {
      message = 'You have already rated this store.';
    }
    return res.status(409).json({
      success: false,
      message,
    });
  }

  // PostgreSQL Foreign Key Violation error code
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference: Referenced resource does not exist.',
    });
  }

  // PostgreSQL Check Constraint Violation error code
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Value does not satisfy data integrity constraints.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (statusCode === 500 ? 'Internal server error' : err.message);

  return res.status(statusCode).json({
    success: false,
    message: message || 'Something went wrong. Please try again later.',
  });
};

module.exports = errorHandler;
