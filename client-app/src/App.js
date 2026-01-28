import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import PublicBooking from './components/PublicBooking';
import InspectionForm from './components/InspectionForm';
import Reports from './components/Reports';
import Login from './components/Login';
import { FaBuilding, FaUserShield, FaClipboardCheck, FaChartBar, FaSignOutAlt, FaUser } from 'react-icons/fa';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('public');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      const admin = JSON.parse(storedAdmin);
      setAdminData(admin);
      setIsAuthenticated(true);
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

  if ((currentPage === 'admin' || currentPage === 'inspection' || currentPage === 'reports') && !isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <nav style={{
        backgroundColor: '#2c3e50',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaBuilding /> Municipal Assets System
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setCurrentPage('public')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentPage === 'public' ? '#3498db' : 'transparent',
              color: 'white',
              border: currentPage === 'public' ? 'none' : '2px solid white',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaBuilding /> Public Booking
          </button>
          <button
            onClick={() => setCurrentPage('admin')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentPage === 'admin' ? '#3498db' : 'transparent',
              color: 'white',
              border: currentPage === 'admin' ? 'none' : '2px solid white',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaUserShield /> Admin Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('inspection')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentPage === 'inspection' ? '#3498db' : 'transparent',
              color: 'white',
              border: currentPage === 'inspection' ? 'none' : '2px solid white',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaClipboardCheck /> Inspections
          </button>
          <button
            onClick={() => setCurrentPage('reports')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentPage === 'reports' ? '#3498db' : 'transparent',
              color: 'white',
              border: currentPage === 'reports' ? 'none' : '2px solid white',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
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

      <div>
        {currentPage === 'public' && <PublicBooking />}
        {currentPage === 'admin' && isAuthenticated && <AdminDashboard adminData={adminData} />}
        {currentPage === 'inspection' && isAuthenticated && <InspectionForm adminData={adminData} />}
        {currentPage === 'reports' && isAuthenticated && <Reports adminData={adminData} />}
      </div>
    </div>
  );
}

export default App;
