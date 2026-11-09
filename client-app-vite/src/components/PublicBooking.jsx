
import React, { useEffect, useState } from 'react';
import {
  FaMapMarkerAlt,
  FaUsers,
  FaBuilding,
  FaTree,
  FaLandmark,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaInfoCircle
} from 'react-icons/fa';

import api from '../services/api';
import './PublicBooking.css';

const initialBooking = {
  facilityId: 0,
  requesterName: '',
  requesterEmail: '',
  requesterPhone: '',
  bookingDate: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: ''
};

const getFacilityIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'park':
      return FaTree;
    case 'building':
      return FaBuilding;
    default:
      return FaLandmark;
  }
};

function PublicBooking() {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [booking, setBooking] = useState(initialBooking);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/facilities');
      const available = response.data.filter(
        facility => facility.status === 'Available'
      );

      setFacilities(available);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('We could not load the facilities. Please refresh the page and try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = (field, value) => {
    setBooking(previous => ({
      ...previous,
      [field]: value
    }));
  };

  const handleFacilityChange = (facilityId) => {
    const id = Number(facilityId);

    setSelectedFacility(facilityId);
    setBooking(previous => ({
      ...previous,
      facilityId: id
    }));

    setSuccess('');
    setError('');
  };

  const selectedFacilityDetails = facilities.find(
    facility => Number(facility.id) === Number(selectedFacility)
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedFacilityDetails) {
      setError('Please select a facility before submitting your request.');
      return;
    }

    if (booking.endTime <= booking.startTime) {
      setError('The end time must be later than the start time.');
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        ...booking,
        facilityId: Number(booking.facilityId),
        expectedAttendees: Number(booking.expectedAttendees),
        bookingDate: new Date(
          `${booking.bookingDate}T00:00:00`
        ).toISOString(),
        startTime: `${booking.startTime}:00`,
        endTime: `${booking.endTime}:00`
      };

      await api.post('/bookings', bookingData);

      setSuccess(
        'Your booking request has been submitted successfully. Our team will contact you shortly.'
      );

      setBooking(initialBooking);
      setSelectedFacility('');
    } catch (err) {
      console.error('Error submitting booking:', err);
      console.error('Error details:', err.response?.data);

      setError(
        err.response?.data?.message ||
        'We could not submit your booking request. Please check your details and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toLocaleDateString('en-CA');

  return (
    <div className="booking-page">
      <section className="booking-hero">
        <div className="booking-hero-content">
          <span className="section-eyebrow">MUNICIPAL SERVICES</span>
          <h1>Find and Book a Municipal Facility</h1>
          <p>
            Discover community spaces, explore available facilities and
            submit your booking request online.
          </p>

          <div className="hero-highlights">
            <span><FaCheckCircle /> Browse available facilities</span>
            <span><FaCheckCircle /> Simple booking requests</span>
            <span><FaCheckCircle /> Review by municipal staff</span>
          </div>
        </div>
      </section>

      <div className="booking-container">
        {success && (
          <div className="booking-alert success-alert" role="status">
            <FaCheckCircle />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="booking-alert error-alert" role="alert">
            <FaInfoCircle />
            <span>{error}</span>
          </div>
        )}

        <section className="facility-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">EXPLORE OUR SPACES</span>
              <h2>Available Facilities</h2>
              <p>Choose a facility that suits your needs.</p>
            </div>

            <span className="facility-count">
              {facilities.length} {facilities.length === 1 ? 'facility' : 'facilities'}
            </span>
          </div>

          {loading ? (
            <div className="booking-state">
              <div className="loading-spinner" />
              <p>Loading available facilities...</p>
            </div>
          ) : facilities.length === 0 ? (
            <div className="booking-state">
              <FaBuilding className="empty-icon" />
              <h3>No facilities currently available</h3>
              <p>Please check again later.</p>
            </div>
          ) : (
            <div className="facility-grid">
              {facilities.map(facility => {
                const FacilityIcon = getFacilityIcon(facility.type);
                const isSelected =
                  Number(selectedFacility) === Number(facility.id);

                return (
                  <button
                    type="button"
                    className={`facility-card ${isSelected ? 'selected' : ''}`}
                    key={facility.id}
                    onClick={() => handleFacilityChange(facility.id)}
                  >
                    <div className="facility-card-top">
                      <span className="facility-icon">
                        <FacilityIcon />
                      </span>
                      <span className="availability-badge">
                        <span />
                        Available
                      </span>
                    </div>

                    <div className="facility-card-content">
                      <span className="facility-type">{facility.type}</span>
                      <h3>{facility.name}</h3>

                      <p className="facility-location">
                        <FaMapMarkerAlt />
                        {facility.location || 'Location not specified'}
                      </p>

                      <p className="facility-capacity">
                        <FaUsers />
                        Capacity: {facility.capacity} people
                      </p>
                    </div>

                    <span className="facility-card-action">
                      {isSelected ? 'Selected' : 'View facility'}
                      <FaArrowRight />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="booking-section" id="booking-form">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">MAKE A REQUEST</span>
              <h2>Request a Booking</h2>
              <p>Complete the details below to submit your request.</p>
            </div>
          </div>

          <div className="booking-layout">
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-section-title">
                <span className="form-step">01</span>
                <div>
                  <h3>Facility selection</h3>
                  <p>Which municipal facility would you like to book?</p>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="facilityId">Select Facility <span>*</span></label>
                <select
                  id="facilityId"
                  value={selectedFacility}
                  onChange={(e) => handleFacilityChange(e.target.value)}
                  required
                  disabled={loading || facilities.length === 0}
                >
                  <option value="">Choose a facility</option>
                  {facilities.map(facility => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name} ({facility.type})
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="form-fieldset" disabled={!selectedFacilityDetails}>
                <div className="form-section-title">
                  <span className="form-step">02</span>
                  <div>
                    <h3>Your details</h3>
                    <p>Provide the contact information for this request.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="requesterName">Full Name <span>*</span></label>
                    <input
                      id="requesterName"
                      type="text"
                      value={booking.requesterName}
                      onChange={e => updateBooking('requesterName', e.target.value)}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="requesterEmail">Email Address <span>*</span></label>
                    <input
                      id="requesterEmail"
                      type="email"
                      value={booking.requesterEmail}
                      onChange={e => updateBooking('requesterEmail', e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="requesterPhone">Phone Number <span>*</span></label>
                    <input
                      id="requesterPhone"
                      type="tel"
                      value={booking.requesterPhone}
                      onChange={e => updateBooking('requesterPhone', e.target.value)}
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>

                <div className="form-section-title">
                  <span className="form-step">03</span>
                  <div>
                    <h3>Booking information</h3>
                    <p>Tell us when and why you need the facility.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="bookingDate">
                      Booking Date <span>*</span>
                    </label>
                    <div className="input-with-icon">
                      <FaCalendarAlt />
                      <input
                        id="bookingDate"
                        type="date"
                        value={booking.bookingDate}
                        min={today}
                        onChange={e => updateBooking('bookingDate', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="expectedAttendees">
                      Expected Attendees <span>*</span>
                    </label>
                    <div className="input-with-icon">
                      <FaUsers />
                      <input
                        id="expectedAttendees"
                        type="number"
                        value={booking.expectedAttendees}
                        onChange={e => updateBooking('expectedAttendees', e.target.value)}
                        min="1"
                        max={selectedFacilityDetails?.capacity || undefined}
                        placeholder="Number of people"
                        required
                      />
                    </div>
                    {selectedFacilityDetails?.capacity && (
                      <small>
                        Maximum capacity: {selectedFacilityDetails.capacity} people
                      </small>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="startTime">Start Time <span>*</span></label>
                    <div className="input-with-icon">
                      <FaClock />
                      <input
                        id="startTime"
                        type="time"
                        value={booking.startTime}
                        onChange={e => updateBooking('startTime', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="endTime">End Time <span>*</span></label>
                    <div className="input-with-icon">
                      <FaClock />
                      <input
                        id="endTime"
                        type="time"
                        value={booking.endTime}
                        min={booking.startTime || undefined}
                        onChange={e => updateBooking('endTime', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field full-width">
                    <label htmlFor="purpose">Purpose of Booking <span>*</span></label>
                    <textarea
                      id="purpose"
                      value={booking.purpose}
                      onChange={e => updateBooking('purpose', e.target.value)}
                      placeholder="Describe the purpose of your booking..."
                      rows="4"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-booking-button"
                  disabled={!selectedFacilityDetails || submitting}
                >
                  {submitting ? 'Submitting request...' : 'Submit Booking Request'}
                  {!submitting && <FaArrowRight />}
                </button>

                <p className="form-disclaimer">
                  Submitting a request does not guarantee a booking.
                  Municipal staff will review your request.
                </p>
              </fieldset>
            </form>

            <aside className="facility-details-panel">
              {selectedFacilityDetails ? (
                <>
                  <div className="details-panel-heading">
                    <span className="details-icon">
                      <FaBuilding />
                    </span>
                    <span className="details-status">Available</span>
                  </div>

                  <span className="section-eyebrow">SELECTED FACILITY</span>
                  <h3>{selectedFacilityDetails.name}</h3>
                  <p className="details-type">{selectedFacilityDetails.type}</p>

                  <div className="details-information">
                    <div>
                      <FaMapMarkerAlt />
                      <span>{selectedFacilityDetails.location || 'Location not specified'}</span>
                    </div>
                    <div>
                      <FaUsers />
                      <span>Capacity: {selectedFacilityDetails.capacity} people</span>
                    </div>
                  </div>

                  <div className="details-description">
                    <h4>About this facility</h4>
                    <p>
                      {selectedFacilityDetails.description ||
                        'No description is currently available.'}
                    </p>
                  </div>

                  <div className="details-description">
                    <h4>Amenities</h4>
                    <p>
                      {selectedFacilityDetails.amenities ||
                        'No amenities information is currently available.'}
                    </p>
                  </div>

                  <div className="details-note">
                    <FaInfoCircle />
                    <p>Complete the booking form to request this facility.</p>
                  </div>
                </>
              ) : (
                <div className="details-empty">
                  <span className="details-icon">
                    <FaBuilding />
                  </span>
                  <h3>Choose a facility</h3>
                  <p>
                    Select a facility from the catalogue to view its details
                    and complete your booking request.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PublicBooking;
