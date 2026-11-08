
import React, { useState, useEffect } from 'react';

import AdminDashboard from './components/AdminDashboard.jsx';
import PublicBooking from './components/PublicBooking.jsx';
import InspectionForm from './components/InspectionForm.jsx';
import Reports from './components/Reports.jsx';
import Login from './components/Login.jsx';

import {
  FaBuilding,
  FaUserShield,
  FaClipboardCheck,
  FaChartBar,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';

function App() {
  const [currentPage, setCurrentPage] = useState('public');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');

    if (storedAdmin) {
      try {
        const admin = JSON.parse(storedAdmin);
        setAdminData(admin);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error restoring admin session:', error);
        localStorage.removeItem('admin');
      }
    }
  }, []);

  const handleLogin = (admin) => {
    setAdminData(admin);
    setIsAuthenticated(true);
    setCurrentPage('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    setAdminData(null);
    setIsAuthenticated(false);
    setCurrentPage('public');
  };

  if (
    (currentPage === 'admin' ||
      currentPage === 'inspection' ||
      currentPage === 'reports') &&
    !isAuthenticated
  ) {
    return <Login onLogin={handleLogin} />;
  }

  const navButtonStyle = (page) => ({
    padding: '10px 20px',
    backgroundColor: currentPage === page ? '#3498db' : 'transparent',
    color: 'white',
    border: currentPage === page ? 'none' : '2px solid white',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  return (
    <div className="App">
      <nav
        style={{
          backgroundColor: '#2c3e50',
          padding: '15px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          flexWrap: 'wrap',
          gap: '15px'
        }}
      >
        <h2
          style={{
            color: 'white',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <FaBuilding /> Municipal Assets System
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <button onClick={() => setCurrentPage('public')} style={navButtonStyle('public')}>
            <FaBuilding /> Public Booking
          </button>

          <button onClick={() => setCurrentPage('admin')} style={navButtonStyle('admin')}>
            <FaUserShield /> Admin Dashboard
          </button>

          <button onClick={() => setCurrentPage('inspection')} style={navButtonStyle('inspection')}>
            <FaClipboardCheck /> Inspections
          </button>

          <button onClick={() => setCurrentPage('reports')} style={navButtonStyle('reports')}>
            <FaChartBar /> Reports
          </button>

          {isAuthenticated && (
            <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaUser /> {adminData?.fullName}
              </span>

              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main>
        {currentPage === 'public' && <PublicBooking />}
        {currentPage === 'admin' && isAuthenticated && <AdminDashboard adminData={adminData} />}
        {currentPage === 'inspection' && isAuthenticated && <InspectionForm adminData={adminData} />}
        {currentPage === 'reports' && isAuthenticated && <Reports adminData={adminData} />}
      </main>
    </div>
  );
}

export default App;
