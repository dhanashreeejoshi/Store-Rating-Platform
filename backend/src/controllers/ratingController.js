const { query } = require('../config/db');

/**
 * Submit a new Rating for a Store
 * POST /api/ratings
 */
const createRating = async (req, res, next) => {
  try {
    const { store_id, rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const storeResult = await query('SELECT id FROM stores WHERE id = $1', [store_id]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }

    // Check if user has already rated this store
    const existingRating = await query(
      'SELECT id, rating FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, store_id]
    );

    if (existingRating.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already rated this store. Please modify your existing rating instead.',
        data: {
          existingRatingId: existingRating.rows[0].id,
          currentRating: existingRating.rows[0].rating,
        },
      });
    }

    // Insert new rating
    const insertResult = await query(
      `INSERT INTO ratings (user_id, store_id, rating, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, user_id, store_id, rating, created_at, updated_at`,
      [userId, store_id, rating]
    );

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: insertResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Modify an existing Rating
 * PUT /api/ratings/:id
 */
const updateRating = async (req, res, next) => {
  try {
    const ratingId = parseInt(req.params.id, 10);
    const { rating } = req.body;
    const userId = req.user.id;

    if (isNaN(ratingId)) {
      return res.status(400).json({ success: false, message: 'Invalid rating ID.' });
    }

    // Find rating in database
    const ratingResult = await query('SELECT * FROM ratings WHERE id = $1', [ratingId]);
    if (ratingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found.',
      });
    }

    const existingRating = ratingResult.rows[0];

    // Security Check: User can only modify their own rating
    if (existingRating.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can modify only your own rating.',
      });
    }

    // Update rating
    const updateResult = await query(
      `UPDATE ratings
       SET rating = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, user_id, store_id, rating, created_at, updated_at`,
      [rating, ratingId]
    );

    return res.status(200).json({
      success: true,
      message: 'Rating updated successfully.',
      data: updateResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User's Rating for a specific Store
 * GET /api/stores/:id/rating
 */
const getUserRatingForStore = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid store ID.' });
    }

    const result = await query(
      'SELECT id, user_id, store_id, rating, created_at, updated_at FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRating,
  updateRating,
  getUserRatingForStore,
};
