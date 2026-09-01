const { query } = require('../config/db');

/**
 * Get All Stores with Overall Rating and Authenticated User's Rating
 * GET /api/stores
 */
const getStores = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10', 10)));
    const offset = (page - 1) * limit;

    const search = req.query.search ? `%${req.query.search.trim()}%` : null;

    const allowedSortFields = {
      name: 's.name',
      address: 's.address',
      rating: 'avg_rating',
      created_at: 's.created_at',
    };
    const sortBy = allowedSortFields[req.query.sortBy] || 's.created_at';
    const order = req.query.order && req.query.order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions = [];
    const params = [];

    if (search) {
      params.push(search);
      conditions.push(`(s.name ILIKE $${params.length} OR s.address ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count
    const countSql = `SELECT COUNT(*) AS total FROM stores s ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);
    const totalPages = Math.ceil(total / limit) || 1;

    // Optional user ID from authenticated request
    const currentUserId = req.user ? req.user.id : null;

    let userRatingSelect = 'NULL AS my_rating, NULL AS my_rating_id';
    let userJoin = '';
    const queryParams = [...params];

    if (currentUserId) {
      queryParams.push(currentUserId);
      const userParamIdx = queryParams.length;
      userRatingSelect = `ur.rating AS my_rating, ur.id AS my_rating_id`;
      userJoin = `LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $${userParamIdx}`;
    }

    queryParams.push(limit, offset);
    const limitParamIdx = queryParams.length - 1;
    const offsetParamIdx = queryParams.length;

    const dataSql = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
             COUNT(DISTINCT r.id) AS total_ratings,
             ${userRatingSelect}
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      ${userJoin}
      ${whereClause}
      GROUP BY s.id ${currentUserId ? ', ur.id, ur.rating' : ''}
      ORDER BY ${sortBy} ${order}
      LIMIT $${limitParamIdx} OFFSET $${offsetParamIdx}
    `;

    const dataResult = await query(dataSql, queryParams);

    return res.status(200).json({
      success: true,
      data: {
        stores: dataResult.rows.map((store) => ({
          ...store,
          avg_rating: parseFloat(store.avg_rating || 0),
          total_ratings: parseInt(store.total_ratings || 0, 10),
          my_rating: store.my_rating ? parseInt(store.my_rating, 10) : null,
          my_rating_id: store.my_rating_id || null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Store Details
 * GET /api/stores/:id
 */
const getStoreById = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id, 10);
    if (isNaN(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid store ID' });
    }

    const currentUserId = req.user ? req.user.id : null;

    const sql = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             u.name AS owner_name, u.email AS owner_email,
             COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
             COUNT(DISTINCT r.id) AS total_ratings,
             ur.rating AS my_rating, ur.id AS my_rating_id
      FROM stores s
      JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $2
      WHERE s.id = $1
      GROUP BY s.id, u.id, ur.id, ur.rating
    `;

    const result = await query(sql, [storeId, currentUserId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const store = result.rows[0];
    return res.status(200).json({
      success: true,
      data: {
        ...store,
        avg_rating: parseFloat(store.avg_rating || 0),
        total_ratings: parseInt(store.total_ratings || 0, 10),
        my_rating: store.my_rating ? parseInt(store.my_rating, 10) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  getStoreById,
};
