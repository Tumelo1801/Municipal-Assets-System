import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5242/api';

function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, loginData);
      if (response.data.success) {
        localStorage.setItem('admin', JSON.stringify(response.data));
        onLogin(response.data);
        alert(`Welcome back, ${response.data.fullName}!`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid username or password');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/auth/register`, registerData);
      alert('Admin registered successfully! You can now login.');
      setIsRegistering(false);
      setRegisterData({ username: '', password: '', fullName: '', email: '' });
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data || 'Error registering admin');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '10px', fontSize: '28px' }}>
            ??? Municipal Assets System
          </h1>
          <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
            {isRegistering ? 'Create Admin Account' : 'Admin Login'}
          </p>
        </div>

        {!isRegistering ? (
          // Login Form
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Username
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                placeholder="Enter username"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid #ecf0f1',
                  fontSize: '16px',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3498db'}
                onBlur={(e) => e.target.style.borderColor = '#ecf0f1'}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid #ecf0f1',
                  fontSize: '16px',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3498db'}
                onBlur={(e) => e.target.style.borderColor = '#ecf0f1'}
              />
            </div>

            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
            >
              Login
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setIsRegistering(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#3498db',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                Need to register? Create admin account
              </button>
            </div>
          </div>
        ) : (
          // Register Form
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Full Name
              </label>
              <input
                type="text"
                value={registerData.fullName}
                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                placeholder="Your full name"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid #ecf0f1',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Email
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="admin@example.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid #ecf0f1',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Username
              </label>
              <input
                type="text"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                placeholder="Choose a username"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid #ecf0f1',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                Password
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                placeholder="Choose a password"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid #ecf0f1',
                  fontSize: '16px'
                }}
              />
            </div>

            <button
              onClick={handleRegister}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              Register Admin
            </button>

            <button
              onClick={() => setIsRegistering(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#7f8c8d',
                border: '2px solid #ecf0f1',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;