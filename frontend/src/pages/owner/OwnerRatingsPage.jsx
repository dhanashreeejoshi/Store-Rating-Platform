import React, { useState, useEffect } from 'react';
import { ownerService } from '../../services/ownerService';
import StarRating from '../../components/StarRating';
import Alert from '../../components/Alert';
import { MessageSquare, Star, Filter } from 'lucide-react';

const OwnerRatingsPage = () => {
  const [ratings, setRatings] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedStoreId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, ratingsRes] = await Promise.all([
        ownerService.getDashboard(),
        ownerService.getRatings(selectedStoreId || null),
      ]);

      if (dashRes.success && dashRes.data) {
        setStores(dashRes.data.stores || []);
      }

      if (ratingsRes.success && ratingsRes.data) {
        setRatings(ratingsRes.data.ratings || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch customer ratings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Customer Ratings & Reviews</h1>
          <p>Detailed breakdown of ratings left by customers for your store(s)</p>
        </div>

        {stores.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
            <select
              className="select"
              style={{ width: 'auto', minWidth: '200px' }}
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
            >
              <option value="">All My Stores</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Customer Email</th>
              <th>Store Name</th>
              <th>Rating Given</th>
              <th>Date of Rating</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                  Loading customer ratings...
                </td>
              </tr>
            ) : ratings.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                  No customer ratings found for your store(s) yet.
                </td>
              </tr>
            ) : (
              ratings.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{r.user_name}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{r.user_email}</td>
                  <td>{r.store_name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <StarRating rating={r.rating} size={16} />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.rating} ★</span>
                    </div>
                  </td>
                  <td>
                    {new Date(r.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerRatingsPage;
