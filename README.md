# Store Rating Platform

A clean, functional, and modern full-stack web application for discovering and rating stores. Built with **React.js + Vite**, **Node.js + Express.js**, and **PostgreSQL** with parameterized SQL queries, JWT authentication, bcrypt password hashing, and role-based access control.

---

## 🚀 Features

### 1. Unified Authentication & Role-Based Access Control (RBAC)
- Single login system directing users to dedicated dashboards based on role:
  - **ADMIN**: Manage users, add stores, assign store owners, and view platform statistics.
  - **STORE_OWNER**: View owned store metrics, calculated average rating, and customer review breakdown.
  - **USER**: Search and browse stores, view overall ratings, submit 1–5 star reviews, and modify own reviews.
- Public registration strictly creates accounts with role `USER`.
- Protected frontend routes and backend middleware (`authenticate`, `authorizeRole`).

### 2. Live SQL Aggregations & Data Integrity
- Store average ratings are dynamically calculated directly in PostgreSQL using `AVG(ratings.rating)`.
- Database-level constraints: `UNIQUE(user_id, store_id)` prevents duplicate reviews for the same store.
- Users can update their existing rating at any time (`PUT /api/ratings/:id`), with strict backend ownership verification.

### 3. Clean Validation & Security
- **Zod Validation** on both frontend and backend:
  - **Password**: 8–16 characters, $\ge$1 uppercase letter, $\ge$1 special character.
  - **Name**: 20–60 characters.
  - **Address**: $\le$400 characters.
  - **Rating**: Integer between 1 and 5.
- Passwords securely hashed using `bcrypt` (10 salt rounds).
- Safe parameterized queries (`$1, $2`) preventing SQL injection.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM, Axios, Lucide React |
| **Backend** | Node.js, Express.js, CORS, Dotenv |
| **Database** | PostgreSQL (`pg` driver, parameterized queries) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Validation** | Zod |

---

## 📂 Project Structure

```
store-rating-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # PostgreSQL pool & database connection
│   │   │   └── initDb.js      # Database schema and seed initializer
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   ├── storeController.js
│   │   │   ├── ratingController.js
│   │   │   └── ownerController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── validate.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── storeRoutes.js
│   │   │   ├── ratingRoutes.js
│   │   │   └── ownerRoutes.js
│   │   ├── validators/
│   │   │   ├── authValidator.js
│   │   │   ├── adminValidator.js
│   │   │   └── ratingValidator.js
│   │   ├── app.js             # Express app setup and middleware
│   │   └── server.js          # Server bootstrapping
│   ├── .env.example
│   ├── package.json
│   └── test-backend.js        # Backend integration test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StarRating.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── ChangePasswordModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForbiddenPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminUsersPage.jsx
│   │   │   │   └── AdminStoresPage.jsx
│   │   │   ├── user/
│   │   │   │   └── UserDashboard.jsx
│   │   │   └── owner/
│   │   │       ├── OwnerDashboard.jsx
│   │   │       └── OwnerRatingsPage.jsx
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── adminService.js
│   │   │   ├── storeService.js
│   │   │   ├── ratingService.js
│   │   │   └── ownerService.js
│   │   ├── App.jsx
│   │   ├── index.css          # Design system & styles
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   ├── schema.sql             # Table definitions & relational constraints
│   └── seed.sql               # Seed data for testing
│
├── .gitignore
└── README.md
```

---

## 🔑 Test Accounts & Demo Credentials

All test accounts share the common development password: **`Password@123`**

| Role | Email | Password | Description |
|---|---|---|---|
| **ADMIN** | `admin@example.com` | `Password@123` | System Administrator Account |
| **STORE_OWNER** | `owner1@example.com` | `Password@123` | Rajesh Kumar Store Owner |
| **STORE_OWNER** | `owner2@example.com` | `Password@123` | Priya Sharma Store Owner |
| **USER** | `user1@example.com` | `Password@123` | Rahul Ramesh Sharma Customer |
| **USER** | `user2@example.com` | `Password@123` | Amit Suresh Patil Customer |

*(The login page also contains one-click demo login buttons for convenience).*

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/store_rating_db
JWT_SECRET=store_rating_platform_super_secret_key_2026
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Setup & Installation Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (or uses embedded local PostgreSQL engine automatically if standalone PostgreSQL daemon is not running)

### 1. Database Setup
To initialize and seed the database schema:
```bash
cd backend
npm install
npm run db:init
```

### 2. Start the Backend API
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

### 3. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
# App will open on http://localhost:5173
```

---

## 🧪 Testing Backend APIs

Run the automated integration test suite:
```bash
cd backend
node test-backend.js
```
This tests authentication, RBAC authorization, user creation, store creation, rating constraints, duplicate prevention, and owner isolation.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user (always assigned `USER` role).
- `POST /api/auth/login` — Login with email and password, returns JWT token.
- `GET /api/auth/me` — Get current logged-in user profile.
- `PUT /api/auth/password` — Change password (verifies current password).

### Admin (`/api/admin`) *(Requires ADMIN role)*
- `GET /api/admin/stats` — Total users, stores, and ratings counts.
- `GET /api/admin/users` — List users with search, role filter, column sorting, pagination.
- `POST /api/admin/users` — Create any user (`ADMIN`, `STORE_OWNER`, `USER`).
- `GET /api/admin/users/:id` — Get user details and assigned stores.
- `GET /api/admin/stores` — List stores with calculated average rating, owner info, search, sort, pagination.
- `POST /api/admin/stores` — Create a new store assigned to a `STORE_OWNER`.

### Stores & Ratings (`/api/stores`, `/api/ratings`)
- `GET /api/stores` — Browse stores with calculated average ratings and current user's rating.
- `GET /api/stores/:id` — Get specific store details.
- `POST /api/ratings` — Submit a 1–5 star rating (authenticated user).
- `PUT /api/ratings/:id` — Update own rating (authenticated user).
- `GET /api/stores/:id/rating` — Get current user's rating for a specific store.

### Store Owner (`/api/owner`) *(Requires STORE_OWNER role)*
- `GET /api/owner/dashboard` — Get owner's store metrics and average rating.
- `GET /api/owner/ratings` — Get customer ratings for stores owned by the logged-in owner.
- `PUT /api/owner/password` — Store owner change password.
