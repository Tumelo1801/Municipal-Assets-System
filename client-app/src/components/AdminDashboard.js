import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5242/api';

function AdminDashboard() {
    const [facilities, setFacilities] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('facilities');
    const [showAddFacility, setShowAddFacility] = useState(false);
    const [editingFacility, setEditingFacility] = useState(null);

    const [newFacility, setNewFacility] = useState({
        name: '',
        type: 'Building',
        location: '',
        description: '',
        capacity: 0,
        amenities: '',
        status: 'Available'
    });

    useEffect(() => {
        fetchFacilities();
        fetchBookings();
    }, []);

    const fetchFacilities = async () => {
        try {
            const response = await axios.get(`${API_BASE}/facilities`);
            setFacilities(response.data);
        } catch (error) {
            console.error('Error fetching facilities:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await axios.get(`${API_BASE}/bookings`);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleAddFacility = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/facilities`, newFacility);
            setNewFacility({
                name: '',
                type: 'Building',
                location: '',
                description: '',
                capacity: 0,
                amenities: '',
                status: 'Available'
            });
            setShowAddFacility(false);
            fetchFacilities();
            alert('Facility added successfully!');
        } catch (error) {
            console.error('Error adding facility:', error);
            alert('Error adding facility');
        }
    };

    const handleUpdateFacility = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_BASE}/facilities/${editingFacility.id}`, editingFacility);
            setEditingFacility(null);
            fetchFacilities();
            alert('Facility updated successfully!');
        } catch (error) {
            console.error('Error updating facility:', error);
            alert('Error updating facility');
        }
    };

    const handleDeleteFacility = async (id) => {
        if (window.confirm('Are you sure you want to delete this facility?')) {
            try {
                await axios.delete(`${API_BASE}/facilities/${id}`);
                fetchFacilities();
                alert('Facility deleted successfully!');
            } catch (error) {
                console.error('Error deleting facility:', error);
                alert('Error deleting facility');
            }
        }
    };

    const handleBookingStatus = async (id, status, notes) => {
        try {
            await axios.put(`${API_BASE}/bookings/${id}/status?status=${status}&adminNotes=${notes || ''}`);
            fetchBookings();
            alert(`Booking ${status.toLowerCase()} successfully!`);
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('Error updating booking status');
        }
    };

    const pendingBookings = bookings.filter(b => b.status === 'Pending');
    const approvedBookings = bookings.filter(b => b.status === 'Approved');

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>Municipal Assets Admin Dashboard</h1>

            {/* Tabs */}
            <div style={{ marginBottom: '30px', borderBottom: '2px solid #ecf0f1' }}>
                <button
                    onClick={() => setActiveTab('facilities')}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: activeTab === 'facilities' ? '#3498db' : '#ecf0f1',
                        color: activeTab === 'facilities' ? 'white' : '#2c3e50',
                        border: 'none',
                        borderRadius: '5px 5px 0 0',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Facilities
                </button>
                <button
                    onClick={() => setActiveTab('bookings')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'bookings' ? '#3498db' : '#ecf0f1',
                        color: activeTab === 'bookings' ? 'white' : '#2c3e50',
                        border: 'none',
                        borderRadius: '5px 5px 0 0',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Bookings {pendingBookings.length > 0 && (
                        <span style={{ backgroundColor: '#e74c3c', borderRadius: '50%', padding: '2px 8px', marginLeft: '5px' }}>
                            {pendingBookings.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Facilities Tab */}
            {activeTab === 'facilities' && (
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <button
                            onClick={() => setShowAddFacility(!showAddFacility)}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            {showAddFacility ? 'Cancel' : '+ Add New Facility'}
                        </button>
                    </div>

                    {/* Add Facility Form */}
                    {showAddFacility && (
                        <div style={{ backgroundColor: '#ecf0f1', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                            <h3>Add New Facility</h3>
                            <form onSubmit={handleAddFacility}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <input
                                        type="text"
                                        placeholder="Facility Name"
                                        value={newFacility.name}
                                        onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                                        required
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                                    />
                                    <select
                                        value={newFacility.type}
                                        onChange={(e) => setNewFacility({ ...newFacility, type: e.target.value })}
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                                    >
                                        <option value="Building">Building</option>
                                        <option value="Park">Park</option>
                                        <option value="Facility">Facility</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Location"
                                        value={newFacility.location}
                                        onChange={(e) => setNewFacility({ ...newFacility, location: e.target.value })}
                                        required
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Capacity"
                                        value={newFacility.capacity}
                                        onChange={(e) => setNewFacility({ ...newFacility, capacity: parseInt(e.target.value) })}
                                        required
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                                    />
                                </div>
                                <textarea
                                    placeholder="Description"
                                    value={newFacility.description}
                                    onChange={(e) => setNewFacility({ ...newFacility, description: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7', marginTop: '15px', minHeight: '80px' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Amenities (comma separated)"
                                    value={newFacility.amenities}
                                    onChange={(e) => setNewFacility({ ...newFacility, amenities: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7', marginTop: '15px' }}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '15px',
                                        padding: '12px 24px',
                                        backgroundColor: '#27ae60',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    Add Facility
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Edit Facility Form */}
                    {editingFacility && (
                        <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #ffc107' }}>
                            <h3>Edit Facility</h3>
                            <form onSubmit={handleUpdateFacility}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <input
                                        type="text"
                                        placeholder="Facility Name"
                                        value={editingFacility.name}
                                        onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })}
                                        required
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                                    />
                                    <select
                                        value={editingFacility.type}
                                        onChange={(e) => setEditingFacility({ ...editingFacility, type: e.target.value })}
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                                    >
                                        <option value="Building">Building</option>
                                        <option value="Park">Park</option>
                                        <option value="Facility">Facility</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Location"
                                        value={editingFacility.location}
                                        onChange={(e) => setEditingFacility({ ...editingFacility, location: e.target.value })}
                                        required
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Capacity"
                                        value={editingFacility.capacity}
                                        onChange={(e) => setEditingFacility({ ...editingFacility, capacity: parseInt(e.target.value) })}
                                        required
                                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }}
                                    />
                                </div>
                                <textarea
                                    placeholder="Description"
                                    value={editingFacility.description}
                                    onChange={(e) => setEditingFacility({ ...editingFacility, description: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7', marginTop: '15px', minHeight: '80px' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Amenities (comma separated)"
                                    value={editingFacility.amenities}
                                    onChange={(e) => setEditingFacility({ ...editingFacility, amenities: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7', marginTop: '15px' }}
                                />
                                <div style={{ marginTop: '15px' }}>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '12px 24px',
                                            backgroundColor: '#f39c12',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            marginRight: '10px'
                                        }}
                                    >
                                        Update Facility
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingFacility(null)}
                                        style={{
                                            padding: '12px 24px',
                                            backgroundColor: '#95a5a6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '16px'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Facilities List */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {facilities.map((facility) => (
                            <div
                                key={facility.id}
                                style={{
                                    backgroundColor: 'white',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    border: '1px solid #ecf0f1'
                                }}
                            >
                                <h3 style={{ color: '#2c3e50', marginTop: 0 }}>{facility.name}</h3>
                                <div style={{ marginBottom: '10px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '5px 10px',
                                        backgroundColor: facility.type === 'Building' ? '#3498db' : facility.type === 'Park' ? '#27ae60' : '#9b59b6',
                                        color: 'white',
                                        borderRadius: '15px',
                                        fontSize: '12px',
                                        marginRight: '5px'
                                    }}>
                                        {facility.type}
                                    </span>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '5px 10px',
                                        backgroundColor: facility.status === 'Available' ? '#27ae60' : '#e74c3c',
                                        color: 'white',
                                        borderRadius: '15px',
                                        fontSize: '12px'
                                    }}>
                                        {facility.status}
                                    </span>
                                </div>
                                <p style={{ color: '#7f8c8d', fontSize: '14px' }}><strong>Location:</strong> {facility.location}</p>
                                <p style={{ color: '#7f8c8d', fontSize: '14px' }}><strong>Capacity:</strong> {facility.capacity} people</p>
                                <p style={{ color: '#7f8c8d', fontSize: '14px' }}>{facility.description}</p>
                                <p style={{ color: '#7f8c8d', fontSize: '14px' }}><strong>Amenities:</strong> {facility.amenities}</p>
                                <div style={{ marginTop: '15px' }}>
                                    <button
                                        onClick={() => setEditingFacility(facility)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#f39c12',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            marginRight: '10px'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFacility(facility.id)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div>
                    <h2>Pending Booking Requests ({pendingBookings.length})</h2>
                    {pendingBookings.length === 0 ? (
                        <p style={{ color: '#7f8c8d' }}>No pending booking requests</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {pendingBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    style={{
                                        backgroundColor: '#fff3cd',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        border: '2px solid #ffc107'
                                    }}
                                >
                                    <h3 style={{ marginTop: 0 }}>{booking.facility?.name}</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        <p><strong>Requester:</strong> {booking.requesterName}</p>
                                        <p><strong>Email:</strong> {booking.requesterEmail}</p>
                                        <p><strong>Phone:</strong> {booking.requesterPhone}</p>
                                        <p><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                        <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
                                        <p><strong>Attendees:</strong> {booking.expectedAttendees}</p>
                                    </div>
                                    <p><strong>Purpose:</strong> {booking.purpose}</p>
                                    <p style={{ fontSize: '12px', color: '#7f8c8d' }}>Requested on: {new Date(booking.requestDate).toLocaleString()}</p>
                                    <div style={{ marginTop: '15px' }}>
                                        <button
                                            onClick={() => {
                                                const notes = prompt('Add admin notes (optional):');
                                                handleBookingStatus(booking.id, 'Approved', notes);
                                            }}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#27ae60',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                marginRight: '10px'
                                            }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                const notes = prompt('Reason for rejection:');
                                                if (notes) handleBookingStatus(booking.id, 'Rejected', notes);
                                            }}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#e74c3c',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <h2 style={{ marginTop: '40px' }}>Approved Bookings ({approvedBookings.length})</h2>
                    {approvedBookings.length === 0 ? (
                        <p style={{ color: '#7f8c8d' }}>No approved bookings</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {approvedBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    style={{
                                        backgroundColor: '#d4edda',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        border: '1px solid #27ae60'
                                    }}
                                >
                                    <h4 style={{ marginTop: 0 }}>{booking.facility?.name} - {booking.requesterName}</h4>
                                    <p><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()} | <strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
                                    {booking.adminNotes && <p style={{ fontSize: '14px', color: '#155724' }}><strong>Notes:</strong> {booking.adminNotes}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;