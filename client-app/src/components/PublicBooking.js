import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5242/api';

function PublicBooking() {
    const [facilities, setFacilities] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState('');
    const [booking, setBooking] = useState({
        facilityId: 0,
        requesterName: '',
        requesterEmail: '',
        requesterPhone: '',
        bookingDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: 0
    });

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            const response = await axios.get(`${API_BASE}/facilities`);
            const available = response.data.filter(f => f.status === 'Available');
            setFacilities(available);
        } catch (error) {
            console.error('Error fetching facilities:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Format the booking data properly
        const bookingData = {
            ...booking,
            bookingDate: new Date(booking.bookingDate).toISOString(),
            startTime: booking.startTime + ":00", // Add seconds
            endTime: booking.endTime + ":00"       // Add seconds
        };

        try {
            await axios.post(`${API_BASE}/bookings`, bookingData);
            alert('Booking request submitted successfully! We will contact you soon.');
            setBooking({
                facilityId: 0,
                requesterName: '',
                requesterEmail: '',
                requesterPhone: '',
                bookingDate: '',
                startTime: '',
                endTime: '',
                purpose: '',
                expectedAttendees: 0
            });
            setSelectedFacility('');
        } catch (error) {
            console.error('Error submitting booking:', error);
            console.error('Error details:', error.response?.data);
            alert('Error submitting booking request. Please try again.');
        }
    };

    const handleFacilityChange = (e) => {
        const facilityId = parseInt(e.target.value);
        setSelectedFacility(facilityId);
        setBooking({ ...booking, facilityId });
    };

    const selectedFacilityDetails = facilities.find(f => f.id === selectedFacility);

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Book a Municipal Facility</h1>
            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
                Browse available facilities and submit a booking request. Our team will review and get back to you shortly.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: selectedFacility ? '1fr 1fr' : '1fr', gap: '30px' }}>
                {/* Booking Form */}
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Request a Booking</h2>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                            Select Facility *
                        </label>
                        <select
                            value={selectedFacility}
                            onChange={handleFacilityChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '5px',
                                border: '1px solid #bdc3c7',
                                fontSize: '16px'
                            }}
                        >
                            <option value="">-- Choose a facility --</option>
                            {facilities.map(facility => (
                                <option key={facility.id} value={facility.id}>
                                    {facility.name} ({facility.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedFacility && (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    value={booking.requesterName}
                                    onChange={(e) => setBooking({ ...booking, requesterName: e.target.value })}
                                    required
                                    placeholder="Full name"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '5px',
                                        border: '1px solid #bdc3c7',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={booking.requesterEmail}
                                    onChange={(e) => setBooking({ ...booking, requesterEmail: e.target.value })}
                                    required
                                    placeholder="email@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '5px',
                                        border: '1px solid #bdc3c7',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={booking.requesterPhone}
                                    onChange={(e) => setBooking({ ...booking, requesterPhone: e.target.value })}
                                    required
                                    placeholder="(555) 123-4567"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '5px',
                                        border: '1px solid #bdc3c7',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                                    Booking Date *
                                </label>
                                <input
                                    type="date"
                                    value={booking.bookingDate}
                                    onChange={(e) => setBooking({ ...booking, bookingDate: e.target.value })}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '5px',
                                        border: '1px solid #bdc3c7',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                                        Start Time *
                                    </label>
                                    <input
                                        type="time"
                                        value={booking.startTime}
                                        onChange={(e) => setBooking({ ...booking, startTime: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '5px',
                                            border: '1px solid #bdc3c7',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                                        End Time *
                                    </label>
                                    <input
                                        type="time"
                                        value={booking.endTime}
                                        onChange={(e) => setBooking({ ...booking, endTime: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '5px',
                                            border: '1px solid #bdc3c7',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                                    Expected Attendees *
                                </label>
                                <input
                                    type="number"
                                    value={booking.expectedAttendees}
                                    onChange={(e) => setBooking({ ...booking, expectedAttendees: parseInt(e.target.value) })}
                                    required
                                    min="1"
                                    placeholder="Number of people"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '5px',
                                        border: '1px solid #bdc3c7',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                                    Purpose of Booking *
                                </label>
                                <textarea
                                    value={booking.purpose}
                                    onChange={(e) => setBooking({ ...booking, purpose: e.target.value })}
                                    required
                                    placeholder="Please describe the purpose of your booking..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '5px',
                                        border: '1px solid #bdc3c7',
                                        fontSize: '16px',
                                        minHeight: '100px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Submit Booking Request
                            </button>
                        </>
                    )}
                </div>

                {/* Facility Details */}
                {selectedFacilityDetails && (
                    <div style={{ backgroundColor: '#ecf0f1', padding: '30px', borderRadius: '8px' }}>
                        <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Facility Details</h2>
                        <h3 style={{ color: '#3498db' }}>{selectedFacilityDetails.name}</h3>

                        <div style={{ marginBottom: '15px' }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '5px 12px',
                                backgroundColor: selectedFacilityDetails.type === 'Building' ? '#3498db' :
                                    selectedFacilityDetails.type === 'Park' ? '#27ae60' : '#9b59b6',
                                color: 'white',
                                borderRadius: '15px',
                                fontSize: '14px',
                                marginRight: '8px'
                            }}>
                                {selectedFacilityDetails.type}
                            </span>
                            <span style={{
                                display: 'inline-block',
                                padding: '5px 12px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                borderRadius: '15px',
                                fontSize: '14px'
                            }}>
                                {selectedFacilityDetails.status}
                            </span>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ margin: '8px 0' }}>
                                <strong>?? Location:</strong> {selectedFacilityDetails.location}
                            </p>
                            <p style={{ margin: '8px 0' }}>
                                <strong>?? Capacity:</strong> {selectedFacilityDetails.capacity} people
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <strong>Description:</strong>
                            <p style={{ color: '#555', lineHeight: '1.6' }}>{selectedFacilityDetails.description}</p>
                        </div>

                        <div>
                            <strong>? Amenities:</strong>
                            <p style={{ color: '#555', lineHeight: '1.6' }}>{selectedFacilityDetails.amenities}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Available Facilities Preview */}
            {!selectedFacility && facilities.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                    <h2 style={{ color: '#2c3e50' }}>Available Facilities</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {facilities.map(facility => (
                            <div
                                key={facility.id}
                                style={{
                                    backgroundColor: 'white',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    border: '2px solid transparent',
                                    transition: 'border-color 0.3s'
                                }}
                                onClick={() => {
                                    setSelectedFacility(facility.id);
                                    setBooking({ ...booking, facilityId: facility.id });
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3498db'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                            >
                                <h3 style={{ color: '#2c3e50', marginTop: 0 }}>{facility.name}</h3>
                                <p style={{ color: '#7f8c8d', fontSize: '14px' }}>{facility.type}</p>
                                <p style={{ color: '#555', fontSize: '14px' }}>?? {facility.location}</p>
                                <p style={{ color: '#555', fontSize: '14px' }}>?? Capacity: {facility.capacity}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PublicBooking;