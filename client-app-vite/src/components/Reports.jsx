
import React, { useEffect, useMemo, useState } from 'react';
import {
  FaBuilding,
  FaCalendarCheck,
  FaClock,
  FaClipboardCheck,
  FaChartPie,
  FaChartBar,
  FaChartLine,
  FaExclamationTriangle,
  FaRedo
} from 'react-icons/fa';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

import api from '../services/api';
import './Reports.css';

const COLORS = ['#2589d8', '#16845b', '#d99022', '#dc4c4c', '#64748b', '#7c6ac7'];

function Reports() {
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [facilitiesRes, bookingsRes, inspectionsRes] = await Promise.all([
        api.get('/facilities'),
        api.get('/bookings'),
        api.get('/inspections')
      ]);

      setFacilities(facilitiesRes.data);
      setBookings(bookingsRes.data);
      setInspections(inspectionsRes.data);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Unable to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statistics = useMemo(() => ({
    totalFacilities: facilities.length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'Pending').length,
    approvedBookings: bookings.filter(b => b.status === 'Approved').length,
    completedBookings: bookings.filter(b => b.status === 'Completed').length,
    rejectedBookings: bookings.filter(b => b.status === 'Rejected').length,
    unattendedBookings: bookings.filter(b => b.status === 'Unattended').length,
    totalInspections: inspections.length,
    damageReports: inspections.filter(i => i.damagesFound).length
  }), [facilities, bookings, inspections]);

  const facilityBookingDistributionData = useMemo(() => {
    return facilities
      .map(facility => ({
        name: facility.name,
        value: bookings.filter(
          booking => Number(booking.facilityId) === Number(facility.id)
        ).length
      }))
      .filter(facility => facility.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [facilities, bookings]);

  const bookingStatusData = useMemo(() => [
    { name: 'Pending', value: statistics.pendingBookings },
    { name: 'Approved', value: statistics.approvedBookings },
    { name: 'Completed', value: statistics.completedBookings },
    { name: 'Rejected', value: statistics.rejectedBookings },
    { name: 'Unattended', value: statistics.unattendedBookings }
  ], [statistics]);

  const facilityBookingData = useMemo(() => {
    return facilities
      .map(facility => ({
        name: facility.name,
        bookings: bookings.filter(
          booking => Number(booking.facilityId) === Number(facility.id)
        ).length
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }, [facilities, bookings]);

  const monthlyBookingData = useMemo(() => {
    const now = new Date();

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1
      );

      return {
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        month: date.toLocaleDateString('en-ZA', { month: 'short' }),
        bookings: 0
      };
    });

    bookings.forEach(booking => {
      if (!booking.bookingDate) return;

      const date = new Date(booking.bookingDate);
      if (Number.isNaN(date.getTime())) return;

      const matchingMonth = months.find(
        item =>
          item.year === date.getFullYear() &&
          item.monthIndex === date.getMonth()
      );

      if (matchingMonth) {
        matchingMonth.bookings += 1;
      }
    });

    return months.map(item => ({
      month: `${item.month} ${String(item.year).slice(-2)}`,
      bookings: item.bookings
    }));
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const dateA = new Date(a.bookingDate || 0).getTime();
        const dateB = new Date(b.bookingDate || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [bookings]);

  const formatDate = (date) => {
    if (!date) return 'Not specified';

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return 'Not specified';

    return parsedDate.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'report-status-pending';
      case 'Approved':
        return 'report-status-approved';
      case 'Completed':
        return 'report-status-completed';
      case 'Rejected':
        return 'report-status-rejected';
       case 'Unattended':
        return 'report-status-unattended';
      default:
        return 'report-status-default';
     
    }
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <FaChartBar />
          <p>Loading reports and analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-heading">
        <div>
          <span className="reports-eyebrow">PERFORMANCE OVERVIEW</span>
          <h1>Reports & Analytics</h1>
          <p>
            Monitor municipal facilities, booking activity and inspection
            performance.
          </p>
        </div>

        <button
          className="reports-refresh-button"
          type="button"
          onClick={fetchData}
          disabled={loading}
        >
          <FaRedo />
          Refresh Reports
        </button>
      </div>

      {error && (
        <div className="reports-error">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button type="button" onClick={fetchData}>Try again</button>
        </div>
      )}

      <section className="reports-stat-grid">
        <article className="reports-stat-card">
          <div className="reports-stat-icon"><FaBuilding /></div>
          <div>
            <span>Total Facilities</span>
            <strong>{statistics.totalFacilities}</strong>
            <small>Registered municipal facilities</small>
          </div>
        </article>

        <article className="reports-stat-card">
          <div className="reports-stat-icon"><FaCalendarCheck /></div>
          <div>
            <span>Total Bookings</span>
            <strong>{statistics.totalBookings}</strong>
            <small>All recorded booking requests</small>
          </div>
        </article>

        <article className="reports-stat-card">
          <div className="reports-stat-icon"><FaClock /></div>
          <div>
            <span>Pending Requests</span>
            <strong>{statistics.pendingBookings}</strong>
            <small>Awaiting administrator review</small>
          </div>
        </article>

        <article className="reports-stat-card">
          <div className="reports-stat-icon">
            <FaClock />
          </div>
          <div>
            <span>Unattended Bookings</span>
            <strong>{statistics.unattendedBookings}</strong>
            <small>Expired without administrator action</small>
          </div>
        </article>

        <article className="reports-stat-card">
          <div className="reports-stat-icon"><FaClipboardCheck /></div>
          <div>
            <span>Inspections</span>
            <strong>{statistics.totalInspections}</strong>
            <small>{statistics.damageReports} damage reports recorded</small>
          </div>
        </article>
      </section>

      <section className="reports-section">
        <div className="reports-section-heading">
          <div>
            <h2>Booking & Facility Insights</h2>
            <p>A visual breakdown of municipal facility activity.</p>
          </div>
        </div>

        <div className="reports-chart-grid">
          <article className="reports-chart-card">
            <div className="reports-chart-heading">
              <div className="reports-chart-icon"><FaChartPie /></div>
              <div>
                <h3>Facility Booking Distribution</h3>
                <p>Bookings distributed across individual facilities</p>
              </div>
            </div>

            {facilityBookingDistributionData.length === 0 ? (
              <div className="reports-chart-empty">
                No facility bookings available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={290}>
                <PieChart>
                  <Pie
                    data={facilityBookingDistributionData}
                    cx="50%"
                    cy="48%"
                    outerRadius={95}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {facilityBookingDistributionData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </article>

          <article className="reports-chart-card">
            <div className="reports-chart-heading">
              <div className="reports-chart-icon"><FaChartBar /></div>
              <div>
                <h3>Booking Status Overview</h3>
                <p>Requests by current status</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={bookingStatusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Bookings"
                  fill="#2589d8"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </article>
        </div>
      </section>

      <section className="reports-section">
        <div className="reports-section-heading">
          <div>
            <h2>Facility Performance & Trends</h2>
            <p>Identify popular facilities and track booking activity.</p>
          </div>
        </div>

        <div className="reports-chart-grid">
          <article className="reports-chart-card">
            <div className="reports-chart-heading">
              <div className="reports-chart-icon"><FaBuilding /></div>
              <div>
                <h3>Most Popular Facilities</h3>
                <p>Top five facilities by booking count</p>
              </div>
            </div>

            {facilityBookingData.length === 0 ? (
              <div className="reports-chart-empty">No facility data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={facilityBookingData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={115}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="bookings"
                    name="Total Bookings"
                    fill="#16845b"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </article>

          <article className="reports-chart-card">
            <div className="reports-chart-heading">
              <div className="reports-chart-icon"><FaChartLine /></div>
              <div>
                <h3>Booking Trends</h3>
                <p>Monthly booking activity over the last six months</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={290}>
              <LineChart data={monthlyBookingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  name="Monthly Bookings"
                  stroke="#2589d8"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </article>
        </div>
      </section>

      <section className="reports-recent-section">
        <div className="reports-section-heading">
          <div>
            <h2>Recent Bookings</h2>
            <p>The latest 10 booking records, ordered by booking date.</p>
          </div>
          <span className="reports-record-count">
            {recentBookings.length} Records
          </span>
        </div>

        {recentBookings.length === 0 ? (
          <div className="reports-table-empty">
            <FaCalendarCheck />
            <h3>No booking records available</h3>
            <p>New booking requests will appear here.</p>
          </div>
        ) : (
          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Requester</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Attendees</th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking.id}>
                    <td className="reports-facility-cell">
                      {booking.facility?.name || 'N/A'}
                    </td>
                    <td>{booking.requesterName || 'Not specified'}</td>
                    <td>{formatDate(booking.bookingDate)}</td>
                    <td>
                      <span className={`reports-status ${getStatusClass(booking.status)}`}>
                        {booking.status || 'Unknown'}
                      </span>
                    </td>
                    <td>{booking.expectedAttendees ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="reports-summary-note">
        <strong>Reporting note:</strong> These figures are calculated from the
        facilities, bookings and inspections currently returned by the system.
      </div>
    </div>
  );
}

export default Reports;
