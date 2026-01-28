import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaUsers, FaBuilding, FaTree, FaLandmark } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const API_BASE = 'http://localhost:5242/api';

const COLORS = ['#3498db', '#27ae60', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c'];

function Reports() {
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [facilitiesRes, bookingsRes, inspectionsRes] = await Promise.all([
        axios.get(`${API_BASE}/facilities`),
        axios.get(`${API_BASE}/bookings`),
        axios.get(`${API_BASE}/inspections`)
      ]);
      setFacilities(facilitiesRes.data);
      setBookings(bookingsRes.data);
      setInspections(inspectionsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalFacilities = facilities.length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const approvedBookings = bookings.filter(b => b.status === 'Approved').length;
  const completedBookings = bookings.filter(b => b.status === 'Completed').length;
  const rejectedBookings = bookings.filter(b => b.status === 'Rejected').length;
  const totalInspections = inspections.length;
  const damageReports = inspections.filter(i => i.damagesFound).length;

  // Facility type distribution
  const facilityTypeData = facilities.reduce((acc, facility) => {
    const type = facility.type;
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, []);

  // Booking status distribution
  const bookingStatusData = [
    { name: 'Pending', value: pendingBookings },
    { name: 'Approved', value: approvedBookings },
    { name: 'Completed', value: completedBookings },
    { name: 'Rejected', value: rejectedBookings }
  ].filter(item => item.value > 0);

  // Most popular facilities (by booking count)
  const facilityBookingCount = facilities.map(facility => ({
    name: facility.name,
    bookings: bookings.filter(b => b.facilityId === facility.id).length
  })).sort((a, b) => b.bookings - a.bookings).slice(0, 5);

  // Monthly bookings trend (last 6 months)
  const getMonthlyBookings = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.bookingDate);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
    });

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      bookings: count
    })).slice(-6);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px', color: '#7f8c8d' }}>
        Loading reports...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto', padding: '30px', backgroundColor: '#ecf0f1', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '10px', fontSize: '32px' }}>?? Reports & Analytics</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px', fontSize: '16px' }}>
        Comprehensive overview of municipal assets and bookings
      </p>
      
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{
          backgroundColor: '#3498db',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '16px', opacity: 0.9 }}>Total Facilities</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', marginTop: '10px' }}>{totalFacilities}</div>
          <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>Buildings, Parks & More</div>
        </div>

        <div style={{
          backgroundColor: '#27ae60',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '16px', opacity: 0.9 }}>Total Bookings</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', marginTop: '10px' }}>{totalBookings}</div>
          <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>All time</div>
        </div>

        <div style={{
          backgroundColor: '#f39c12',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '16px', opacity: 0.9 }}>Pending Requests</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', marginTop: '10px' }}>{pendingBookings}</div>
          <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>Awaiting approval</div>
        </div>

        <div style={{
          backgroundColor: '#9b59b6',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '16px', opacity: 0.9 }}>Inspections</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', marginTop: '10px' }}>{totalInspections}</div>
          <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
            {damageReports} damage reports
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Facility Types Chart */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Facility Distribution by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={facilityTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {facilityTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Chart */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Booking Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3498db" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Most Popular Facilities */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Most Popular Facilities</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={facilityBookingCount} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#27ae60" name="Total Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Booking Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getMonthlyBookings()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#e74c3c" strokeWidth={3} name="Monthly Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#2c3e50', marginTop: 0 }}>Recent Bookings</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#ecf0f1' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Facility</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Requester</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Attendees</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(-10).reverse().map((booking, index) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '12px', color: '#555' }}>{booking.facility?.name || 'N/A'}</td>
                  <td style={{ padding: '12px', color: '#555' }}>{booking.requesterName}</td>
                  <td style={{ padding: '12px', color: '#555' }}>
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: 
                        booking.status === 'Pending' ? '#f39c12' :
                        booking.status === 'Approved' ? '#27ae60' :
                        booking.status === 'Completed' ? '#3498db' : '#e74c3c',
                      color: 'white'
                    }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#555' }}>{booking.expectedAttendees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;