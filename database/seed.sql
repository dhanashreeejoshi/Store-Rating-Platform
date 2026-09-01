-- Store Rating Platform Seed Data
-- Common password for all test accounts: Password@123
-- Bcrypt hash generated with 10 salt rounds: $2a$10$00Dw/fcMkSi3J0a/SNVN4.Ce/2sFAzmLVMFb.YVRqJTqspdjeR.la

-- Clear existing data (in correct foreign key order)
TRUNCATE TABLE ratings, stores, users RESTART IDENTITY CASCADE;

-- 1. Insert Users (1 Admin, 2 Store Owners, 5 Normal Users)
-- Note: Names are between 20 and 60 characters to satisfy validation rules
INSERT INTO users (id, name, email, password, address, role, created_at, updated_at) VALUES
(1, 'System Administrator Account', 'admin@example.com', '$2a$10$00Dw/fcMkSi3J0a/SNVN4.Ce/2sFAzmLVMFb.YVRqJTqspdjeR.la', 'Suite 100, Admin Complex, Metro City, MH - 400001', 'ADMIN', NOW(), NOW()),
(2, 'Rajesh Kumar Store Owner', 'owner1@example.com', '$2a$10$00Dw/fcMkSi3J0a/SNVN4.Ce/2sFAzmLVMFb.YVRqJTqspdjeR.la', 'Shop 12, Commercial Market, FC Road, Pune, MH - 411004', 'STORE_OWNER', NOW(), NOW()),
(3, 'Priya Sharma Store Owner', 'owner2@example.com', '$2a$10$00Dw/fcMkSi3J0a/SNVN4.Ce/2sFAzmLVMFb.YVRqJTqspdjeR.la', 'Unit 45, High Street Mall, Senapati Bapat Marg, Mumbai, MH - 400013', 'STORE_OWNER', NOW(), NOW()),
(4, 'Rahul Ramesh Sharma Customer', 'user1@example.com', '$2a$10$00Dw/fcMkSi3J0a/SNVN4.Ce/2sFAzmLVMFb.YVRqJTqspdjeR.la', 'Flat 402, Sunshine Apartments, Indiranagar, Bengaluru, KA - 560038', 'USER', NOW(), NOW()),
(5, 'Amit Suresh Patil Customer', 'user2@example.com', '$2a$10$00Dw/fcMkSi3J0a/SNVN4.Ce/2sFAzmLVMFb.YVRqJTqspdjeR.la', 'B-14, Green Park Society, Kothrud, Pune, MH - 411038', 'USER', NOW(), NOW()),
(6, 'Sneha Deepak Joshi Customer', 'user3@example.com', '$2a$10$00Dw/fcMkSi3J0a/SNVN4.Ce/2sFAzmLVMFb.YVRqJTqspdjeR.la', 'Block C-201, Silver Crest, HITEC City, Hyderabad, TS - 500081', 'USER', NOW(), NOW()),
(7, 'Ananya Sunil Rao Customer', 'user4@example.com', '$2a$10$00Dw/fcMkSi3J0a/SNVN4.Ce/2sFAzmLVMFb.YVRqJTqspdjeR.la', '77 Lakeview Road, Nungambakkam, Chennai, TN - 600034', 'USER', NOW(), NOW()),
(8, 'Vikram Ajay Deshmukh User', 'user5@example.com', '$2a$10$00Dw/fcMkSi3J0a/SNVN4.Ce/2sFAzmLVMFb.YVRqJTqspdjeR.la', '10 Hill View Lane, Bandra West, Mumbai, MH - 400050', 'USER', NOW(), NOW());

-- Reset users sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. Insert Stores (5 Stores assigned to Store Owners)
INSERT INTO stores (id, name, email, address, owner_id, created_at, updated_at) VALUES
(1, 'Apex Electronics Hub', 'contact@apexelectronics.com', '101 Tech Park Road, Whitefield, Bengaluru, KA - 560066', 2, NOW(), NOW()),
(2, 'Green Valley Organic Market', 'hello@greenvalleymarket.com', '14 Farm Fresh Lane, Baner, Pune, MH - 411045', 2, NOW(), NOW()),
(3, 'Metro Bookstore & Cafe', 'info@metrobookstore.com', '88 Central Avenue, Fort, Mumbai, MH - 400001', 2, NOW(), NOW()),
(4, 'Urban Style Clothing Studio', 'support@urbanstyle.com', '22 Fashion Boulevard, Jubilee Hills, Hyderabad, TS - 500033', 3, NOW(), NOW()),
(5, 'Sunrise Medical & Pharmacy', 'care@sunrisemedical.com', '55 Health Care Ring Road, Anna Nagar, Chennai, TN - 600040', 3, NOW(), NOW());

-- Reset stores sequence
SELECT setval('stores_id_seq', (SELECT MAX(id) FROM stores));

-- 3. Insert Ratings
INSERT INTO ratings (user_id, store_id, rating, created_at, updated_at) VALUES
(4, 1, 5, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(4, 2, 4, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(4, 4, 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(5, 1, 4, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(5, 3, 5, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(5, 5, 4, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(6, 1, 5, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
(6, 2, 5, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(6, 3, 4, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(7, 2, 3, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(7, 4, 4, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(7, 5, 5, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(8, 3, 4, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(8, 4, 5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(8, 5, 4, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');
