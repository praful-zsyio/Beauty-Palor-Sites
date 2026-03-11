import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import { GiFlowerTwirl } from 'react-icons/gi';
import './Auth.css';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [showPass, setShowPass] = useState(false);
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        const result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
        if (result.success) { toast.success('Account created! 🎉'); navigate('/dashboard'); }
        else toast.error(result.error || 'Registration failed');
    };

    return (
        <div className="auth-page">
            <Helmet>
                <title>Create Account | Kiran Beauty Salon</title>
            </Helmet>
            <div className="auth-bg">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
            </div>
            <motion.div className="auth-card auth-card-wide" initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}>
                <div className="auth-header">
                    <GiFlowerTwirl className="auth-logo-icon" />
                    <h1 className="auth-title">Join Kiran Beauty</h1>
                    <p className="auth-subtitle">Create your account to book appointments and more</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-wrap">
                                <FiUser className="input-icon" />
                                <input type="text" className="form-control input-padded" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <div className="input-wrap">
                                <FiPhone className="input-icon" />
                                <input type="tel" className="form-control input-padded" placeholder="10-digit number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-wrap">
                            <FiMail className="input-icon" />
                            <input type="email" className="form-control input-padded" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-wrap">
                                <FiLock className="input-icon" />
                                <input type={showPass ? 'text' : 'password'} className="form-control input-padded" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                                <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div className="input-wrap">
                                <FiLock className="input-icon" />
                                <input type="password" className="form-control input-padded" placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={isLoading}>
                        {isLoading ? '⏳ Creating Account...' : 'Create Account →'}
                    </button>
                </form>
                <div className="divider"><span>Already have an account?</span></div>
                <Link to="/login" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Sign In</Link>
            </motion.div>
        </div>
    );
}
