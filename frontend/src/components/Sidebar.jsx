import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'ADMIN') {
    return (
      <aside className="sidebar">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Manage Users</span>
        </NavLink>
        <NavLink
          to="/admin/stores"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Store size={18} />
          <span>Manage Stores</span>
        </NavLink>
      </aside>
    );
  }

  if (user.role === 'STORE_OWNER') {
    return (
      <aside className="sidebar">
        <NavLink
          to="/owner"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Store Overview</span>
        </NavLink>
        <NavLink
          to="/owner/ratings"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Star size={18} />
          <span>Customer Ratings</span>
        </NavLink>
      </aside>
    );
  }

  return null;
};

export default Sidebar;
