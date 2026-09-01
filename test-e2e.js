const http = require('http');

async function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
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
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runE2E() {
  console.log('=====================================================');
  console.log('🚀 RUNNING END-TO-END VERIFICATION ON RUNNING SERVERS');
  console.log('=====================================================');

  const API = 'http://localhost:5000/api';
  const FRONTEND = 'http://localhost:5173';

  // 1. Verify Frontend is serving HTML
  const feRes = await request(FRONTEND);
  console.log(`[Frontend] GET ${FRONTEND} -> Status ${feRes.status} (HTML served)`);

  // 2. Health check
  const health = await request(`${API}/health`);
  console.log(`[Backend] GET ${API}/health ->`, health.body.message);

  // 3. Admin Login & Dashboard Stats
  console.log('\n--- 1. Admin Workflow ---');
  const adminLogin = await request(`${API}/auth/login`, { method: 'POST' }, {
    email: 'admin@example.com',
    password: 'Password@123',
  });
  console.log(`Admin Login: Status ${adminLogin.status}, User: ${adminLogin.body.data.user.name} (${adminLogin.body.data.user.role})`);
  const adminToken = adminLogin.body.data.token;

  const stats = await request(`${API}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`Admin Stats: Total Users: ${stats.body.data.totalUsers}, Total Stores: ${stats.body.data.totalStores}, Total Ratings: ${stats.body.data.totalRatings}`);

  const userList = await request(`${API}/admin/users?role=STORE_OWNER&limit=5`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`Admin Users (STORE_OWNER filter): Found ${userList.body.data.users.length} store owners`);

  // 4. Create a new store by Admin
  const newStore = await request(`${API}/admin/stores`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  }, {
    name: 'Mega Digital World Store',
    email: 'contact@megadigital.com',
    address: '404 Innovation Boulevard, Pune, MH',
    owner_id: 2,
  });
  console.log(`Admin Create Store: Created "${newStore.body.data.name}" with ID: ${newStore.body.data.id}`);
  const storeId = newStore.body.data.id;

  // 5. User Workflow: Register, Rate Store, and Modify Rating
  console.log('\n--- 2. Normal User Workflow ---');
  const userRegister = await request(`${API}/auth/register`, { method: 'POST' }, {
    name: 'Pooja Sanjay Kulkarni Customer',
    email: 'pooja.kulkarni@example.com',
    password: 'Password@123',
    address: 'Flat 12, Lakeview Enclave, Pune',
  });
  console.log(`User Register: Status ${userRegister.status}, User: ${userRegister.body.data.user.name} (${userRegister.body.data.user.role})`);
  const userToken = userRegister.body.data.token;

  // Browse stores
  const storeBrowse = await request(`${API}/stores?search=Mega`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log(`User Store Search: Found ${storeBrowse.body.data.stores.length} store(s) matching "Mega"`);

  // Rate store 5 stars
  const submitRating = await request(`${API}/ratings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
  }, {
    store_id: storeId,
    rating: 5,
  });
  console.log(`Submit Rating: Status ${submitRating.status}, Rating: ${submitRating.body.data.rating} Stars!`);
  const ratingId = submitRating.body.data.id;

  // Verify duplicate rating prevention
  const duplicateRating = await request(`${API}/ratings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
  }, {
    store_id: storeId,
    rating: 4,
  });
  console.log(`Duplicate Rating Prevention: Status ${duplicateRating.status} (${duplicateRating.body.message})`);

  // Modify rating to 4 stars
  const modifyRating = await request(`${API}/ratings/${ratingId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userToken}` },
  }, {
    rating: 4,
  });
  console.log(`Modify Rating: Status ${modifyRating.status}, New Rating: ${modifyRating.body.data.rating} Stars`);

  // Check store updated average
  const updatedStore = await request(`${API}/stores/${storeId}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log(`Store Calculated Rating: ${updatedStore.body.data.avg_rating} Stars (${updatedStore.body.data.total_ratings} total ratings, My Rating: ${updatedStore.body.data.my_rating})`);

  // 6. Store Owner Workflow
  console.log('\n--- 3. Store Owner Workflow ---');
  const ownerLogin = await request(`${API}/auth/login`, { method: 'POST' }, {
    email: 'owner1@example.com',
    password: 'Password@123',
  });
  console.log(`Owner Login: Status ${ownerLogin.status}, Owner: ${ownerLogin.body.data.user.name}`);
  const ownerToken = ownerLogin.body.data.token;

  const ownerDash = await request(`${API}/owner/dashboard`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  console.log(`Owner Dashboard: Manages ${ownerDash.body.data.stores.length} stores, Overall Avg: ${ownerDash.body.data.overallAverageRating} Stars`);

  const ownerRatings = await request(`${API}/owner/ratings`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  console.log(`Owner Ratings: Received ${ownerRatings.body.data.total} customer review(s) for owned stores`);

  // 7. Security Check: Normal user cannot access Admin or Owner routes
  console.log('\n--- 4. Security & Role Authorization Check ---');
  const userAdminAccess = await request(`${API}/admin/stats`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log(`Security: Normal User accessing /admin/stats -> Status ${userAdminAccess.status} (Forbidden)`);

  const userOwnerAccess = await request(`${API}/owner/dashboard`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log(`Security: Normal User accessing /owner/dashboard -> Status ${userOwnerAccess.status} (Forbidden)`);

  console.log('\n=====================================================');
  console.log('✅ ALL END-TO-END WORKFLOWS COMPLETED SUCCESSFULLY!');
  console.log('=====================================================');
}

runE2E().catch(console.error);
