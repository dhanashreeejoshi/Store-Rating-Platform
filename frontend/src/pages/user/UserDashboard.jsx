import React, { useState, useEffect } from 'react';
import { storeService } from '../../services/storeService';
import { ratingService } from '../../services/ratingService';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination';
import StarRating from '../../components/StarRating';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { Search, Store as StoreIcon, Star, Edit3, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Rate / Modify Modal State
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [isModifying, setIsModifying] = useState(false);
  const [existingRatingId, setExistingRatingId] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState('');

  useEffect(() => {
    fetchStores(1);
  }, [sortBy, order]);

  const fetchStores = async (pageToFetch = pagination.page) => {
    setLoading(true);
    setError('');
    try {
      const res = await storeService.getStores({
        page: pageToFetch,
        limit: 10,
        search: search.trim() || undefined,
        sortBy,
        order,
      });

      if (res.success && res.data) {
        setStores(res.data.stores);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load stores.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStores(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={14} style={{ opacity: 0.4, marginLeft: '4px' }} />;
    return order === 'asc' ? (
      <ArrowUp size={14} style={{ color: 'var(--color-primary)', marginLeft: '4px' }} />
    ) : (
      <ArrowDown size={14} style={{ color: 'var(--color-primary)', marginLeft: '4px' }} />
    );
  };

  const handleOpenRateModal = (store) => {
    setSelectedStore(store);
    setRateError('');

    if (store.my_rating) {
      setIsModifying(true);
      setSelectedRating(store.my_rating);
      setExistingRatingId(store.my_rating_id);
    } else {
      setIsModifying(false);
      setSelectedRating(5);
      setExistingRatingId(null);
    }

    setIsRateModalOpen(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setRateError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setRateLoading(true);
    setRateError('');
    try {
      if (isModifying && existingRatingId) {
        // Modify rating
        const res = await ratingService.updateRating(existingRatingId, selectedRating);
        if (res.success) {
          setSuccess(`Your rating for "${selectedStore.name}" was updated to ${selectedRating} ★!`);
          setIsRateModalOpen(false);
          fetchStores(pagination.page);
          setTimeout(() => setSuccess(''), 3500);
        }
      } else {
        // Create new rating
        const res = await ratingService.createRating(selectedStore.id, selectedRating);
        if (res.success) {
          setSuccess(`Thank you! You rated "${selectedStore.name}" ${selectedRating} ★!`);
          setIsRateModalOpen(false);
          fetchStores(pagination.page);
          setTimeout(() => setSuccess(''), 3500);
        }
      }
    } catch (err) {
      setRateError(err.message || 'Failed to submit rating.');
    } finally {
      setRateLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Explore & Rate Stores</h1>
        <p>Discover local stores, check overall community ratings, and submit or modify your own review</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Search Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} className="toolbar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="input search-input"
              placeholder="Search store name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
            {search && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  fetchStores(1);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Stores List (Table & Card View) */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('name')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Store Name {renderSortIcon('name')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('address')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Address {renderSortIcon('address')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('rating')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Overall Rating {renderSortIcon('rating')}
                </div>
              </th>
              <th>My Rating</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  Loading stores from database...
                </td>
              </tr>
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No stores found.
                </td>
              </tr>
            ) : (
              stores.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '1rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{s.email}</div>
                  </td>
                  <td style={{ maxWidth: '280px' }}>{s.address}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <StarRating rating={s.avg_rating} size={15} />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {s.avg_rating > 0 ? s.avg_rating.toFixed(1) : 'No reviews'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        ({s.total_ratings} {s.total_ratings === 1 ? 'rating' : 'ratings'})
                      </span>
                    </div>
                  </td>
                  <td>
                    {s.my_rating ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                        <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                          {s.my_rating} ★
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-sub)' }}>Not rated</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {s.my_rating ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenRateModal(s)}
                        style={{ padding: '0.35rem 0.75rem' }}
                      >
                        <Edit3 size={14} /> Modify Rating
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenRateModal(s)}
                        style={{ padding: '0.35rem 0.75rem' }}
                      >
                        <Star size={14} /> Rate Store
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={(p) => fetchStores(p)}
      />

      {/* Rate Store Modal */}
      <Modal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        title={isModifying ? `Modify Rating for ${selectedStore?.name}` : `Rate ${selectedStore?.name}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsRateModalOpen(false)}
              disabled={rateLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSubmitRating}
              disabled={rateLoading}
            >
              {rateLoading ? 'Saving...' : isModifying ? 'Update Rating' : 'Submit Rating'}
            </button>
          </>
        }
      >
        {selectedStore && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            {rateError && <Alert type="error" message={rateError} onClose={() => setRateError('')} />}

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{selectedStore.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                {selectedStore.address}
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 500 }}>
                Select your rating (1 to 5 Stars):
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <StarRating
                  rating={selectedRating}
                  interactive={true}
                  size={32}
                  onRate={(val) => setSelectedRating(val)}
                />
              </div>
              <div style={{ marginTop: '0.75rem', fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                {selectedRating} Star{selectedRating > 1 ? 's' : ''}
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {isModifying
                ? 'You can update your previous rating anytime.'
                : 'Each user can submit one rating per store. You can modify it later.'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserDashboard;
