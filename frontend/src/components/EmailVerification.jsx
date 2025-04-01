import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EmailVerification() {
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (token) {
            verifyEmailLink();
        }
    }, [token]);

    const verifyEmailLink = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/auth/verify/${token}`);
            if (response.data.status === 200) {
                setMessage('Email verified successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Verification link is invalid or has expired');
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setMessage('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/auth/verify-otp', {
                email,
                otp
            });
            
            if (response.data.status === 200) {
                setMessage('Email verified successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            setMessage('Email address not found. Please try registering again.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/auth/resend-verification', { email });
            setMessage('New verification email has been sent. Please check your inbox.');
        } catch (error) {
            setMessage('Failed to resend verification email. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Email Verification
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {token ? 'Verifying your email...' : 'Enter the OTP sent to your email'}
                    </p>
                </div>

                {!token && (
                    <form className="mt-8 space-y-6" onSubmit={handleOTPSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="otp" className="sr-only">OTP</label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </form>
                )}

                {message && (
                    <div className={`mt-4 text-center text-sm ${
                        message.includes('success') ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {message}
                    </div>
                )}

                {!token && (
                    <div className="text-center mt-4">
                        <button
                            onClick={handleResendVerification}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Resend verification email
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmailVerification;