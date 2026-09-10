import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import { GiFlowerTwirl } from 'react-icons/gi';
import {
    firebaseRegisterUser,
    firebaseLoginWithGoogle
} from '../firebase';
import './Auth.css';

export default function Register() {
    const location = useLocation();
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer'
    });
    const [showPass, setShowPass] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const { register, firebaseAuthSync, isLoading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const requestedRole = params.get('role');
        if (requestedRole === 'admin' || requestedRole === 'customer') {
            setForm((prev) => ({ ...prev, role: requestedRole }));
        }
    }, [location]);

    const handleSuccessRedirect = (assignedRole) => {
        if (assignedRole === 'admin' || form.role === 'admin') {
            toast.success('Admin account created successfully! 👑');
            navigate('/admin');
        } else {
            toast.success('Welcome to Shivani Beauty Palor! 🌸');
            navigate('/dashboard');
        }
    };

    // 1. Google 1-Click Registration (Primary)
    const handleGoogleSignUp = async () => {
        setIsGoogleLoading(true);
        try {
            const fbRes = await firebaseLoginWithGoogle();
            const { user, token } = fbRes;

            const userEmail = user.email || user.providerData?.[0]?.email || `google_${user.uid.slice(0, 12)}@shivanibeauty.com`;
            const userName = user.displayName || user.providerData?.[0]?.displayName || form.name || 'Google User';
            const userPhone = user.phoneNumber || user.providerData?.[0]?.phoneNumber || form.phone || '';

            const syncRes = await firebaseAuthSync({
                name: userName,
                email: userEmail,
                phone: userPhone,
                role: form.role,
                isAdminRequest: form.role === 'admin',
                firebaseUid: user.uid,
                token
            });

            if (syncRes.success) {
                handleSuccessRedirect(form.role);
            } else {
                toast.error(syncRes.error || 'Google registration sync failed');
            }
        } catch (err) {
            console.error('Google Sign-Up Error:', err);
            if (err.code !== 'auth/popup-closed-by-user') {
                toast.error(err.message || 'Google sign-up failed. Please try again.');
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // 2. Standard Email & Password Registration
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            // Attempt to create user in Firebase Auth
            let firebaseUid = null;
            let fbToken = null;
            try {
                const fbRes = await firebaseRegisterUser(form.email, form.password, form.name);
                firebaseUid = fbRes.user.uid;
                fbToken = fbRes.token;
            } catch (fbErr) {
                console.warn('Firebase registration notice:', fbErr.message);
            }

            // Sync with backend SQLite database
            let result;
            if (firebaseUid) {
                result = await firebaseAuthSync({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    role: form.role,
                    isAdminRequest: form.role === 'admin',
                    firebaseUid,
                    token: fbToken
                });
            } else {
                // Direct backend registration
                result = await register({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,
                    role: form.role
                });
            }

            if (result.success) {
                handleSuccessRedirect(form.role);
            } else {
                toast.error(result.error || 'Registration failed');
            }
        } catch (err) {
            toast.error(err.message || 'Registration error');
        }
    };

    return (
        <div className="auth-page">
            <Helmet>
                <title>{form.role === 'admin' ? 'Register Admin' : 'Create Account'} | Shivani Beauty Palor & Academy</title>
                <meta name="description" content="Join Shivani Beauty Palor & Academy using Google Authentication or Email." />
            </Helmet>

            <div className="auth-bg">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
            </div>

            <motion.div
                className="auth-card auth-card-wide"
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-header">
                    <GiFlowerTwirl className="auth-logo-icon" />
                    <h1 className="auth-title">
                        {form.role === 'admin' ? '👑 Register as Admin' : 'Create Your Account'}
                    </h1>
                    <p className="auth-subtitle">
                        {form.role === 'admin' ? 'Admin portal registration with full salon controls' : 'Join Shivani Beauty Palor & Academy for exclusive luxury bookings & rewards'}
                    </p>
                </div>

                {/* Role Switcher Tabs */}
                <div className="auth-tabs">
                    <button
                        type="button"
                        className={`auth-tab ${form.role === 'customer' ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, role: 'customer' })}
                    >
                        <FiUser /> Client Site
                    </button>
                    <button
                        type="button"
                        className={`auth-tab ${form.role === 'admin' ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, role: 'admin' })}
                    >
                        <FiShield /> Admin Portal
                    </button>
                </div>

                {/* Prominent Google 1-Click Sign-Up */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <button
                        type="button"
                        className="auth-google-btn"
                        onClick={handleGoogleSignUp}
                        disabled={isLoading || isGoogleLoading}
                        style={{
                            padding: '0.9rem 1.25rem',
                            fontSize: '0.98rem',
                            borderWidth: '2px',
                            boxShadow: '0 4px 16px rgba(255, 59, 78, 0.12)'
                        }}
                    >
                        <FcGoogle size={22} />
                        <span>{isGoogleLoading ? 'Connecting to Google...' : `Sign up with Google (${form.role === 'admin' ? 'Admin' : 'Client'})`}</span>
                    </button>
                </div>

                <div className="divider"><span>Or register with Email</span></div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-wrap">
                            <FiUser className="input-icon" />
                            <input
                                type="text"
                                className="form-control input-padded"
                                placeholder="Your full name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1rem', marginBottom: 0 }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="input-wrap">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    className="form-control input-padded"
                                    placeholder={form.role === 'admin' ? 'admin@shivanibeauty.com' : 'your@email.com'}
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contact Phone</label>
                            <div className="input-wrap">
                                <FiPhone className="input-icon" />
                                <input
                                    type="tel"
                                    className="form-control input-padded"
                                    placeholder="10-digit mobile number"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1rem', marginBottom: 0 }}>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-wrap">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="form-control input-padded"
                                    placeholder="Min. 6 characters"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                                <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div className="input-wrap">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="form-control input-padded"
                                    placeholder="Re-enter password"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={isLoading || isGoogleLoading}>
                        {isLoading ? '⏳ Creating Account...' : form.role === 'admin' ? 'Create Admin Account →' : 'Create Account →'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to={`/login?role=${form.role}`} className="auth-link">
                        Sign In here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
