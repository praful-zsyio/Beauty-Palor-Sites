import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiEdit, FiLogOut, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuthStore, useAppointmentStore } from '../store';
import './Dashboard.css';

const STATUS_COLORS = {
    pending: { bg: '#fef9c3', text: '#a16207' },
    confirmed: { bg: '#dcfce7', text: '#166534' },
    'in-progress': { bg: '#dbeafe', text: '#1d4ed8' },
    completed: { bg: '#f0fdf4', text: '#15803d' },
    cancelled: { bg: '#fef2f2', text: '#dc2626' },
    'no-show': { bg: '#f5f3ff', text: '#7c3aed' },
};

export default function Dashboard() {
    const { user, updateProfile, logout } = useAuthStore();
    const { appointments, fetchMyAppointments, cancelAppointment, isLoading } = useAppointmentStore();
    const [activeTab, setActiveTab] = useState('appointments');
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' });

    useEffect(() => { fetchMyAppointments(); }, []);

    const handleProfileSave = async () => {
        const result = await updateProfile(profileForm);
        if (result.success) { toast.success('Profile updated!'); setEditMode(false); }
        else toast.error(result.error || 'Update failed');
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        const result = await cancelAppointment(id, 'Cancelled by customer');
        if (result.success) toast.success('Appointment cancelled');
        else toast.error(result.error || 'Failed to cancel');
    };

    const upcoming = appointments.filter((a) => ['pending', 'confirmed'].includes(a.status));
    const past = appointments.filter((a) => ['completed', 'cancelled'].includes(a.status));

    return (
        <div className="dashboard-page">
            <Helmet>
                <title>My Dashboard | Kiran Beauty Salon</title>
            </Helmet>

            <section className="page-hero" style={{ paddingBottom: '3rem' }}>
                <div className="page-hero-bg" />
                <div className="container">
                    <motion.div className="dashboard-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="dashboard-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                        <div>
                            <h1 className="dashboard-hero-name">Welcome, {user?.name?.split(' ')[0]}!</h1>
                            <p style={{ color: 'rgba(255,255,255,0.6)' }}>{user?.email}</p>
                        </div>
                        <div className="dashboard-loyalty">
                            <span>⭐ {user?.loyaltyPoints || 0}</span>
                            <span>Loyalty Points</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="container dash-container">
                {/* Stats */}
                <div className="dash-stats">
                    {[
                        { label: 'Total Bookings', value: appointments.length, icon: '📅' },
                        { label: 'Upcoming', value: upcoming.length, icon: '⏰' },
                        { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, icon: '✅' },
                        { label: 'Loyalty Points', value: user?.loyaltyPoints || 0, icon: '⭐' },
                    ].map((s, i) => (
                        <motion.div key={s.label} className="dash-stat-card"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <div className="dash-stat-icon">{s.icon}</div>
                            <div className="dash-stat-num">{s.value}</div>
                            <div className="dash-stat-label">{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="dash-tabs">
                    {[
                        { id: 'appointments', label: 'My Appointments', icon: FiCalendar },
                        { id: 'profile', label: 'Profile', icon: FiUser },
                    ].map(({ id, label, icon: Icon }) => (
                        <button key={id} className={`dash-tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
                            <Icon size={16} /> {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {activeTab === 'appointments' && (
                        <div className="appointments-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 className="dash-section-title">My Appointments</h2>
                                <Link to="/book" className="btn btn-primary btn-sm"><FiCalendar /> Book New</Link>
                            </div>

                            {isLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: '1rem' }} />)}
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🗓️</div>
                                    <h3>No appointments yet</h3>
                                    <p>Book your first beauty session today!</p>
                                    <Link to="/book" className="btn btn-primary" style={{ marginTop: '1rem' }}>Book Now</Link>
                                </div>
                            ) : (
                                <div className="appointments-list">
                                    {appointments.map((apt) => {
                                        const statusColor = STATUS_COLORS[apt.status] || STATUS_COLORS.pending;
                                        return (
                                            <motion.div key={apt._id} className="apt-card"
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ y: -3 }}>
                                                <div className="apt-service-icon">🌸</div>
                                                <div className="apt-info">
                                                    <h4 className="apt-service-name">{apt.service?.name || 'Service'}</h4>
                                                    <div className="apt-meta">
                                                        <span><FiCalendar size={13} /> {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        <span><FiClock size={13} /> {apt.timeSlot}</span>
                                                    </div>
                                                    <p className="apt-id">ID: {apt.appointmentId}</p>
                                                </div>
                                                <div className="apt-right">
                                                    <span className="apt-status" style={{ background: statusColor.bg, color: statusColor.text }}>
                                                        {apt.status}
                                                    </span>
                                                    <p className="apt-price">₹{apt.payment?.totalAmount?.toLocaleString()}</p>
                                                    {['pending', 'confirmed'].includes(apt.status) && (
                                                        <button className="btn-cancel" onClick={() => handleCancel(apt._id)}>
                                                            <FiX size={14} /> Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="profile-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 className="dash-section-title">Profile Information</h2>
                                <button className="btn btn-outline btn-sm" onClick={() => setEditMode(!editMode)}>
                                    <FiEdit size={14} /> {editMode ? 'Cancel' : 'Edit'}
                                </button>
                            </div>
                            <div className="profile-form">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-control" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} disabled={!editMode} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input className="form-control" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} disabled={!editMode} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input className="form-control" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} disabled={!editMode} />
                                </div>
                                {editMode && (
                                    <button className="btn btn-primary" onClick={handleProfileSave}><FiCheck /> Save Changes</button>
                                )}
                            </div>
                            <div className="profile-actions">
                                <button className="btn btn-outline" onClick={logout} style={{ color: '#dc2626', borderColor: '#dc2626' }}>
                                    <FiLogOut /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
