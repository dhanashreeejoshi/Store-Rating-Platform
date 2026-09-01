const { initDb } = require('./db');

async function run() {
  try {
    console.log('--- Initializing Store Rating Platform Database ---');
    await initDb(true);
    console.log('✅ Database initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

run();
