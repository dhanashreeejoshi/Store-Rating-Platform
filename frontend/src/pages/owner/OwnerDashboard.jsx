import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ownerService } from '../../services/ownerService';
import StarRating from '../../components/StarRating';
import Alert from '../../components/Alert';
import { Store, Star, MessageSquare, ArrowRight, MapPin, Mail } from 'lucide-react';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentRatings, setRecentRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, ratingsRes] = await Promise.all([
        ownerService.getDashboard(),
        ownerService.getRatings(),
      ]);

      if (dashRes.success && dashRes.data) {
        setDashboardData(dashRes.data);
      }

      if (ratingsRes.success && ratingsRes.data) {
        setRecentRatings(ratingsRes.data.ratings.slice(0, 5));
      }
    } catch (err) {
      setError(err.message || 'Failed to load store owner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
        Loading your store information...
      </div>
    );
  }

  const stores = dashboardData?.stores || [];
  const primaryStore = dashboardData?.primaryStore;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Store Owner Dashboard</h1>
          <p>Monitor customer ratings and performance for your stores</p>
        </div>
        <Link to="/owner/ratings" className="btn btn-primary btn-sm">
          <Star size={16} /> View All Ratings
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {stores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Store size={48} style={{ color: 'var(--color-text-sub)', marginBottom: '1rem' }} />
          <h3>No Stores Assigned Yet</h3>
          <p>Your store owner account is active, but an administrator has not yet assigned a store to your profile.</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Star size={26} fill="#fbbf24" stroke="#fbbf24" />
              </div>
              <div>
                <div className="stat-val">
                  {dashboardData.overallAverageRating > 0
                    ? dashboardData.overallAverageRating.toFixed(1)
                    : '0.0'}
                </div>
                <div className="stat-label">Average Store Rating</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <MessageSquare size={26} />
              </div>
              <div>
                <div className="stat-val">{dashboardData.totalRatingsCount}</div>
                <div className="stat-label">Total Customer Reviews</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Store size={26} />
              </div>
              <div>
                <div className="stat-val">{stores.length}</div>
                <div className="stat-label">Stores Managed</div>
              </div>
            </div>
          </div>

          {/* Stores Detail Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {stores.map((st) => (
              <div key={st.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{st.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      <Mail size={14} /> {st.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{st.address}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Store Rating
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <StarRating rating={st.avg_rating} size={16} />
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                        {st.avg_rating > 0 ? st.avg_rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Reviews
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      {st.total_ratings}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Reviews Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Recent Customer Ratings</h3>
              <Link to="/owner/ratings" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {recentRatings.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', padding: '1rem 0' }}>No ratings received yet.</p>
            ) : (
              <div className="table-container" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Customer Email</th>
                      <th>Store</th>
                      <th>Rating</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRatings.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.user_name}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{r.user_email}</td>
                        <td>{r.store_name}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <StarRating rating={r.rating} size={15} />
                            <span style={{ fontWeight: 600 }}>{r.rating} ★</span>
                          </div>
                        </td>
                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
