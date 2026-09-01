const http = require('http');
const app = require('./src/app');
const { initDb } = require('./src/config/db');

async function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: server.address().port,
        path: options.path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION TESTS ---');
  await initDb(true);

  const server = http.createServer(app);
  await new Promise((res) => server.listen(0, '127.0.0.1', res));
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Healthcheck
    const health = await makeRequest(server, { path: '/api/health' });
    assert(health.status === 200 && health.body.success === true, 'Health check returns 200');

    // 2. Login Admin
    const adminLogin = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, {
      email: 'admin@example.com',
      password: 'Password@123',
    });
    assert(adminLogin.status === 200 && adminLogin.body.data.user.role === 'ADMIN', 'Admin login succeeds with ADMIN role');
    const adminToken = adminLogin.body.data.token;

    // 3. Login Store Owner
    const ownerLogin = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, {
      email: 'owner1@example.com',
      password: 'Password@123',
    });
    assert(ownerLogin.status === 200 && ownerLogin.body.data.user.role === 'STORE_OWNER', 'Owner login succeeds with STORE_OWNER role');
    const ownerToken = ownerLogin.body.data.token;

    // 4. Login User
    const userLogin = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, {
      email: 'user1@example.com',
      password: 'Password@123',
    });
    assert(userLogin.status === 200 && userLogin.body.data.user.role === 'USER', 'User login succeeds with USER role');
    const userToken = userLogin.body.data.token;

    // 5. Register New User (Must create USER role)
    const newRegister = await makeRequest(server, { path: '/api/auth/register', method: 'POST' }, {
      name: 'Test New Registered Account',
      email: 'newuser@example.com',
      password: 'Password@123',
      address: '100 New User Street, Pune',
    });
    assert(newRegister.status === 201 && newRegister.body.data.user.role === 'USER', 'Public register creates USER role');
    const newRegisteredToken = newRegister.body.data.token;

    // 6. Test Public Register validation (short password / short name)
    const invalidRegister = await makeRequest(server, { path: '/api/auth/register', method: 'POST' }, {
      name: 'Short Name',
      email: 'invalid@example.com',
      password: 'pass',
    });
    assert(invalidRegister.status === 400 && invalidRegister.body.success === false, 'Validation rejects short name and weak password');

    // 7. Admin Stats
    const stats = await makeRequest(server, {
      path: '/api/admin/stats',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(stats.status === 200 && stats.body.data.totalUsers >= 8 && stats.body.data.totalStores >= 5, 'Admin stats return accurate DB counts');

    // 8. Role Authorization check: Normal user cannot access Admin stats
    const forbiddenStats = await makeRequest(server, {
      path: '/api/admin/stats',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(forbiddenStats.status === 403, 'Normal user receives 403 on admin routes');

    // 9. Admin User Management with search and filter
    const adminUsers = await makeRequest(server, {
      path: '/api/admin/users?role=STORE_OWNER',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminUsers.status === 200 && adminUsers.body.data.users.length === 2, 'Admin filter by role works');

    // 10. Admin Create Store
    const createStoreRes = await makeRequest(server, {
      path: '/api/admin/stores',
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, {
      name: 'Prime Gadgets & Mobiles',
      email: 'info@primegadgets.com',
      address: '99 Tech Street, Bengaluru',
      owner_id: 2,
    });
    assert(createStoreRes.status === 201 && createStoreRes.body.data.name === 'Prime Gadgets & Mobiles', 'Admin can create new store');
    const createdStoreId = createStoreRes.body.data.id;

    // 11. Stores List with Ratings
    const storesList = await makeRequest(server, {
      path: '/api/stores',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(storesList.status === 200 && storesList.body.data.stores.length >= 5, 'User can view store list with average ratings');

    // 12. Rate a store as newly registered user
    const rateRes = await makeRequest(server, {
      path: '/api/ratings',
      method: 'POST',
      headers: { Authorization: `Bearer ${newRegisteredToken}` },
    }, {
      store_id: createdStoreId,
      rating: 5,
    });
    assert(rateRes.status === 201 && rateRes.body.data.rating === 5, 'User can submit 5-star rating');
    const createdRatingId = rateRes.body.data.id;

    // 13. Duplicate rating check: Cannot rate same store twice
    const duplicateRateRes = await makeRequest(server, {
      path: '/api/ratings',
      method: 'POST',
      headers: { Authorization: `Bearer ${newRegisteredToken}` },
    }, {
      store_id: createdStoreId,
      rating: 4,
    });
    assert(duplicateRateRes.status === 409, 'User cannot submit duplicate rating for same store');

    // 14. Modify own rating
    const modifyRatingRes = await makeRequest(server, {
      path: `/api/ratings/${createdRatingId}`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${newRegisteredToken}` },
    }, {
      rating: 4,
    });
    assert(modifyRatingRes.status === 200 && modifyRatingRes.body.data.rating === 4, 'User can modify their own rating');

    // 15. Security Check: Other user cannot modify another user's rating
    const unauthorizedModify = await makeRequest(server, {
      path: `/api/ratings/${createdRatingId}`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
    }, {
      rating: 1,
    });
    assert(unauthorizedModify.status === 403, 'User cannot modify another user\'s rating (403 Forbidden)');

    // 16. Owner Dashboard
    const ownerDash = await makeRequest(server, {
      path: '/api/owner/dashboard',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(ownerDash.status === 200 && ownerDash.body.data.stores.length >= 1, 'Owner can view own store dashboard');

    // 17. Owner Ratings
    const ownerRatings = await makeRequest(server, {
      path: '/api/owner/ratings',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(ownerRatings.status === 200 && ownerRatings.body.data.ratings.length > 0, 'Owner can view ratings for their own store');

    // 18. Change password
    const changePassRes = await makeRequest(server, {
      path: '/api/auth/password',
      method: 'PUT',
      headers: { Authorization: `Bearer ${newRegisteredToken}` },
    }, {
      oldPassword: 'Password@123',
      newPassword: 'NewPassword@2026',
    });
    assert(changePassRes.status === 200 && changePassRes.body.success === true, 'User can change password');

    // 19. Login with new password
    const newPassLogin = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, {
      email: 'newuser@example.com',
      password: 'NewPassword@2026',
    });
    assert(newPassLogin.status === 200 && newPassLogin.body.success === true, 'Login with updated password succeeds');

    console.log(`\n--- TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
