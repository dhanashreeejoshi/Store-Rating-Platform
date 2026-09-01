/**
 * Middleware to validate request data against a Zod schema
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error.errors && error.errors.length > 0) {
        const errorMessages = error.errors.map((err) => err.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessages,
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
      });
    }
  };
};

module.exports = validate;
