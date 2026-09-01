const { z } = require('zod');

const createRatingSchema = z.object({
  store_id: z.coerce.number().int().positive('Valid store ID is required'),
  rating: z.coerce
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
});

const updateRatingSchema = z.object({
  rating: z.coerce
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
});

module.exports = {
  createRatingSchema,
  updateRatingSchema,
};
