
import React, { useEffect, useState } from 'react';
import {
  FaClipboardCheck,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaUsers,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClipboardList,
  FaBuilding,
  FaHistory
} from 'react-icons/fa';

import api from '../services/api';
import './InspectionForm.css';

const emptyInspection = {
  bookingId: 0,
  inspectorName: '',
  inspectorContact: '',
  conditionBefore: '',
  conditionAfter: '',
  damagesFound: false,
  damageDescription: '',
  inspectionNotes: ''
};

function InspectionForm() {
  const [bookings, setBookings] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [inspection, setInspection] = useState(emptyInspection);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadInspectionData();
  }, []);

  const loadInspectionData = async () => {
    setLoading(true);
    setError('');

    try {
      const [bookingResponse, inspectionResponse] = await Promise.all([
        api.get('/bookings/status/Approved'),
        api.get('/inspections')
      ]);

      setBookings(bookingResponse.data);
      setInspections(inspectionResponse.data);
    } catch (err) {
      console.error('Error loading inspection data:', err);
      setError('Unable to load inspection information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedBookingDetails = bookings.find(
    booking => booking.id === Number(selectedBooking)
  );

  const handleBookingChange = (e) => {
    const bookingId = e.target.value;

    setSelectedBooking(bookingId);
    setInspection({
      ...emptyInspection,
      bookingId: bookingId ? Number(bookingId) : 0
    });

    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setInspection(previous => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'damagesFound' && !checked
        ? { damageDescription: '' }
        : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedBooking) {
      setError('Please select an approved booking.');
      return;
    }

    if (inspection.damagesFound && !inspection.damageDescription.trim()) {
      setError('Please provide a description of the damages found.');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/inspections', {
        ...inspection,
        bookingId: Number(inspection.bookingId)
      });

      setSuccess('Inspection submitted successfully.');

      setInspection(emptyInspection);
      setSelectedBooking('');

      await loadInspectionData();
    } catch (err) {
      console.error('Error submitting inspection:', err);
      setError(
        err.response?.data?.message ||
        'Unable to submit the inspection. Please try again.'
      );
    } finally {
      setSubmitting(false);
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

  const formatDateTime = (date) => {
    if (!date) return 'Not specified';

    return new Date(date).toLocaleString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="inspection-page">
        <div className="inspection-loading">
          <FaClipboardCheck />
          <p>Loading inspection information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inspection-page">
      <div className="inspection-heading">
        <div>
          <span className="inspection-eyebrow">FACILITY MANAGEMENT</span>
          <h1>Post-Event Inspection</h1>
          <p>
            Record facility conditions after an event and document any
            damages or maintenance concerns.
          </p>
        </div>

        <div className="inspection-heading-icon">
          <FaClipboardCheck />
        </div>
      </div>

      {error && (
        <div className="inspection-alert inspection-alert-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="inspection-alert inspection-alert-success">
          <FaCheckCircle />
          <span>{success}</span>
        </div>
      )}

      <div className="inspection-layout">
        <section className="inspection-form-card">
          <div className="inspection-card-heading">
            <div className="inspection-card-icon">
              <FaClipboardList />
            </div>
            <div>
              <h2>Inspection Details</h2>
              <p>Complete all required fields below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="inspection-field">
              <label htmlFor="bookingSelect">
                Select Booking to Inspect <span>*</span>
              </label>

              <select
                id="bookingSelect"
                value={selectedBooking}
                onChange={handleBookingChange}
                required
              >
                <option value="">Choose an approved booking</option>
                {bookings.map(booking => (
                  <option key={booking.id} value={booking.id}>
                    {booking.facility?.name || 'Municipal Facility'} —{' '}
                    {booking.requesterName} ({formatDate(booking.bookingDate)})
                  </option>
                ))}
              </select>

              {bookings.length === 0 && (
                <small className="inspection-help">
                  There are currently no approved bookings available for inspection.
                </small>
              )}
            </div>

            {selectedBooking && (
              <>
                <div className="inspection-divider" />

                <div className="inspection-section-title">
                  <h3>Inspector Information</h3>
                  <p>Enter the details of the person conducting the inspection.</p>
                </div>

                <div className="inspection-form-grid">
                  <div className="inspection-field">
                    <label htmlFor="inspectorName">
                      Inspector Name <span>*</span>
                    </label>
                    <input
                      id="inspectorName"
                      name="inspectorName"
                      type="text"
                      value={inspection.inspectorName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="inspection-field">
                    <label htmlFor="inspectorContact">
                      Inspector Contact <span>*</span>
                    </label>
                    <input
                      id="inspectorContact"
                      name="inspectorContact"
                      type="text"
                      value={inspection.inspectorContact}
                      onChange={handleChange}
                      placeholder="Phone number or email"
                      required
                    />
                  </div>
                </div>

                <div className="inspection-divider" />

                <div className="inspection-section-title">
                  <h3>Facility Condition Assessment</h3>
                  <p>Compare the condition of the facility before and after the event.</p>
                </div>

                <div className="inspection-field">
                  <label htmlFor="conditionBefore">
                    Condition Before Event <span>*</span>
                  </label>
                  <textarea
                    id="conditionBefore"
                    name="conditionBefore"
                    value={inspection.conditionBefore}
                    onChange={handleChange}
                    placeholder="Describe the facility's condition before the event..."
                    rows={4}
                    required
                  />
                </div>

                <div className="inspection-field">
                  <label htmlFor="conditionAfter">
                    Condition After Event <span>*</span>
                  </label>
                  <textarea
                    id="conditionAfter"
                    name="conditionAfter"
                    value={inspection.conditionAfter}
                    onChange={handleChange}
                    placeholder="Describe the facility's condition after the event..."
                    rows={4}
                    required
                  />
                </div>

                <div className={`damage-toggle ${inspection.damagesFound ? 'damage-toggle-active' : ''}`}>
                  <label htmlFor="damagesFound" className="damage-toggle-label">
                    <input
                      id="damagesFound"
                      name="damagesFound"
                      type="checkbox"
                      checked={inspection.damagesFound}
                      onChange={handleChange}
                    />
                    <span className="damage-checkbox">
                      {inspection.damagesFound && <FaCheckCircle />}
                    </span>
                    <span>
                      <strong>Damages Found</strong>
                      <small>Indicate whether any damage was identified.</small>
                    </span>
                  </label>
                </div>

                {inspection.damagesFound && (
                  <div className="damage-description-panel">
                    <div className="damage-panel-heading">
                      <FaExclamationTriangle />
                      <strong>Damage Report</strong>
                    </div>

                    <div className="inspection-field">
                      <label htmlFor="damageDescription">
                        Describe the Damages <span>*</span>
                      </label>
                      <textarea
                        id="damageDescription"
                        name="damageDescription"
                        value={inspection.damageDescription}
                        onChange={handleChange}
                        placeholder="Provide details of the damage, including affected areas..."
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="inspection-field">
                  <label htmlFor="inspectionNotes">
                    Additional Notes
                  </label>
                  <textarea
                    id="inspectionNotes"
                    name="inspectionNotes"
                    value={inspection.inspectionNotes}
                    onChange={handleChange}
                    placeholder="Record any additional observations or recommendations..."
                    rows={3}
                  />
                </div>

                <div className="inspection-submit-area">
                  <button
                    className="inspection-submit-button"
                    type="submit"
                    disabled={submitting}
                  >
                    <FaClipboardCheck />
                    {submitting ? 'Submitting Inspection...' : 'Submit Inspection'}
                  </button>
                  <small>Please review the information before submitting.</small>
                </div>
              </>
            )}
          </form>
        </section>

        <aside className="inspection-sidebar">
          {selectedBookingDetails ? (
            <div className="inspection-booking-card">
              <div className="inspection-sidebar-heading">
                <FaBuilding />
                <h3>Booking Details</h3>
              </div>

              <div className="inspection-facility-name">
                {selectedBookingDetails.facility?.name || 'Municipal Facility'}
              </div>

              <div className="inspection-detail-item">
                <FaBuilding />
                <div>
                  <small>Facility Type</small>
                  <strong>{selectedBookingDetails.facility?.type || 'Not specified'}</strong>
                </div>
              </div>

              <div className="inspection-detail-item">
                <FaMapMarkerAlt />
                <div>
                  <small>Location</small>
                  <strong>{selectedBookingDetails.facility?.location || 'Not specified'}</strong>
                </div>
              </div>

              <div className="inspection-sidebar-divider" />

              <div className="inspection-detail-item">
                <FaUser />
                <div>
                  <small>Requester</small>
                  <strong>{selectedBookingDetails.requesterName}</strong>
                </div>
              </div>

              <div className="inspection-detail-item">
                <FaCalendarAlt />
                <div>
                  <small>Booking Date</small>
                  <strong>{formatDate(selectedBookingDetails.bookingDate)}</strong>
                </div>
              </div>

              <div className="inspection-detail-item">
                <FaClock />
                <div>
                  <small>Booking Time</small>
                  <strong>
                    {selectedBookingDetails.startTime} – {selectedBookingDetails.endTime}
                  </strong>
                </div>
              </div>

              <div className="inspection-detail-item">
                <FaUsers />
                <div>
                  <small>Expected Attendees</small>
                  <strong>{selectedBookingDetails.expectedAttendees}</strong>
                </div>
              </div>

              <div className="inspection-booking-purpose">
                <small>Event Purpose</small>
                <p>{selectedBookingDetails.purpose || 'Not specified'}</p>
              </div>
            </div>
          ) : (
            <div className="inspection-sidebar-placeholder">
              <FaClipboardCheck />
              <h3>Booking Information</h3>
              <p>Select an approved booking to view its details here.</p>
            </div>
          )}

          <div className="inspection-tip-card">
            <FaExclamationTriangle />
            <div>
              <strong>Inspection Reminder</strong>
              <p>
                Provide accurate observations and document any damages clearly
                for future maintenance and facility management.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="recent-inspections">
        <div className="recent-inspections-heading">
          <div>
            <span className="inspection-eyebrow">INSPECTION HISTORY</span>
            <h2>Recent Inspections</h2>
            <p>Previously recorded facility inspection reports.</p>
          </div>

          <div className="inspection-history-count">
            <FaHistory />
            {inspections.length} Records
          </div>
        </div>

        {inspections.length === 0 ? (
          <div className="inspection-empty">
            <FaClipboardList />
            <h3>No inspections recorded yet</h3>
            <p>Submitted inspection reports will appear here.</p>
          </div>
        ) : (
          <div className="inspection-history-grid">
            {inspections.map(insp => (
              <article
                className={`inspection-history-card ${insp.damagesFound ? 'has-damage' : 'no-damage'}`}
                key={insp.id}
              >
                <div className="inspection-history-card-heading">
                  <div>
                    <h3>{insp.booking?.facility?.name || 'Municipal Facility'}</h3>
                    <p>{insp.booking?.requesterName || 'Booking details unavailable'}</p>
                  </div>

                  <span className={`inspection-result-badge ${insp.damagesFound ? 'result-damage' : 'result-clear'}`}>
                    {insp.damagesFound ? (
                      <><FaExclamationTriangle /> Damage Found</>
                    ) : (
                      <><FaCheckCircle /> No Damage</>
                    )}
                  </span>
                </div>

                <div className="inspection-history-meta">
                  <span><FaUser /> {insp.inspectorName}</span>
                  <span><FaCalendarAlt /> {formatDateTime(insp.inspectionDate)}</span>
                </div>

                <div className="inspection-history-section">
                  <strong>Condition Before</strong>
                  <p>{insp.conditionBefore}</p>
                </div>

                <div className="inspection-history-section">
                  <strong>Condition After</strong>
                  <p>{insp.conditionAfter}</p>
                </div>

                {insp.damagesFound && (
                  <div className="inspection-history-damage">
                    <strong>Damage Report</strong>
                    <p>{insp.damageDescription}</p>
                  </div>
                )}

                {insp.inspectionNotes && (
                  <div className="inspection-history-section">
                    <strong>Additional Notes</strong>
                    <p>{insp.inspectionNotes}</p>
                  </div>
                )}

                <div className="inspection-history-footer">
                  <span>Booking date: {formatDate(insp.booking?.bookingDate)}</span>
                  <span>{insp.inspectorContact}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default InspectionForm;
