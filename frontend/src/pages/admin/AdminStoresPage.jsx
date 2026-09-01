import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import StarRating from '../../components/StarRating';
import { Search, PlusCircle, ArrowUpDown, ArrowUp, ArrowDown, Store as StoreIcon } from 'lucide-react';

const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Store Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [owners, setOwners] = useState([]);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchStores(1);
  }, [sortBy, order]);

  useEffect(() => {
    if (isAddModalOpen) {
      loadOwners();
    }
  }, [isAddModalOpen]);

  const fetchStores = async (pageToFetch = pagination.page) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getStores({
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

  const loadOwners = async () => {
    try {
      const res = await adminService.getUsers({ role: 'STORE_OWNER', limit: 100 });
      if (res.success && res.data) {
        setOwners(res.data.users);
        if (res.data.users.length > 0 && !addFormData.owner_id) {
          setAddFormData((prev) => ({ ...prev, owner_id: res.data.users[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load store owners:', err);
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

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!addFormData.name.trim()) {
      setAddError('Store name is required.');
      return;
    }

    if (!addFormData.email.trim()) {
      setAddError('Store email is required.');
      return;
    }

    if (!addFormData.address.trim()) {
      setAddError('Store address is required.');
      return;
    }

    if (!addFormData.owner_id) {
      setAddError('Please select a valid store owner.');
      return;
    }

    setAddLoading(true);
    try {
      const res = await adminService.createStore({
        name: addFormData.name.trim(),
        email: addFormData.email.trim(),
        address: addFormData.address.trim(),
        owner_id: parseInt(addFormData.owner_id, 10),
      });

      if (res.success) {
        setSuccess(`Store "${res.data.name}" added successfully!`);
        setIsAddModalOpen(false);
        setAddFormData({ name: '', email: '', address: '', owner_id: '' });
        fetchStores(1);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setAddError(err.message || 'Failed to create store.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Store Management</h1>
          <p>Manage all registered stores, owner assignments, and ratings</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          <PlusCircle size={16} /> Add Store
        </button>
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
              placeholder="Search store name, email, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
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

      {/* Stores Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('name')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Store Name {renderSortIcon('name')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('email')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Email {renderSortIcon('email')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('address')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Address {renderSortIcon('address')}
                </div>
              </th>
              <th>Assigned Owner</th>
              <th className="sortable" onClick={() => handleSort('rating')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Overall Rating {renderSortIcon('rating')}
                </div>
              </th>
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
                  <td style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{s.name}</td>
                  <td>{s.email}</td>
                  <td style={{ maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.address}>
                    {s.address}
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.owner_name}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>{s.owner_email}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StarRating rating={s.avg_rating} size={15} />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {s.avg_rating > 0 ? s.avg_rating.toFixed(1) : 'No ratings'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        ({s.total_ratings})
                      </span>
                    </div>
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

      {/* Add Store Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Store"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAddModalOpen(false)}
              disabled={addLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreateStore}
              disabled={addLoading}
            >
              {addLoading ? 'Adding...' : 'Add Store'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateStore}>
          {addError && <Alert type="error" message={addError} onClose={() => setAddError('')} />}

          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Apex Electronics Hub"
              value={addFormData.name}
              onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Contact Email</label>
            <input
              type="email"
              className="input"
              required
              placeholder="contact@store.com"
              value={addFormData.email}
              onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Address</label>
            <textarea
              className="textarea"
              rows={2}
              required
              placeholder="Street, Landmark, City, State - PIN"
              value={addFormData.address}
              onChange={(e) => setAddFormData({ ...addFormData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Owner (STORE_OWNER role)</label>
            {owners.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-danger)' }}>
                No Store Owners available. Please create a user with role STORE_OWNER first in User Management.
              </p>
            ) : (
              <select
                className="select"
                required
                value={addFormData.owner_id}
                onChange={(e) => setAddFormData({ ...addFormData, owner_id: e.target.value })}
              >
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStoresPage;
