import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { Search, UserPlus, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    address: '',
    role: 'USER',
    password: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // View User Details Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter, sortBy, order]);

  const fetchUsers = async (pageToFetch = pagination.page) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getUsers({
        page: pageToFetch,
        limit: 10,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        sortBy,
        order,
      });

      if (res.success && res.data) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
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

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin">Admin</span>;
      case 'STORE_OWNER':
        return <span className="badge badge-owner">Store Owner</span>;
      case 'USER':
        return <span className="badge badge-user">User</span>;
      default:
        return <span className="badge">{role}</span>;
    }
  };

  const handleOpenDetail = async (userId) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await adminService.getUserById(userId);
      if (res.success) {
        setSelectedUser(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch user details.');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAddError('');

    if (addFormData.name.trim().length < 20 || addFormData.name.trim().length > 60) {
      setAddError('Name must be between 20 and 60 characters.');
      return;
    }

    if (addFormData.password.length < 8 || addFormData.password.length > 16) {
      setAddError('Password must be between 8 and 16 characters.');
      return;
    }

    if (!/[A-Z]/.test(addFormData.password)) {
      setAddError('Password must contain at least one uppercase letter.');
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(addFormData.password)) {
      setAddError('Password must contain at least one special character.');
      return;
    }

    setAddLoading(true);
    try {
      const res = await adminService.createUser({
        name: addFormData.name.trim(),
        email: addFormData.email.trim(),
        address: addFormData.address.trim() || undefined,
        role: addFormData.role,
        password: addFormData.password,
      });

      if (res.success) {
        setSuccess(`User ${res.data.name} created successfully!`);
        setIsAddModalOpen(false);
        setAddFormData({ name: '', email: '', address: '', role: 'USER', password: '' });
        fetchUsers(1);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setAddError(err.message || 'Failed to create user.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>User Management</h1>
          <p>View, filter, search, and create platform users</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Search & Filters Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} className="toolbar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="input search-input"
              placeholder="Search by name, email, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="select"
              style={{ width: 'auto', minWidth: '150px' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="STORE_OWNER">STORE_OWNER</option>
              <option value="USER">USER</option>
            </select>

            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
            {search && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  fetchUsers(1);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('name')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Name {renderSortIcon('name')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('email')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Email {renderSortIcon('email')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('role')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Role {renderSortIcon('role')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('address')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Address {renderSortIcon('address')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('created_at')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Joined Date {renderSortIcon('created_at')}
                </div>
              </th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  Loading users from database...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={u.address || 'N/A'}>
                    {u.address || '—'}
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenDetail(u.id)}
                      title="View Details"
                      style={{ padding: '0.3rem 0.6rem' }}
                    >
                      <Eye size={14} /> View
                    </button>
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
        onPageChange={(p) => fetchUsers(p)}
      />

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
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
              onClick={handleCreateUser}
              disabled={addLoading}
            >
              {addLoading ? 'Creating...' : 'Create User'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateUser}>
          {addError && <Alert type="error" message={addError} onClose={() => setAddError('')} />}

          <div className="form-group">
            <label className="form-label">Full Name ({addFormData.name.length}/60)</label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Ramesh Kumar Sharma Account"
              value={addFormData.name}
              onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
            />
            <span className="form-hint">Must be 20–60 characters.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="input"
              required
              placeholder="user@example.com"
              value={addFormData.email}
              onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="select"
              value={addFormData.role}
              onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
            >
              <option value="USER">USER (Normal Customer)</option>
              <option value="STORE_OWNER">STORE_OWNER (Store Manager)</option>
              <option value="ADMIN">ADMIN (System Administrator)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Address (Optional)</label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="Max 400 characters"
              value={addFormData.address}
              onChange={(e) => setAddFormData({ ...addFormData, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input"
              required
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              value={addFormData.password}
              onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
            />
            <span className="form-hint">8–16 characters with $\ge$1 uppercase and $\ge$1 special char.</span>
          </div>
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="User Details"
        footer={
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsDetailModalOpen(false)}
          >
            Close
          </button>
        }
      >
        {detailLoading || !selectedUser ? (
          <p style={{ textAlign: 'center', padding: '1.5rem' }}>Loading user details...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Full Name</span>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedUser.name}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email</span>
                <div>{selectedUser.email}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Role</span>
                <div>{getRoleBadge(selectedUser.role)}</div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Address</span>
              <div>{selectedUser.address || 'Not specified'}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Account Created</span>
              <div>{new Date(selectedUser.created_at).toLocaleString()}</div>
            </div>

            {selectedUser.role === 'STORE_OWNER' && selectedUser.stores && (
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Stores Owned ({selectedUser.stores.length}):</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {selectedUser.stores.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>No stores assigned yet.</span>
                  ) : (
                    selectedUser.stores.map((s) => (
                      <div key={s.id} style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Rating: {s.avg_rating} ★ ({s.total_ratings} reviews)</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
