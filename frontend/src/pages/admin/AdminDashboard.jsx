import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Users, Store, Star, UserPlus, PlusCircle, ArrowRight } from 'lucide-react';
import Alert from '../../components/Alert';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>System overview and management console</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/users" className="btn btn-secondary btn-sm">
            <Users size={16} /> Manage Users
          </Link>
          <Link to="/admin/stores" className="btn btn-primary btn-sm">
            <Store size={16} /> Manage Stores
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : stats.totalUsers}</div>
            <div className="stat-label">Total Registered Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Store size={26} />
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : stats.totalStores}</div>
            <div className="stat-label">Total Stores Managed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Star size={26} />
          </div>
          <div>
            <div className="stat-val">{loading ? '...' : stats.totalRatings}</div>
            <div className="stat-label">Total Ratings Submitted</div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--color-primary-light)', borderRadius: '8px', color: 'var(--color-primary)' }}>
              <Users size={20} />
            </div>
            <h3 style={{ margin: 0 }}>User Management</h3>
          </div>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Search, filter by role (Admin, User, Store Owner), sort, and register new accounts directly into PostgreSQL.
          </p>
          <Link to="/admin/users" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            Go to User Management <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: '#fef3c7', borderRadius: '8px', color: '#b45309' }}>
              <Store size={20} />
            </div>
            <h3 style={{ margin: 0 }}>Store Management</h3>
          </div>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Create new stores, assign them to verified Store Owners, and monitor average star ratings calculated dynamically.
          </p>
          <Link to="/admin/stores" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            Go to Store Management <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
