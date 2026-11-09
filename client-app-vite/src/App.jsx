
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import AdminDashboard from './components/AdminDashboard.jsx';
import PublicBooking from './components/PublicBooking.jsx';
import InspectionForm from './components/InspectionForm.jsx';
import Reports from './components/Reports.jsx';
import Login from './components/Login.jsx';
import SystemSettings from './components/SystemSettings.jsx';

import {
  FaBuilding,
  FaUserShield,
  FaClipboardCheck,
  FaChartBar,
  FaSignOutAlt,
  FaUser,
  FaCog,
  FaChevronDown
} from 'react-icons/fa';

function App() {
  const [currentPage, setCurrentPage] = useState('public');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const accountMenuRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setShowAccountMenu(false);
  };

  const handleLogin = (admin) => {
    setAdminData(admin);
    setIsAuthenticated(true);
    setCurrentPage('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    setAdminData(null);
    setIsAuthenticated(false);
    setShowAccountMenu(false);
    setCurrentPage('public');
    window.history.pushState({}, '', '/');
  };

  if (
    ['admin', 'inspection', 'reports', 'settings'].includes(currentPage) &&
    !isAuthenticated
  ) {
    return <Login onLogin={handleLogin} />;
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
              navigateTo('public');
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
                onClick={() => navigateTo(id)}
                aria-current={currentPage === id ? 'page' : undefined}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {isAuthenticated && (
            <div className="header-account" ref={accountMenuRef}>
              <button
                type="button"
                className="account-details"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                aria-expanded={showAccountMenu}
                aria-haspopup="true"
              >
                <span className="account-avatar">
                  <FaUser />
                </span>

                <span className="account-name">
                  {adminData?.fullName || 'Administrator'}
                </span>

                <FaChevronDown className="account-chevron" />
              </button>

              {showAccountMenu && (
                <div className="account-dropdown">
                  <div className="account-dropdown-header">
                    <strong>
                      {adminData?.fullName || 'Administrator'}
                    </strong>
                    <small>Administrator account</small>
                  </div>

                  <button
                    type="button"
                    className="account-dropdown-item"
                    onClick={() => navigateTo('settings')}
                  >
                    <FaCog />
                    <span>System Settings</span>
                  </button>

                  <button
                    type="button"
                    className="account-dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
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

        {currentPage === 'settings' && isAuthenticated && (
          <SystemSettings adminData={adminData} />
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
