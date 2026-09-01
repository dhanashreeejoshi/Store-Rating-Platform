import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, LogOut, KeyRound, User as UserIcon } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin">Admin</span>;
      case 'STORE_OWNER':
        return <span className="badge badge-owner">Store Owner</span>;
      case 'USER':
        return <span className="badge badge-user">User</span>;
      default:
        return null;
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'STORE_OWNER') return '/owner';
    return '/user';
  };

  return (
    <>
      <header className="navbar">
        <Link to={getDashboardLink()} className="brand">
          <Store size={26} />
          <span>StoreRating</span>
        </Link>

        <div className="nav-user">
          {isAuthenticated && user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getRoleBadge(user.role)}
                <span style={{ fontWeight: 500, fontSize: '0.9rem', color: '#334155' }}>
                  {user.name?.split(' ')[0] || user.name}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsPasswordModalOpen(true)}
                title="Change Password"
                style={{ padding: '0.35rem 0.65rem' }}
              >
                <KeyRound size={15} />
                <span style={{ display: 'none', md: 'inline' }}>Password</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
                title="Logout"
                style={{ padding: '0.35rem 0.65rem' }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {isPasswordModalOpen && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
