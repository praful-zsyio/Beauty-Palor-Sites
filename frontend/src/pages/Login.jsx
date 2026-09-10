import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import { GiFlowerTwirl } from 'react-icons/gi';
import {
    firebaseLoginUser,
    firebaseLoginWithGoogle
} from '../firebase';
import './Auth.css';

export default function Login() {
    const [loginRole, setLoginRole] = useState('customer'); // 'customer' or 'admin'
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const { login, firebaseAuthSync, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // If redirected from admin route or query param ?role=admin
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('role') === 'admin') {
            setLoginRole('admin');
        }
    }, [location]);

    const handleSuccessRedirect = (userRole) => {
        if (userRole === 'admin' || loginRole === 'admin') {
            toast.success('Welcome back, Admin! 👑');
            navigate('/admin');
        } else {
            toast.success('Welcome back to Shivani Beauty Palor! 🌸');
            navigate('/dashboard');
        }
    };

    // 1. Google 1-Click Authentication (Primary)
    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            const fbRes = await firebaseLoginWithGoogle();
            const { user, token } = fbRes;

            const userEmail = user.email || user.providerData?.[0]?.email || `google_${user.uid.slice(0, 12)}@shivanibeauty.com`;
            const userName = user.displayName || user.providerData?.[0]?.displayName || 'Google User';
            const userPhone = user.phoneNumber || user.providerData?.[0]?.phoneNumber || '';

            const syncRes = await firebaseAuthSync({
                email: userEmail,
                name: userName,
                phone: userPhone,
                firebaseUid: user.uid,
                role: loginRole,
                isAdminRequest: loginRole === 'admin',
                token
            });

            if (syncRes.success) {
                handleSuccessRedirect(syncRes.user?.role || loginRole);
            } else {
                toast.error(syncRes.error || 'Google authentication sync failed');
            }
        } catch (err) {
            console.error('Google Sign-In Error:', err);
            if (err.code !== 'auth/popup-closed-by-user') {
                toast.error(err.message || 'Google sign-in failed. Please try again.');
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // 2. Email & Password Login
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        try {
            // First attempt Firebase login
            let firebaseUid = null;
            let emailToken = null;
            try {
                const fbRes = await firebaseLoginUser(form.email, form.password);
                firebaseUid = fbRes.user.uid;
                emailToken = fbRes.token;
            } catch (fbErr) {
                console.warn('Firebase email login note:', fbErr.message);
            }

            // Sync with backend / authenticate
            let result;
            if (firebaseUid) {
                result = await firebaseAuthSync({
                    email: form.email,
                    firebaseUid,
                    role: loginRole,
                    isAdminRequest: loginRole === 'admin',
                    token: emailToken
                });
            } else {
                // Direct backend login fallback
                result = await login(form);
            }

            if (result.success) {
                handleSuccessRedirect(result.user?.role || loginRole);
            } else {
                toast.error(result.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            toast.error(err.message || 'Login error');
        }
    };

    return (
        <div className="auth-page">
            <Helmet>
                <title>{loginRole === 'admin' ? 'Admin Portal' : 'Sign In'} | Shivani Beauty Palor & Academy</title>
                <meta name="description" content="Sign in to Shivani Beauty Palor & Academy using Google Authentication or Email." />
            </Helmet>

            <div className="auth-bg">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
            </div>

            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-header">
                    <GiFlowerTwirl className="auth-logo-icon" />
                    <h1 className="auth-title">
                        {loginRole === 'admin' ? '👑 Admin Portal' : 'Welcome Back'}
                    </h1>
                    <p className="auth-subtitle">
                        {loginRole === 'admin' ? 'Manage salon appointments, clients & services' : 'Sign in to your Shivani Beauty Palor account'}
                    </p>
                </div>

                {/* Role Switcher Tabs */}
                <div className="auth-tabs">
                    <button
                        type="button"
                        className={`auth-tab ${loginRole === 'customer' ? 'active' : ''}`}
                        onClick={() => setLoginRole('customer')}
                    >
                        <FiUser /> Client Site
                    </button>
                    <button
                        type="button"
                        className={`auth-tab ${loginRole === 'admin' ? 'active' : ''}`}
                        onClick={() => setLoginRole('admin')}
                    >
                        <FiShield /> Admin Portal
                    </button>
                </div>

                {/* Prominent Google Sign-In Button */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <button
                        type="button"
                        className="auth-google-btn"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || isGoogleLoading}
                        style={{
                            padding: '0.9rem 1.25rem',
                            fontSize: '0.98rem',
                            borderWidth: '2px',
                            boxShadow: '0 4px 16px rgba(255, 59, 78, 0.12)'
                        }}
                    >
                        <FcGoogle size={22} />
                        <span>{isGoogleLoading ? 'Connecting to Google...' : `Continue with Google (${loginRole === 'admin' ? 'Admin' : 'Client'})`}</span>
                    </button>
                </div>

                <div className="divider"><span>Or sign in with Email</span></div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-wrap">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                className="form-control input-padded"
                                placeholder={loginRole === 'admin' ? 'admin@shivanibeauty.com' : 'your@email.com'}
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrap">
                            <FiLock className="input-icon" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                className="form-control input-padded"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={isLoading || isGoogleLoading}>
                        {isLoading ? '⏳ Signing in...' : loginRole === 'admin' ? 'Sign In as Admin →' : 'Sign In →'}
                    </button>
                </form>

                {/* Registration Link */}
                <div className="divider"><span>New to Shivani Beauty Palor?</span></div>
                <Link
                    to={`/register?role=${loginRole}`}
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {loginRole === 'admin' ? 'Register New Admin Account' : 'Create an Account'}
                </Link>
            </motion.div>
        </div>
    );
}
