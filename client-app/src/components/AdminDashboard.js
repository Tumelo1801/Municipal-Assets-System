import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';

function AdminDashboard() {
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('facilities');
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    if (status === 'Rejected' && (!notes || notes.trim() === '')) {
      alert('Please provide a reason for rejecting this booking.');
      return;
    }

    try {
      await axios.put(`${API_BASE}/bookings/${id}/status?status=${status}&adminNotes=${encodeURIComponent(notes || '')}`);
      fetchBookings();
      
      if (status === 'Approved') {
        alert('Booking approved successfully! The requester will be notified.');
      } else if (status === 'Rejected') {
        alert('Booking rejected. The requester will be notified with your reason.');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking status');
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const approvedBookings = bookings.filter(b => b.status === 'Approved');
  
  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto', padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '8px', fontSize: '36px', fontWeight: 'bold' }}>Admin Dashboard</h1>
        <p style={{ color: '#7f8c8d', fontSize: '16px' }}>Manage facilities, bookings, and municipal assets</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Facilities</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{facilities.length}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Pending Bookings</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{pendingBookings.length}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Approved Bookings</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{approvedBookings.length}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(67, 233, 123, 0.4)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Bookings</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{bookings.length}</div>
        </div>
      </div>

      <div style={{ marginBottom: '30px', borderBottom: '3px solid #ecf0f1', display: 'flex', gap: '5px' }}>
        <button onClick={() => setActiveTab('facilities')} style={{ padding: '15px 30px', backgroundColor: activeTab === 'facilities' ? '#3498db' : 'transparent', color: activeTab === 'facilities' ? 'white' : '#2c3e50', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', transition: 'all 0.3s', transform: activeTab === 'facilities' ? 'translateY(3px)' : 'translateY(0)' }}>Facilities</button>
        <button onClick={() => setActiveTab('bookings')} style={{ padding: '15px 30px', backgroundColor: activeTab === 'bookings' ? '#3498db' : 'transparent', color: activeTab === 'bookings' ? 'white' : '#2c3e50', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', transition: 'all 0.3s', transform: activeTab === 'bookings' ? 'translateY(3px)' : 'translateY(0)', position: 'relative' }}>
          Bookings
          {pendingBookings.length > 0 && <span style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: '#e74c3c', color: 'white', borderRadius: '50%', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold' }}>{pendingBookings.length}</span>}
        </button>
      </div>

      {activeTab === 'facilities' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
            <input type="text" placeholder="Search facilities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '12px 20px', borderRadius: '8px', border: '2px solid #ecf0f1', fontSize: '16px', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = '#3498db'} onBlur={(e) => e.target.style.borderColor = '#ecf0f1'} />
            <button onClick={() => setShowAddFacility(!showAddFacility)} style={{ padding: '12px 30px', background: showAddFacility ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(67, 233, 123, 0.4)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>{showAddFacility ? 'Cancel' : '+ Add New Facility'}</button>
          </div>

          {showAddFacility && (
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)' }}>
              <h3 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>Add New Facility</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input type="text" placeholder="Facility Name" value={newFacility.name} onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px' }} />
                <select value={newFacility.type} onChange={(e) => setNewFacility({ ...newFacility, type: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px' }}><option value="Building">Building</option><option value="Park">Park</option><option value="Facility">Facility</option></select>
                <input type="text" placeholder="Location" value={newFacility.location} onChange={(e) => setNewFacility({ ...newFacility, location: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px' }} />
                <input type="number" placeholder="Capacity" value={newFacility.capacity} onChange={(e) => setNewFacility({ ...newFacility, capacity: parseInt(e.target.value) })} required style={{ padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px' }} />
              </div>
              <textarea placeholder="Description" value={newFacility.description} onChange={(e) => setNewFacility({ ...newFacility, description: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', marginTop: '15px', minHeight: '80px', fontSize: '16px', resize: 'vertical' }} />
              <input type="text" placeholder="Amenities (comma separated)" value={newFacility.amenities} onChange={(e) => setNewFacility({ ...newFacility, amenities: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', marginTop: '15px', fontSize: '16px' }} />
              <button onClick={handleAddFacility} style={{ marginTop: '20px', padding: '14px 30px', backgroundColor: 'white', color: '#667eea', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>Add Facility</button>
            </div>
          )}

          {editingFacility && (
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 8px 25px rgba(245, 87, 108, 0.3)' }}>
              <h3 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>Edit Facility</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input type="text" placeholder="Facility Name" value={editingFacility.name} onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px' }} />
                <select value={editingFacility.type} onChange={(e) => setEditingFacility({ ...editingFacility, type: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px' }}><option value="Building">Building</option><option value="Park">Park</option><option value="Facility">Facility</option></select>
                <input type="text" placeholder="Location" value={editingFacility.location} onChange={(e) => setEditingFacility({ ...editingFacility, location: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px' }} />
                <input type="number" placeholder="Capacity" value={editingFacility.capacity} onChange={(e) => setEditingFacility({ ...editingFacility, capacity: parseInt(e.target.value) })} required style={{ padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px' }} />
              </div>
              <textarea placeholder="Description" value={editingFacility.description} onChange={(e) => setEditingFacility({ ...editingFacility, description: e.target.value })} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', marginTop: '15px', minHeight: '80px', fontSize: '16px', resize: 'vertical' }} />
              <input type="text" placeholder="Amenities (comma separated)" value={editingFacility.amenities} onChange={(e) => setEditingFacility({ ...editingFacility, amenities: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', marginTop: '15px', fontSize: '16px' }} />
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={handleUpdateFacility} style={{ padding: '14px 30px', backgroundColor: 'white', color: '#f5576c', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>Update Facility</button>
                <button onClick={() => setEditingFacility(null)} style={{ padding: '14px 30px', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', border: '2px solid white', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
            {filteredFacilities.map((facility) => (
              <div key={facility.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h3 style={{ color: '#2c3e50', marginTop: 0, fontSize: '20px' }}>{facility.name}</h3>
                  <span style={{ padding: '6px 12px', backgroundColor: facility.status === 'Available' ? '#27ae60' : '#e74c3c', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{facility.status}</span>
                </div>
                <div style={{ marginBottom: '15px' }}><span style={{ display: 'inline-block', padding: '6px 14px', backgroundColor: facility.type === 'Building' ? '#3498db' : facility.type === 'Park' ? '#27ae60' : '#9b59b6', color: 'white', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>{facility.type}</span></div>
                <div style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', marginBottom: '15px' }}>
                  <p style={{ margin: '8px 0' }}><strong>Location:</strong> {facility.location}</p>
                  <p style={{ margin: '8px 0' }}><strong>Capacity:</strong> {facility.capacity} people</p>
                  <p style={{ margin: '8px 0' }}>{facility.description}</p>
                  <p style={{ margin: '8px 0' }}><strong>Amenities:</strong> {facility.amenities}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => setEditingFacility(facility)} style={{ flex: 1, padding: '10px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.3s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#e67e22'} onMouseLeave={(e) => e.target.style.backgroundColor = '#f39c12'}>Edit</button>
                  <button onClick={() => handleDeleteFacility(facility.id)} style={{ flex: 1, padding: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.3s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'} onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <h2 style={{ color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>Pending Booking Requests {pendingBookings.length > 0 && <span style={{ backgroundColor: '#e74c3c', color: 'white', borderRadius: '50%', padding: '6px 12px', fontSize: '16px', fontWeight: 'bold' }}>{pendingBookings.length}</span>}</h2>
          {pendingBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}><div style={{ fontSize: '60px', marginBottom: '20px' }}>?</div><p style={{ color: '#7f8c8d', fontSize: '18px' }}>No pending booking requests</p></div>
          ) : (
            <div style={{ display: 'grid', gap: '25px' }}>
              {pendingBookings.map((booking) => (
                <div key={booking.id} style={{ background: 'linear-gradient(135deg, #fff3cd 0%, #ffe5a0 100%)', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)', border: '3px solid #ffc107' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50', fontSize: '22px' }}>{booking.facility?.name}</h3>
                    <span style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: '#2c3e50', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>{booking.status}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', color: '#2c3e50' }}>
                    <p style={{ margin: 0 }}><strong>Requester:</strong> {booking.requesterName}</p>
                    <p style={{ margin: 0 }}><strong>Email:</strong> {booking.requesterEmail}</p>
                    <p style={{ margin: 0 }}><strong>Phone:</strong> {booking.requesterPhone}</p>
                    <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                    <p style={{ margin: 0 }}><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
                    <p style={{ margin: 0 }}><strong>Attendees:</strong> {booking.expectedAttendees}</p>
                  </div>
                  <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #ffc107' }}>
                    <h4 style={{ marginTop: 0, color: '#2c3e50', fontSize: '16px' }}>Booking Purpose / Reason:</h4>
                    <p style={{ margin: 0, color: '#2c3e50', fontSize: '15px', lineHeight: '1.6' }}>{booking.purpose}</p>
                  </div>
                  <p style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '20px' }}>Requested on: {new Date(booking.requestDate).toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => { const notes = prompt('Add admin notes (optional - will be sent to requester):'); if (notes !== null) { handleBookingStatus(booking.id, 'Approved', notes); } }} style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(67, 233, 123, 0.4)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>Approve</button>
                    <button onClick={() => { const notes = prompt('REQUIRED: Please provide a reason for rejection (this will be sent to the requester):'); if (notes && notes.trim() !== '') { handleBookingStatus(booking.id, 'Rejected', notes); } else if (notes !== null) { alert('Rejection reason is required. Please provide a reason why this booking is being rejected.'); } }} style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(250, 112, 154, 0.4)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ color: '#2c3e50', marginTop: '50px', display: 'flex', alignItems: 'center', gap: '10px' }}>Approved Bookings {approvedBookings.length > 0 && <span style={{ backgroundColor: '#27ae60', color: 'white', borderRadius: '50%', padding: '6px 12px', fontSize: '16px', fontWeight: 'bold' }}>{approvedBookings.length}</span>}</h2>
          {approvedBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}><div style={{ fontSize: '60px', marginBottom: '20px' }}>-</div><p style={{ color: '#7f8c8d', fontSize: '18px' }}>No approved bookings yet</p></div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {approvedBookings.map((booking) => (
                <div key={booking.id} style={{ background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)', padding: '20px', borderRadius: '12px', border: '2px solid #27ae60', boxShadow: '0 4px 15px rgba(39, 174, 96, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ marginTop: 0, marginBottom: '8px', color: '#2c3e50', fontSize: '18px' }}>{booking.facility?.name} - {booking.requesterName}</h4>
                      <p style={{ margin: 0, color: '#155724' }}><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()} | <strong> Time:</strong> {booking.startTime} - {booking.endTime}</p>
                    </div>
                    <span style={{ padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>Approved</span>
                  </div>
                  {booking.adminNotes && <div style={{ marginTop: '15px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '14px', color: '#155724' }}><strong>Admin Notes:</strong> {booking.adminNotes}</p></div>}
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