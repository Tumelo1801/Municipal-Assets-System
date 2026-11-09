import React, { useState, useEffect } from 'react';

import {
  FaBuilding,
  FaCalendarCheck,
  FaClock,
  FaClipboardList,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaUsers,
  FaCalendarAlt,
  FaUserShield,
  FaKey
} from 'react-icons/fa';

import api from '../services/api';
import './AdminDashboard.css';

const emptyFacility = {
  name: '',
  type: 'Building',
  location: '',
  description: '',
  capacity: 0,
  amenities: '',
  status: 'Available'
};

const emptyAdmin = {
  fullName: '',
  username: '',
  email: '',
  password: ''
};

function AdminDashboard() {
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('facilities');
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newFacility, setNewFacility] = useState(emptyFacility);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState(emptyAdmin);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [resetAdminId, setResetAdminId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'administrators') {
      fetchAdmins();
    }
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [facilityResponse, bookingResponse] = await Promise.all([
        api.get('/facilities'),
        api.get('/bookings')
      ]);

      setFacilities(facilityResponse.data);
      setBookings(bookingResponse.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Unable to load dashboard information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/facilities');
      setFacilities(response.data);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Unable to refresh facilities.');
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Unable to refresh bookings.');
    }
  };

  const fetchAdmins = async () => {
    try {
      setError('');
      const response = await api.get('/auth/admins');
      setAdmins(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching administrators:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load administrator accounts. Please check that you are signed in as an administrator.'
      );
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
        'Unable to create administrator account. Check the details and try again.'
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

      window.alert(response.data?.message || 'Administrator password reset successfully.');
      setResetAdminId(null);
      setResetPassword('');
    } catch (err) {
      console.error('Error resetting administrator password:', err);
      setError(
        err.response?.data?.message ||
        'Unable to reset this administrator password. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddFacility = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      await api.post('/facilities', {
        ...newFacility,
        capacity: Number(newFacility.capacity)
      });

      setNewFacility(emptyFacility);
      setShowAddFacility(false);
      await fetchFacilities();
    } catch (err) {
      console.error('Error adding facility:', err);
      setError(err.response?.data?.message || 'Unable to add facility.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateFacility = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      await api.put(`/facilities/${editingFacility.id}`, {
        ...editingFacility,
        capacity: Number(editingFacility.capacity)
      });

      setEditingFacility(null);
      await fetchFacilities();
    } catch (err) {
      console.error('Error updating facility:', err);
      setError(err.response?.data?.message || 'Unable to update facility.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditFacility = (facility) => {
    setShowAddFacility(false);

    setEditingFacility({
      ...emptyFacility,
      ...facility
    });

    setError('');
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) {
      return;
    }

    try {
      setError('');
      await api.delete(`/facilities/${id}`);
      await fetchFacilities();
    } catch (err) {
      console.error('Error deleting facility:', err);
      setError(err.response?.data?.message || 'Unable to delete facility.');
    }
  };

  const handleBookingStatus = async (id, status, notes) => {
    if (status === 'Rejected' && (!notes || !notes.trim())) {
      setError('A reason is required when rejecting a booking.');
      return;
    }

    try {
      setError('');

      await api.put(
        `/bookings/${id}/status?status=${status}&adminNotes=${encodeURIComponent(notes || '')}`
      );

      await fetchBookings();
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err.response?.data?.message || 'Unable to update booking status.');
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const approvedBookings = bookings.filter(b => b.status === 'Approved');
  const rejectedBookings = bookings.filter(b => b.status === 'Rejected');

  const filteredFacilities = facilities.filter(facility => {
    const search = searchTerm.toLowerCase();

    return (
      facility.name?.toLowerCase().includes(search) ||
      facility.type?.toLowerCase().includes(search) ||
      facility.location?.toLowerCase().includes(search)
    );
  });

  const filteredAdmins = admins.filter(admin => {
    const search = adminSearchTerm.toLowerCase();

    return (
      admin.fullName?.toLowerCase().includes(search) ||
      admin.username?.toLowerCase().includes(search) ||
      admin.email?.toLowerCase().includes(search)
    );
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'Available':
        return 'status-available';
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      case 'Pending':
        return 'status-pending';
      default:
        return 'status-unavailable';
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

  const renderFacilityForm = (facility, isEditing = false) => (
    <form
      className="admin-form-panel"
      onSubmit={isEditing ? handleUpdateFacility : handleAddFacility}
    >
      <h3>{isEditing ? 'Edit Facility' : 'Add New Facility'}</h3>

      <div className="admin-form-grid">
        <div className="admin-form-field">
          <label>Facility Name *</label>
          <input
            type="text"
            value={facility.name}
            onChange={e =>
              isEditing
                ? setEditingFacility({ ...editingFacility, name: e.target.value })
                : setNewFacility({ ...newFacility, name: e.target.value })
            }
            required
          />
        </div>

        <div className="admin-form-field">
          <label>Facility Type *</label>
          <select
            value={facility.type}
            onChange={e =>
              isEditing
                ? setEditingFacility({ ...editingFacility, type: e.target.value })
                : setNewFacility({ ...newFacility, type: e.target.value })
            }
          >
            <option value="Building">Building</option>
            <option value="Park">Park</option>
            <option value="Facility">Facility</option>
          </select>
        </div>

        <div className="admin-form-field">
          <label>Location *</label>
          <input
            type="text"
            value={facility.location}
            onChange={e =>
              isEditing
                ? setEditingFacility({ ...editingFacility, location: e.target.value })
                : setNewFacility({ ...newFacility, location: e.target.value })
            }
            required
          />
        </div>

        <div className="admin-form-field">
          <label>Capacity *</label>
          <input
            type="number"
            min="1"
            value={facility.capacity}
            onChange={e =>
              isEditing
                ? setEditingFacility({ ...editingFacility, capacity: e.target.value })
                : setNewFacility({ ...newFacility, capacity: e.target.value })
            }
            required
          />
        </div>

        <div className="admin-form-field">
          <label>Availability Status</label>
          <select
            value={facility.status}
            onChange={e =>
              isEditing
                ? setEditingFacility({ ...editingFacility, status: e.target.value })
                : setNewFacility({ ...newFacility, status: e.target.value })
            }
          >
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>

        <div className="admin-form-field admin-form-full">
          <label>Description *</label>
          <textarea
            value={facility.description}
            onChange={e =>
              isEditing
                ? setEditingFacility({ ...editingFacility, description: e.target.value })
                : setNewFacility({ ...newFacility, description: e.target.value })
            }
            required
          />
        </div>

        <div className="admin-form-field admin-form-full">
          <label>Amenities</label>
          <textarea
            value={facility.amenities}
            onChange={e =>
              isEditing
                ? setEditingFacility({ ...editingFacility, amenities: e.target.value })
                : setNewFacility({ ...newFacility, amenities: e.target.value })
            }
            placeholder="e.g. Parking, Wi-Fi, Restrooms"
          />
        </div>
      </div>

      <div className="admin-form-actions">
        <button className="dashboard-button" type="submit" disabled={saving}>
          <FaCheck />
          {saving ? 'Saving...' : isEditing ? 'Update Facility' : 'Add Facility'}
        </button>

        <button
          className="dashboard-button button-secondary"
          type="button"
          onClick={() => {
            setEditingFacility(null);
            setShowAddFacility(false);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  const renderBookingCard = (booking) => (
    <article
      key={booking.id}
      className={`booking-admin-card ${booking.status.toLowerCase()}`}
    >
      <div className="booking-admin-header">
        <div>
          <h3>{booking.facility?.name || 'Municipal Facility'}</h3>
          <p>Requested by {booking.requesterName}</p>
        </div>

        <span className={`status-badge ${getStatusClass(booking.status)}`}>
          {booking.status}
        </span>
      </div>

      <div className="booking-admin-details">
        <p><strong>Email:</strong> {booking.requesterEmail}</p>
        <p><strong>Phone:</strong> {booking.requesterPhone}</p>
        <p><strong>Date:</strong> {formatDate(booking.bookingDate)}</p>
        <p><strong>Time:</strong> {booking.startTime} – {booking.endTime}</p>
        <p><strong>Attendees:</strong> {booking.expectedAttendees}</p>
        <p><strong>Requested:</strong> {formatDate(booking.requestDate)}</p>
      </div>

      <div className="booking-purpose">
        <h4>Booking Purpose</h4>
        <p>{booking.purpose}</p>
      </div>

      {booking.adminNotes && (
        <div className="admin-notes">
          <strong>Administrator Notes:</strong> {booking.adminNotes}
        </div>
      )}

      {booking.status === 'Pending' && (
        <div className="booking-admin-actions">
          <button
            className="dashboard-button button-success"
            onClick={() => {
              const notes = window.prompt('Add optional approval notes:');

              if (notes !== null) {
                handleBookingStatus(booking.id, 'Approved', notes);
              }
            }}
          >
            <FaCheck /> Approve
          </button>

          <button
            className="dashboard-button button-danger"
            onClick={() => {
              const notes = window.prompt('Please provide a reason for rejection:');

              if (notes !== null && notes.trim()) {
                handleBookingStatus(booking.id, 'Rejected', notes);
              } else if (notes !== null) {
                window.alert('A rejection reason is required.');
              }
            }}
          >
            <FaTimes /> Reject
          </button>
        </div>
      )}
    </article>
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="section-eyebrow">MANAGEMENT OVERVIEW</span>
          <h1>Admin Dashboard</h1>
          <p>Manage municipal facilities, booking requests and administrator accounts.</p>
        </div>

        <div className="dashboard-date">
          <FaCalendarAlt /> {new Date().toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-icon"><FaBuilding /></span>
          <div className="stat-info">
            <p>Total Facilities</p>
            <strong>{facilities.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon"><FaClock /></span>
          <div className="stat-info">
            <p>Pending Bookings</p>
            <strong>{pendingBookings.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon"><FaCalendarCheck /></span>
          <div className="stat-info">
            <p>Approved Bookings</p>
            <strong>{approvedBookings.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon"><FaClipboardList /></span>
          <div className="stat-info">
            <p>Total Bookings</p>
            <strong>{bookings.length}</strong>
          </div>
        </div>
      </section>

      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeTab === 'facilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('facilities')}
        >
          <FaBuilding /> Facilities
        </button>

        <button
          className={`dashboard-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <FaClipboardList /> Bookings
          {pendingBookings.length > 0 && (
            <span className="tab-count">{pendingBookings.length}</span>
          )}
        </button>

        <button
          className={`dashboard-tab ${activeTab === 'administrators' ? 'active' : ''}`}
          onClick={() => {
            setShowAddAdmin(false);
            setActiveTab('administrators');
          }}
        >
          <FaUserShield /> Administrators
          <span className="tab-count admin-tab-count">{admins.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="dashboard-empty">
          <p>Loading dashboard information...</p>
        </div>
      ) : (
        <>
          {activeTab === 'facilities' && (
            <section className="dashboard-section">
              <div className="dashboard-section-heading">
                <div>
                  <h2>Facility Management</h2>
                  <p>View, add and manage municipal facilities.</p>
                </div>
              </div>

              <div className="dashboard-actions">
                <div style={{ position: 'relative', flex: 1 }}>
                  <FaSearch
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#8293a5'
                    }}
                  />

                  <input
                    className="dashboard-search"
                    style={{ paddingLeft: 40 }}
                    type="search"
                    placeholder="Search by name, type or location..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <button
                  className="dashboard-button"
                  onClick={() => {
                    setEditingFacility(null);
                    setShowAddFacility(!showAddFacility);
                  }}
                >
                  <FaPlus />
                  {showAddFacility ? 'Cancel' : 'Add Facility'}
                </button>
              </div>

              {showAddFacility && renderFacilityForm(newFacility)}

              {editingFacility && renderFacilityForm(editingFacility, true)}

              {filteredFacilities.length === 0 ? (
                <div className="dashboard-empty">
                  <FaBuilding />
                  <h3>No facilities found</h3>
                  <p>Try a different search or add a new facility.</p>
                </div>
              ) : (
                <div className="facility-admin-grid">
                  {filteredFacilities.map(facility => (
                    <article className="facility-admin-card" key={facility.id}>
                      <div className="facility-card-header">
                        <h3>{facility.name}</h3>
                        <span className={`status-badge ${getStatusClass(facility.status)}`}>
                          {facility.status}
                        </span>
                      </div>

                      <span className="facility-type">{facility.type}</span>

                      <p><FaMapMarkerAlt /> {facility.location}</p>
                      <p><FaUsers /> Capacity: {facility.capacity} people</p>
                      <p>{facility.description}</p>
                      <p><strong>Amenities:</strong> {facility.amenities || 'Not specified'}</p>

                      <div className="facility-admin-actions">
                        <button
                          type="button"
                          className="dashboard-button button-secondary"
                          onClick={() => handleEditFacility(facility)}
                        >
                          <FaEdit /> Edit
                        </button>

                        <button
                          className="dashboard-button button-danger"
                          onClick={() => handleDeleteFacility(facility.id)}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'bookings' && (
            <section className="dashboard-section">
              <div className="dashboard-section-heading">
                <div>
                  <h2>Booking Management</h2>
                  <p>Review and manage municipal facility booking requests.</p>
                </div>
              </div>

              <h3>Pending Requests ({pendingBookings.length})</h3>

              {pendingBookings.length === 0 ? (
                <div className="dashboard-empty">
                  <FaCheck />
                  <h3>No pending booking requests</h3>
                  <p>You're all caught up!</p>
                </div>
              ) : (
                <div className="booking-admin-list">
                  {pendingBookings.map(renderBookingCard)}
                </div>
              )}

              <div style={{ marginTop: 40 }}>
                <h3>Approved Bookings ({approvedBookings.length})</h3>

                {approvedBookings.length === 0 ? (
                  <div className="dashboard-empty">
                    <FaCalendarCheck />
                    <h3>No approved bookings yet</h3>
                  </div>
                ) : (
                  <div className="booking-admin-list">
                    {approvedBookings.map(renderBookingCard)}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 40 }}>
                <h3>Rejected Bookings ({rejectedBookings.length})</h3>

                {rejectedBookings.length === 0 ? (
                  <div className="dashboard-empty">
                    <FaTimes />
                    <h3>No rejected bookings</h3>
                  </div>
                ) : (
                  <div className="booking-admin-list">
                    {rejectedBookings.map(renderBookingCard)}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'administrators' && (
            <section className="dashboard-section">
              <div className="dashboard-section-heading">
                <div>
                  <h2>Administrator Management</h2>
                  <p>View existing administrator accounts and create new accounts.</p>
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
                        onChange={e => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
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
                        onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })}
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
                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-field admin-form-full">
                      <label htmlFor="admin-password">Temporary Password *</label>
                      <input
                        id="admin-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        value={newAdmin.password}
                        onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        required
                      />

                      <small className="admin-form-hint">
                        Use at least 12 characters, including uppercase and lowercase letters,
                        a number and a special character.
                      </small>
                    </div>
                  </div>

                  <div className="admin-form-actions">
                    <button className="dashboard-button" type="submit" disabled={saving}>
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

              {filteredAdmins.length === 0 ? (
                <div className="dashboard-empty">
                  <FaUserShield />
                  <h3>
                    {admins.length === 0
                      ? 'No administrators found'
                      : 'No matching administrators'}
                  </h3>

                  <p>
                    {admins.length === 0
                      ? 'Administrator accounts will appear here once they are available.'
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
                          <span className="admin-account-role">Administrator</span>
                        </div>
                      </div>

                      <div className="admin-account-details">
                        <p><strong>Username</strong><span>{admin.username}</span></p>
                        <p><strong>Email</strong><span>{admin.email}</span></p>
                        <p><strong>Date Added</strong><span>{formatDate(admin.createdDate)}</span></p>
                      </div>

                      <div className="admin-account-actions">
                        <button
                          className="dashboard-button button-secondary"
                          type="button"
                          onClick={() => {
                            setError('');
                            setResetPassword('');
                            setResetAdminId(resetAdminId === admin.id ? null : admin.id);
                          }}
                        >
                          <FaKey />
                          {resetAdminId === admin.id ? 'Cancel Reset' : 'Reset Password'}
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
                              At least 12 characters, including uppercase and lowercase letters,
                              a number and a special character.
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
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;