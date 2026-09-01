import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { UserPlus, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, email, address, password, confirmPassword } = formData;

    if (name.trim().length < 20 || name.trim().length > 60) {
      return 'Name must be between 20 and 60 characters long.';
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return 'Please provide a valid email address.';
    }

    if (address && address.length > 400) {
      return 'Address cannot exceed 400 characters.';
    }

    if (password.length < 8 || password.length > 16) {
      return 'Password must be between 8 and 16 characters.';
    }

    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character.';
    }

    if (password !== confirmPassword) {
      return 'Password and Confirm Password do not match.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim() || undefined,
        password: formData.password,
      });

      // Public registration always creates USER
      navigate('/user');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '1.5rem' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'var(--color-primary-light)', borderRadius: '12px', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            <UserPlus size={32} />
          </div>
          <h2>Create an Account</h2>
          <p style={{ fontSize: '0.9rem' }}>Sign up to rate stores and share your feedback</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name ({formData.name.length}/60)</label>
            <input
              type="text"
              name="name"
              className="input"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kumar Sharma Customer"
            />
            <span className="form-hint">Must be 20 to 60 characters in length.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="input"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address (Optional)</label>
            <textarea
              name="address"
              className="textarea"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your street or city address (max 400 chars)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="input"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              autoComplete="new-password"
            />
            <span className="form-hint">8–16 characters, $\ge$1 uppercase, $\ge$1 special character.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="input"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
