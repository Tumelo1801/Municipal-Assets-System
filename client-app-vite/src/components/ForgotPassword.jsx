
import { useState } from 'react';
import api from '../services/api';
import './ForgotPassword.css';

function ForgotPassword({ onBackToLogin }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', {
                email: email.trim()
            });

            setMessage(response.data.message);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to process your request. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-card">

                <h1>Municipal Assets System</h1>
                <h2>Forgot Password?</h2>

                <p className="forgot-description">
                    Forgot your password? Enter the email address
                    associated with your administrator account.
                    If an account exists, we'll send you a password
                    reset link.
                </p>

                {message && (
                    <div className="forgot-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="forgot-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="forgot-email">
                        Email Address
                    </label>

                    <input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <button
                    type="button"
                    className="forgot-back-link"
                    onClick={onBackToLogin}
                >
                    Back to Login
                </button>

            </div>
        </div>
    );
}

export default ForgotPassword;
