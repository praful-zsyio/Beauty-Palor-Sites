import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import { GiFlowerTwirl } from 'react-icons/gi';
import './Auth.css';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(form);
        if (result.success) { toast.success('Welcome back! 🌸'); navigate('/dashboard'); }
        else toast.error(result.error || 'Login failed');
    };

    return (
        <div className="auth-page">
            <Helmet>
                <title>Sign In | Kiran Beauty Salon</title>
            </Helmet>
            <div className="auth-bg">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
            </div>
            <motion.div className="auth-card" initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}>
                <div className="auth-header">
                    <GiFlowerTwirl className="auth-logo-icon" />
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your Kiran Beauty account</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-wrap">
                            <FiMail className="input-icon" />
                            <input
                                type="email" className="form-control input-padded" placeholder="your@email.com"
                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrap">
                            <FiLock className="input-icon" />
                            <input
                                type={showPass ? 'text' : 'password'} className="form-control input-padded"
                                placeholder="Your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                            />
                            <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={isLoading}>
                        {isLoading ? '⏳ Signing in...' : 'Sign In →'}
                    </button>
                </form>
                <div className="divider"><span>New to Kiran Beauty?</span></div>
                <Link to="/register" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    Create an Account
                </Link>
            </motion.div>
        </div>
    );
}
