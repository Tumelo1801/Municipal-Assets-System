import React, { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import PublicBooking from './components/PublicBooking';
import InspectionForm from './components/InspectionForm';
import './App.css';

function App() {
    const [currentPage, setCurrentPage] = useState('public');

    return (
        <div className="App">
            {/* Navigation Bar */}
            <nav style={{
                backgroundColor: '#2c3e50',
                padding: '15px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ color: 'white', margin: 0 }}>Municipal Assets System</h2>
                <div>
                    <button
                        onClick={() => setCurrentPage('public')}
                        style={{
                            padding: '10px 20px',
                            marginRight: '10px',
                            backgroundColor: currentPage === 'public' ? '#3498db' : 'transparent',
                            color: 'white',
                            border: currentPage === 'public' ? 'none' : '2px solid white',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Public Booking
                    </button>
                    <button
                        onClick={() => setCurrentPage('admin')}
                        style={{
                            padding: '10px 20px',
                            marginRight: '10px',
                            backgroundColor: currentPage === 'admin' ? '#3498db' : 'transparent',
                            color: 'white',
                            border: currentPage === 'admin' ? 'none' : '2px solid white',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Admin Dashboard
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
                            fontSize: '16px'
                        }}
                    >
                        Inspections
                    </button>
                </div>
            </nav>

            {/* Page Content */}
            <div>
                {currentPage === 'public' && <PublicBooking />}
                {currentPage === 'admin' && <AdminDashboard />}
                {currentPage === 'inspection' && <InspectionForm />}
            </div>
        </div>
    );
}

export default App;
