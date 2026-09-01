const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

/**
 * Get Store Owner Dashboard Information
 * GET /api/owner/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Fetch stores belonging to logged-in owner
    const storesResult = await query(
      `SELECT s.id, s.name, s.email, s.address, s.created_at,
              COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
              COUNT(r.id) AS total_ratings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id
       ORDER BY s.created_at ASC`,
      [ownerId]
    );

    const stores = storesResult.rows.map((s) => ({
      ...s,
      avg_rating: parseFloat(s.avg_rating || 0),
      total_ratings: parseInt(s.total_ratings || 0, 10),
    }));

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No stores assigned to your account yet.',
        data: {
          stores: [],
          primaryStore: null,
          totalRatingsCount: 0,
          overallAverageRating: 0,
        },
      });
    }

    // Calculate aggregated stats across owner's stores
    const totalRatingsCount = stores.reduce((sum, s) => sum + s.total_ratings, 0);
    const overallAverageRating =
      totalRatingsCount > 0
        ? parseFloat(
            (
              stores.reduce((sum, s) => sum + s.avg_rating * s.total_ratings, 0) /
              totalRatingsCount
            ).toFixed(1)
          )
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        stores,
        primaryStore: stores[0],
        totalRatingsCount,
        overallAverageRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Ratings for Logged-in Owner's Store(s)
 * GET /api/owner/ratings
 */
const getRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const storeIdFilter = req.query.store_id ? parseInt(req.query.store_id, 10) : null;

    let sql = `
      SELECT r.id, r.rating, r.created_at, r.updated_at,
             u.name AS user_name, u.email AS user_email,
             s.name AS store_name, s.id AS store_id
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      JOIN users u ON r.user_id = u.id
      WHERE s.owner_id = $1
    `;
    const params = [ownerId];

    if (storeIdFilter && !isNaN(storeIdFilter)) {
      params.push(storeIdFilter);
      sql += ` AND s.id = $${params.length}`;
    }

    sql += ' ORDER BY r.created_at DESC';

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      data: {
        ratings: result.rows,
        total: result.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Store Owner Change Password
 * PUT /api/owner/password
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const userResult = await query('SELECT password FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, userResult.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [
      newHashedPassword,
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getRatings,
  changePassword,
};
