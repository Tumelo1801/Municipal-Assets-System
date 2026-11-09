
import React, { useState, useEffect } from 'react';
import './App.css';

import AdminDashboard from './components/AdminDashboard.jsx';
import PublicBooking from './components/PublicBooking.jsx';
import InspectionForm from './components/InspectionForm.jsx';
import Reports from './components/Reports.jsx';
import Login from './components/Login.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';

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

    // Open the appropriate password recovery screen from the email link.
    const path = window.location.pathname;

    if (path === '/forgot-password') {
      setCurrentPage('forgot-password');
    } else if (path === '/reset-password') {
      setCurrentPage('reset-password');
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
    window.history.pushState({}, '', '/');
  };

  // Password recovery pages are public.
  if (currentPage === 'forgot-password') {
      return (
          <ForgotPassword
              onBackToLogin={() => setCurrentPage('admin')}
          />
      );
  }

  // ResetPassword will be added in the next step.
 if (currentPage === 'reset-password') {
      return (
          <ResetPassword
              onBackToLogin={() => setCurrentPage('admin')}
          />
      );
  }

  if (
    ['admin', 'inspection', 'reports'].includes(currentPage) &&
    !isAuthenticated
  ) {
    return (
      <Login
        onLogin={handleLogin}
        onForgotPassword={() => setCurrentPage('forgot-password')}
      />
    );
  }

  const navigationItems = [
    { id: 'public', label: 'Public Booking', icon: FaBuilding },
    { id: 'admin', label: 'Dashboard', icon: FaUserShield },
    { id: 'inspection', label: 'Inspections', icon: FaClipboardCheck },
    { id: 'reports', label: 'Reports', icon: FaChartBar }
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => {
              setCurrentPage('public');
              window.history.pushState({}, '', '/');
            }}
            aria-label="Go to public booking"
          >
            <span className="brand-icon">
              <FaBuilding />
            </span>

            <span className="brand-text">
              <strong>Municipal Assets</strong>
              <small>Management System</small>
            </span>
          </button>

          <nav className="main-navigation" aria-label="Main navigation">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-link ${currentPage === id ? 'active' : ''}`}
                onClick={() => setCurrentPage(id)}
                aria-current={currentPage === id ? 'page' : undefined}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {isAuthenticated && (
            <div className="header-account">
              <div className="account-details">
                <span className="account-avatar">
                  <FaUser />
                </span>

                <span className="account-name">
                  {adminData?.fullName || 'Administrator'}
                </span>
              </div>

              <button className="logout-button" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'public' && <PublicBooking />}

        {currentPage === 'admin' && isAuthenticated && (
          <AdminDashboard adminData={adminData} />
        )}

        {currentPage === 'inspection' && isAuthenticated && (
          <InspectionForm adminData={adminData} />
        )}

        {currentPage === 'reports' && isAuthenticated && (
          <Reports adminData={adminData} />
        )}
      </main>

      <footer className="app-footer">
        <p>Municipal Assets Management System</p>
        <span>Facility management made simpler.</span>
      </footer>
    </div>
  );
}

export default App;
