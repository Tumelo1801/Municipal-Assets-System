
import React, { useState } from 'react';
import api from '../services/api';
import './ResetPassword.css';

function ResetPassword({ onBackToLogin }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const token = new URLSearchParams(window.location.search).get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage('');
        setError('');

        if (!token) {
            setError('This password reset link is invalid or missing its token.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Your passwords do not match.');
            return;
        }

        if (
            password.length < 12 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9]/.test(password)
        ) {
            setError(
                'Password must contain at least 12 characters, including uppercase, lowercase, a number and a special character.'
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/reset-password', {
                token,
                newPassword: password
            });

            setMessage(response.data.message);
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to reset your password. The link may have expired.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page">
            <div className="reset-password-card">

                <h1>Municipal Assets System</h1>
                <h2>Reset Your Password</h2>

                <p className="reset-description">
                    Create a new password for your administrator account.
                </p>

                {message && (
                    <div className="reset-success">
                        {message}
                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="reset-login-link"
                        >
                            Return to Login
                        </button>
                    </div>
                )}

                {error && (
                    <div className="reset-error">
                        {error}
                    </div>
                )}

                {!message && (
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="new-password">
                            New Password
                        </label>

                        <input
                            id="new-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your new password"
                            autoComplete="new-password"
                            required
                        />

                        <label htmlFor="confirm-password">
                            Confirm New Password
                        </label>

                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            autoComplete="new-password"
                            required
                        />

                        <div className="password-requirements">
                            <p>Your password must contain:</p>
                            <ul>
                                <li>At least 12 characters</li>
                                <li>One uppercase letter</li>
                                <li>One lowercase letter</li>
                                <li>One number</li>
                                <li>One special character</li>
                            </ul>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {!message && (
                    <button
                        type="button"
                        className="reset-back-link"
                        onClick={onBackToLogin}
                    >
                        Back to Login
                    </button>
                )}

            </div>
        </div>
    );
}

export default ResetPassword;
