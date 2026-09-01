import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForbiddenPage = () => {
  const { user } = useAuth();

  const getHomeLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'STORE_OWNER') return '/owner';
    return '/user';
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: '480px', textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', background: '#fee2e2', borderRadius: '50%', color: '#dc2626', marginBottom: '1rem' }}>
          <ShieldAlert size={48} />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>403 - Access Denied</h1>
        <p style={{ marginBottom: '1.5rem' }}>
          You do not have permission to view or interact with this page. Your role does not grant sufficient access.
        </p>
        <Link to={getHomeLink()} className="btn btn-primary">
          <ArrowLeft size={16} /> Return to My Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
