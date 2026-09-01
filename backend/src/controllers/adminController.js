const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

/**
 * Get Admin Dashboard Statistics
 * GET /api/admin/stats
 */
const getStats = async (req, res, next) => {
  try {
    const usersCountResult = await query('SELECT COUNT(*) AS total FROM users');
    const storesCountResult = await query('SELECT COUNT(*) AS total FROM stores');
    const ratingsCountResult = await query('SELECT COUNT(*) AS total FROM ratings');

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: parseInt(usersCountResult.rows[0]?.total || '0', 10),
        totalStores: parseInt(storesCountResult.rows[0]?.total || '0', 10),
        totalRatings: parseInt(ratingsCountResult.rows[0]?.total || '0', 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Users with Search, Role Filter, Sorting and Pagination
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10', 10)));
    const offset = (page - 1) * limit;

    const search = req.query.search ? `%${req.query.search.trim()}%` : null;
    const role = req.query.role && ['ADMIN', 'USER', 'STORE_OWNER'].includes(req.query.role) ? req.query.role : null;

    // Allowed sort columns
    const allowedSortFields = {
      name: 'name',
      email: 'email',
      address: 'address',
      role: 'role',
      created_at: 'created_at',
    };
    const sortBy = allowedSortFields[req.query.sortBy] || 'created_at';
    const order = req.query.order && req.query.order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Build WHERE clause
    const conditions = [];
    const params = [];

    if (search) {
      params.push(search);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length} OR address ILIKE $${params.length})`);
    }

    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matching records
    const countSql = `SELECT COUNT(*) AS total FROM users ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);
    const totalPages = Math.ceil(total / limit) || 1;

    // Query records with pagination and sorting
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT id, name, email, address, role, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY ${sortBy} ${order}
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;

    const dataResult = await query(dataSql, dataParams);

    return res.status(200).json({
      success: true,
      data: {
        users: dataResult.rows,
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
 * Get User Details by ID
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const userResult = await query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userResult.rows[0];

    // If store owner, get stores owned
    if (user.role === 'STORE_OWNER') {
      const storesResult = await query(
        `SELECT s.id, s.name, s.email, s.address,
                COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
                COUNT(r.id) AS total_ratings
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = $1
         GROUP BY s.id`,
        [userId]
      );
      user.stores = storesResult.rows;
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new User (Admin can create ADMIN, STORE_OWNER, or USER)
 * POST /api/admin/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password, address, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, address, role, created_at`,
      [name, email.toLowerCase(), hashedPassword, address || null, role]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Stores for Admin with Search, Sorting, Calculated Rating and Pagination
 * GET /api/admin/stores
 */
const getStores = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10', 10)));
    const offset = (page - 1) * limit;

    const search = req.query.search ? `%${req.query.search.trim()}%` : null;

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
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
      conditions.push(`(s.name ILIKE $${params.length} OR s.email ILIKE $${params.length} OR s.address ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total stores count
    const countSql = `SELECT COUNT(*) AS total FROM stores s ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch stores with owner information and calculated average rating
    const dataParams = [...params, limit, offset];
    const dataSql = `
      SELECT s.id, s.name, s.email, s.address, s.created_at, s.owner_id,
             u.name AS owner_name, u.email AS owner_email,
             COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
             COUNT(r.id) AS total_ratings
      FROM stores s
      JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id, u.id
      ORDER BY ${sortBy} ${order}
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;

    const dataResult = await query(dataSql, dataParams);

    return res.status(200).json({
      success: true,
      data: {
        stores: dataResult.rows.map((store) => ({
          ...store,
          avg_rating: parseFloat(store.avg_rating || 0),
          total_ratings: parseInt(store.total_ratings || 0, 10),
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
 * Create a new Store
 * POST /api/admin/stores
 */
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Verify owner exists and has STORE_OWNER role
    const ownerResult = await query('SELECT id, role FROM users WHERE id = $1', [owner_id]);
    if (ownerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Specified owner not found.',
      });
    }

    if (ownerResult.rows[0].role !== 'STORE_OWNER') {
      return res.status(400).json({
        success: false,
        message: 'The selected user must have the STORE_OWNER role.',
      });
    }

    const result = await query(
      `INSERT INTO stores (name, email, address, owner_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [name, email.toLowerCase(), address, owner_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
};
