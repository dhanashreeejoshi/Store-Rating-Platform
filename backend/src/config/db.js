const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
let pgliteInstance = null;
let isPglite = false;

/**
 * Initialize Database Connection
 * Tries external PostgreSQL first (via pg.Pool / DATABASE_URL).
 * If PostgreSQL server is unavailable, falls back to embedded PGlite
 * to ensure seamless local operation with 100% genuine PostgreSQL engine.
 */
async function getDbClient() {
  if (pool) return { isPglite: false, client: pool };
  if (pgliteInstance) return { isPglite: true, client: pgliteInstance };

  // Try standard PostgreSQL pool first
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('localhost:5432')) {
    try {
      const candidatePool = new Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
      await candidatePool.query('SELECT 1');
      console.log(' Connected to PostgreSQL server via connection string.');
      pool = candidatePool;
      return { isPglite: false, client: pool };
    } catch (err) {
      console.warn(' External PostgreSQL connection failed, checking local database:', err.message);
    }
  }

  // Attempt local PG default connection
  try {
    const localPool = new Pool({
      connectionString: dbUrl || 'postgresql://postgres:postgres@localhost:5432/store_rating_db',
      connectionTimeoutMillis: 2000,
    });
    await localPool.query('SELECT 1');
    console.log(' Connected to local PostgreSQL server.');
    pool = localPool;
    return { isPglite: false, client: pool };
  } catch (err) {
    // If local postgres daemon is not running, use embedded PGlite for self-contained execution
    console.log('ℹ Local PostgreSQL daemon not detected. Using embedded PostgreSQL engine (PGlite)...');
    const { PGlite } = require('@electric-sql/pglite');
    const dataDir = path.join(__dirname, '..', '..', 'data', 'pgdata');
    if (!fs.existsSync(path.dirname(dataDir))) {
      fs.mkdirSync(path.dirname(dataDir), { recursive: true });
    }
    pgliteInstance = new PGlite(dataDir);
    isPglite = true;
    console.log(' Embedded PostgreSQL engine initialized.');
    return { isPglite: true, client: pgliteInstance };
  }
}

/**
 * Execute parameterized query
 * Returns { rows: [...], rowCount: number }
 */
async function query(text, params = []) {
  const { isPglite: pgliteActive, client } = await getDbClient();

  if (!pgliteActive) {
    const res = await client.query(text, params);
    return res;
  } else {
    // PGlite query execution
    const res = await client.query(text, params);
    return {
      rows: res.rows || [],
      rowCount: res.affectedRows !== undefined ? res.affectedRows : (res.rows ? res.rows.length : 0),
    };
  }
}

/**
 * Initialize Database Schema and Seed Data if needed
 */
async function initDb(forceSeed = false) {
  try {
    const { isPglite: pgliteActive, client } = await getDbClient();
    const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
    const seedPath = path.join(__dirname, '..', '..', '..', 'database', 'seed.sql');

    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      if (pgliteActive) {
        await client.exec(schemaSql);
      } else {
        await client.query(schemaSql);
      }
      console.log(' Database schema applied successfully.');
    }

    // Check if users exist, otherwise apply seed data
    const userCheck = await query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(userCheck.rows[0]?.count || '0', 10);

    if (userCount === 0 || forceSeed) {
      if (fs.existsSync(seedPath)) {
        console.log(' Seeding initial data into database...');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        if (pgliteActive) {
          await client.exec(seedSql);
        } else {
          await client.query(seedSql);
        }
        console.log(' Seed data inserted successfully.');
      }
    } else {
      console.log(`ℹ Database already populated with ${userCount} users.`);
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

module.exports = {
  query,
  initDb,
  getDbClient,
};
