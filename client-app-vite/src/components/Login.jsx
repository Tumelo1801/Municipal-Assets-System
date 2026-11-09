
import React, { useState } from 'react';
import api from '../services/api';
import './Login.css';

function Login({ onLogin, onForgotPassword }) {
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', loginData);

      if (response.data.success && response.data.token) {
        localStorage.setItem('admin', JSON.stringify(response.data));
        onLogin(response.data);
      } else {
        setError('Unable to sign in. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-heading">
          <h1>Municipal Assets System</h1>
          <p>Administrator Login</p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="login-form-group">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  username: e.target.value
                })
              }
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password: e.target.value
                })
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="forgot-password-container">
            <button
              type="button"
              className="forgot-password-link"
              onClick={onForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <span>Municipal Assets Management System</span>
        </div>

      </div>
    </div>
  );
}

export default Login;
