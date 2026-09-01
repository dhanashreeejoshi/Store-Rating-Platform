import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Components
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// Public Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import NotFoundPage from '../pages/NotFoundPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminStoresPage from '../pages/admin/AdminStoresPage';

// User Pages
import UserDashboard from '../pages/user/UserDashboard';

// Store Owner Pages
import OwnerDashboard from '../pages/owner/OwnerDashboard';
import OwnerRatingsPage from '../pages/owner/OwnerRatingsPage';

// Layout wrappers
const AdminLayout = () => (
  <div className="app-layout">
    <Navbar />
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <ProtectedRoute allowedRoles={['ADMIN']} />
      </main>
    </div>
  </div>
);

const OwnerLayout = () => (
  <div className="app-layout">
    <Navbar />
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <ProtectedRoute allowedRoles={['STORE_OWNER']} />
      </main>
    </div>
  </div>
);

const UserLayout = () => (
  <div className="app-layout">
    <Navbar />
    <main className="main-content">
      <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'STORE_OWNER']} />
    </main>
  </div>
);

const PublicLayout = ({ children }) => (
  <div className="app-layout">
    <Navbar />
    <main className="main-content">{children}</main>
  </div>
);

const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'STORE_OWNER') return <Navigate to="/owner" replace />;
  return <Navigate to="/user" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        }
      />

      {/* Admin Protected Routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/stores" element={<AdminStoresPage />} />
      </Route>

      {/* Store Owner Protected Routes */}
      <Route element={<OwnerLayout />}>
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/owner/ratings" element={<OwnerRatingsPage />} />
      </Route>

      {/* Normal User Protected Routes */}
      <Route element={<UserLayout />}>
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/user/stores" element={<UserDashboard />} />
      </Route>

      {/* Error Pages */}
      <Route
        path="/403"
        element={
          <PublicLayout>
            <ForbiddenPage />
          </PublicLayout>
        }
      />
      <Route
        path="/404"
        element={
          <PublicLayout>
            <NotFoundPage />
          </PublicLayout>
        }
      />
      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFoundPage />
          </PublicLayout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
