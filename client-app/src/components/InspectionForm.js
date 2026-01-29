import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';

function InspectionForm() {
    const [bookings, setBookings] = useState([]);
    const [inspections, setInspections] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState('');
    const [inspection, setInspection] = useState({
        bookingId: 0,
        inspectorName: '',
        inspectorContact: '',
        conditionBefore: '',
        conditionAfter: '',
        damagesFound: false,
        damageDescription: '',
        inspectionNotes: ''
    });

    useEffect(() => {
        fetchApprovedBookings();
        fetchInspections();
    }, []);

    const fetchApprovedBookings = async () => {
        try {
            const response = await axios.get(`${API_BASE}/bookings/status/Approved`);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const fetchInspections = async () => {
        try {
            const response = await axios.get(`${API_BASE}/inspections`);
            setInspections(response.data);
        } catch (error) {
            console.error('Error fetching inspections:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/inspections`, inspection);
            alert('Inspection submitted successfully!');
            setInspection({
                bookingId: 0,
                inspectorName: '',
                inspectorContact: '',
                conditionBefore: '',
                conditionAfter: '',
                damagesFound: false,
                damageDescription: '',
                inspectionNotes: ''
            });
            setSelectedBooking('');
            fetchApprovedBookings();
            fetchInspections();
        } catch (error) {
            console.error('Error submitting inspection:', error);
            alert('Error submitting inspection. Please try again.');
        }
    };

    const handleBookingChange = (e) => {
        const bookingId = parseInt(e.target.value);
        setSelectedBooking(bookingId);
        setInspection({ ...inspection, bookingId });
    };

    const selectedBookingDetails = bookings.find(b => b.id === selectedBooking);

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Post-Event Inspection</h1>
            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
                Complete this form after an event to document the condition of the facility.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                {/* Inspection Form */}
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Inspection Details</h2>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                            Select Booking to Inspect *
                        </label>
                        <select
                            value={selectedBooking}
                            onChange={handleBookingChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '5px',
                                border: '1px solid #bdc3c7',
                                fontSize: '16px'
                            }}
                        >
                            <option value="">-- Choose a booking --</option>
                            {bookings.map(booking => (
                                <option key={booking.id} value={booking.id}>
                                    {booking.facility?.name} - {booking.requesterName} ({new Date(booking.bookingDate).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedBooking && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                                        Inspector Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={inspection.inspectorName}
                                        onChange={(e) => setInspection({ ...inspection, inspectorName: e.target.value })}
                                        required
                                        placeholder="Your full name"
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
                                        Inspector Contact *
                                    </label>
                                    <input
                                        type="text"
                                        value={inspection.inspectorContact}
                                        onChange={(e) => setInspection({ ...inspection, inspectorContact: e.target.value })}
                                        required
                                        placeholder="Phone or email"
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
                                    Condition Before Event *
                                </label>
                                <textarea
                                    value={inspection.conditionBefore}
                                    onChange={(e) => setInspection({ ...inspection, conditionBefore: e.target.value })}
                                    required
                                    placeholder="Describe the condition before the event..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '5px',
                                        border: '1px solid #bdc3c7',
                                        fontSize: '16px',
                                        minHeight: '80px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                                    Condition After Event *
                                </label>
                                <textarea
                                    value={inspection.conditionAfter}
                                    onChange={(e) => setInspection({ ...inspection, conditionAfter: e.target.value })}
                                    required
                                    placeholder="Describe the condition after the event..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '5px',
                                        border: '1px solid #bdc3c7',
                                        fontSize: '16px',
                                        minHeight: '80px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={inspection.damagesFound}
                                        onChange={(e) => setInspection({ ...inspection, damagesFound: e.target.checked })}
                                        style={{ marginRight: '10px', width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontWeight: 'bold', color: inspection.damagesFound ? '#e74c3c' : '#2c3e50' }}>
                                        Damages Found
                                    </span>
                                </label>
                            </div>

                            {inspection.damagesFound && (
                                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffebee', borderRadius: '5px', border: '2px solid #e74c3c' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#c62828' }}>
                                        Damage Description *
                                    </label>
                                    <textarea
                                        value={inspection.damageDescription}
                                        onChange={(e) => setInspection({ ...inspection, damageDescription: e.target.value })}
                                        required={inspection.damagesFound}
                                        placeholder="Describe the damages found in detail..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '5px',
                                            border: '1px solid #e74c3c',
                                            fontSize: '16px',
                                            minHeight: '100px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            )}

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                                    Additional Notes
                                </label>
                                <textarea
                                    value={inspection.inspectionNotes}
                                    onChange={(e) => setInspection({ ...inspection, inspectionNotes: e.target.value })}
                                    placeholder="Any additional observations or notes..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '5px',
                                        border: '1px solid #bdc3c7',
                                        fontSize: '16px',
                                        minHeight: '80px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    backgroundColor: '#27ae60',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Submit Inspection
                            </button>
                        </>
                    )}
                </div>

                {/* Booking Details Sidebar */}
                {selectedBookingDetails && (
                    <div style={{ backgroundColor: '#ecf0f1', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Booking Details</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ margin: '8px 0' }}><strong>Facility:</strong> {selectedBookingDetails.facility?.name}</p>
                            <p style={{ margin: '8px 0' }}><strong>Type:</strong> {selectedBookingDetails.facility?.type}</p>
                            <p style={{ margin: '8px 0' }}><strong>Location:</strong> {selectedBookingDetails.facility?.location}</p>
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px solid #bdc3c7', margin: '15px 0' }} />
                        <div>
                            <p style={{ margin: '8px 0' }}><strong>Requester:</strong> {selectedBookingDetails.requesterName}</p>
                            <p style={{ margin: '8px 0' }}><strong>Date:</strong> {new Date(selectedBookingDetails.bookingDate).toLocaleDateString()}</p>
                            <p style={{ margin: '8px 0' }}><strong>Time:</strong> {selectedBookingDetails.startTime} - {selectedBookingDetails.endTime}</p>
                            <p style={{ margin: '8px 0' }}><strong>Attendees:</strong> {selectedBookingDetails.expectedAttendees}</p>
                            <p style={{ margin: '8px 0' }}><strong>Purpose:</strong> {selectedBookingDetails.purpose}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Inspections */}
            <div style={{ marginTop: '50px' }}>
                <h2 style={{ color: '#2c3e50' }}>Recent Inspections</h2>
                {inspections.length === 0 ? (
                    <p style={{ color: '#7f8c8d' }}>No inspections recorded yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {inspections.map(insp => (
                            <div
                                key={insp.id}
                                style={{
                                    backgroundColor: insp.damagesFound ? '#ffebee' : '#e8f5e9',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    border: `2px solid ${insp.damagesFound ? '#e74c3c' : '#27ae60'}`
                                }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                                    <div>
                                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>
                                            {insp.booking?.facility?.name}
                                            {insp.damagesFound && (
                                                <span style={{
                                                    marginLeft: '10px',
                                                    padding: '4px 12px',
                                                    backgroundColor: '#e74c3c',
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    fontSize: '14px'
                                                }}>
                                                    ⚠️ Damages Found
                                                </span>
                                            )}
                                        </h3>
                                        <p style={{ color: '#555' }}><strong>Inspector:</strong> {insp.inspectorName} ({insp.inspectorContact})</p>
                                        <p style={{ color: '#555' }}><strong>Date:</strong> {new Date(insp.inspectionDate).toLocaleString()}</p>
                                        <p style={{ color: '#555' }}><strong>Condition Before:</strong> {insp.conditionBefore}</p>
                                        <p style={{ color: '#555' }}><strong>Condition After:</strong> {insp.conditionAfter}</p>
                                        {insp.damagesFound && (
                                            <p style={{ color: '#c62828', fontWeight: 'bold' }}>
                                                <strong>Damage Report:</strong> {insp.damageDescription}
                                            </p>
                                        )}
                                        {insp.inspectionNotes && (
                                            <p style={{ color: '#555' }}><strong>Notes:</strong> {insp.inspectionNotes}</p>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
                                            <strong>Booking:</strong><br />
                                            {insp.booking?.requesterName}<br />
                                            {new Date(insp.booking?.bookingDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InspectionForm;