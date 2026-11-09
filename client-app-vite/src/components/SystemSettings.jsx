
import React, { useEffect, useState } from 'react';
import {
  FaUserShield,
  FaPlus,
  FaSearch,
  FaKey,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

import api from '../services/api';
import './AdminDashboard.css';

const emptyAdmin = {
  fullName: '',
  username: '',
  email: '',
  password: ''
};

function SystemSettings() {
  const [admins, setAdmins] = useState([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState(emptyAdmin);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [resetAdminId, setResetAdminId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setError('');
      const response = await api.get('/auth/admins');
      setAdmins(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching administrators:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load administrator accounts.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      await api.post('/auth/admins', newAdmin);

      setNewAdmin(emptyAdmin);
      setShowAddAdmin(false);
      await fetchAdmins();
    } catch (err) {
      console.error('Error adding administrator:', err);
      setError(
        err.response?.data?.message ||
        'Unable to create administrator account.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetAdminPassword = async (e, admin) => {
    e.preventDefault();

    if (!resetPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (!window.confirm(`Reset the password for ${admin.fullName}?`)) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await api.post(
        `/auth/admins/${admin.id}/reset-password`,
        { newPassword: resetPassword }
      );

      window.alert(
        response.data?.message ||
        'Administrator password reset successfully.'
      );

      setResetAdminId(null);
      setResetPassword('');
    } catch (err) {
      console.error('Error resetting administrator password:', err);
      setError(
        err.response?.data?.message ||
        'Unable to reset this administrator password.'
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';

    return new Date(date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredAdmins = admins.filter(admin => {
    const search = adminSearchTerm.toLowerCase();

    return (
      admin.fullName?.toLowerCase().includes(search) ||
      admin.username?.toLowerCase().includes(search) ||
      admin.email?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="admin-dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="section-eyebrow">SYSTEM CONFIGURATION</span>
          <h1>System Settings</h1>
          <p>
            Manage administrator accounts and system access.
          </p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Administrator Management</h2>
            <p>
              View existing administrator accounts and create new accounts.
            </p>
          </div>
        </div>

        <div className="dashboard-actions admin-management-actions">
          <div className="admin-search-wrap">
            <FaSearch className="admin-search-icon" />

            <input
              className="dashboard-search"
              type="search"
              placeholder="Search by name, username or email..."
              value={adminSearchTerm}
              onChange={e => setAdminSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="dashboard-button"
            type="button"
            onClick={() => setShowAddAdmin(!showAddAdmin)}
          >
            <FaPlus />
            {showAddAdmin ? 'Cancel' : 'Add Administrator'}
          </button>
        </div>

        {showAddAdmin && (
          <form className="admin-form-panel" onSubmit={handleAddAdmin}>
            <h3>Create Administrator Account</h3>

            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label htmlFor="admin-full-name">Full Name *</label>
                <input
                  id="admin-full-name"
                  type="text"
                  autoComplete="name"
                  value={newAdmin.fullName}
                  onChange={e =>
                    setNewAdmin({
                      ...newAdmin,
                      fullName: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="admin-username">Username *</label>
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  value={newAdmin.username}
                  onChange={e =>
                    setNewAdmin({
                      ...newAdmin,
                      username: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="admin-form-field admin-form-full">
                <label htmlFor="admin-email">Email Address *</label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={newAdmin.email}
                  onChange={e =>
                    setNewAdmin({
                      ...newAdmin,
                      email: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="admin-form-field admin-form-full">
                <label htmlFor="admin-password">
                  Temporary Password *
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  value={newAdmin.password}
                  onChange={e =>
                    setNewAdmin({
                      ...newAdmin,
                      password: e.target.value
                    })
                  }
                  required
                />

                <small className="admin-form-hint">
                  Use at least 12 characters, including uppercase and
                  lowercase letters, a number and a special character.
                </small>
              </div>
            </div>

            <div className="admin-form-actions">
              <button
                className="dashboard-button"
                type="submit"
                disabled={saving}
              >
                <FaCheck />
                {saving ? 'Creating...' : 'Create Administrator'}
              </button>

              <button
                className="dashboard-button button-secondary"
                type="button"
                onClick={() => {
                  setShowAddAdmin(false);
                  setNewAdmin(emptyAdmin);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="dashboard-empty">
            <p>Loading administrator accounts...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="dashboard-empty">
            <FaUserShield />
            <h3>
              {admins.length === 0
                ? 'No administrators found'
                : 'No matching administrators'}
            </h3>
            <p>
              {admins.length === 0
                ? 'Administrator accounts will appear here once available.'
                : 'Try searching with a different name, username or email.'}
            </p>
          </div>
        ) : (
          <div className="admin-management-grid">
            {filteredAdmins.map(admin => (
              <article className="admin-account-card" key={admin.id}>
                <div className="admin-account-heading">
                  <span className="admin-account-icon">
                    <FaUserShield />
                  </span>

                  <div>
                    <h3>{admin.fullName}</h3>
                    <span className="admin-account-role">
                      Administrator
                    </span>
                  </div>
                </div>

                <div className="admin-account-details">
                  <p>
                    <strong>Username</strong>
                    <span>{admin.username}</span>
                  </p>
                  <p>
                    <strong>Email</strong>
                    <span>{admin.email}</span>
                  </p>
                  <p>
                    <strong>Date Added</strong>
                    <span>{formatDate(admin.createdDate)}</span>
                  </p>
                </div>

                <div className="admin-account-actions">
                  <button
                    className="dashboard-button button-secondary"
                    type="button"
                    onClick={() => {
                      setError('');
                      setResetPassword('');
                      setResetAdminId(
                        resetAdminId === admin.id ? null : admin.id
                      );
                    }}
                  >
                    <FaKey />
                    {resetAdminId === admin.id
                      ? 'Cancel Reset'
                      : 'Reset Password'}
                  </button>
                </div>

                {resetAdminId === admin.id && (
                  <form
                    className="admin-reset-password-form"
                    onSubmit={e => handleResetAdminPassword(e, admin)}
                  >
                    <div className="admin-form-field">
                      <label htmlFor={`reset-password-${admin.id}`}>
                        New Password *
                      </label>
                      <input
                        id={`reset-password-${admin.id}`}
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        value={resetPassword}
                        onChange={e => setResetPassword(e.target.value)}
                        placeholder="Enter a temporary password"
                        required
                      />
                      <small className="admin-form-hint">
                        At least 12 characters, including uppercase and
                        lowercase letters, a number and a special character.
                      </small>
                    </div>

                    <div className="admin-form-actions">
                      <button
                        className="dashboard-button"
                        type="submit"
                        disabled={saving}
                      >
                        <FaCheck />
                        {saving ? 'Resetting...' : 'Confirm Password Reset'}
                      </button>

                      <button
                        className="dashboard-button button-secondary"
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setResetAdminId(null);
                          setResetPassword('');
                        }}
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </form>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default SystemSettings;
