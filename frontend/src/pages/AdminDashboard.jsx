import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiDollarSign, FiPackage, FiActivity, FiArrowRight } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useAdminStore } from '../store';
import './Dashboard.css'; // Reusing some base styles

export default function AdminDashboard() {
    const { stats, recentAppointments, fetchStats, isLoading } = useAdminStore();

    useEffect(() => {
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: '#10b981', bg: '#ecfdf5' },
        { label: 'Total Bookings', value: stats?.totalAppointments || 0, icon: FiCalendar, color: '#6366f1', bg: '#eef2ff' },
        { label: 'Total Customers', value: stats?.totalUsers || 0, icon: FiUsers, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'Total Enquiries', value: stats?.totalEnquiries || 0, icon: FiActivity, color: '#ec4899', bg: '#fdf2f7' },
    ];

    const statusBreakdown = [
        { label: 'Pending', count: stats?.pendingAppointments || 0, color: '#a16207', bg: '#fef9c3' },
        { label: 'Confirmed', count: stats?.confirmedAppointments || 0, color: '#15803d', bg: '#dcfce7' },
        { label: 'In Progress', count: stats?.inProgressAppointments || 0, color: '#1e40af', bg: '#dbeafe' },
        { label: 'Cancelled', count: stats?.cancelledAppointments || 0, color: '#991b1b', bg: '#fee2e2' },
        { label: 'No Show', count: stats?.noShowAppointments || 0, color: '#5b21b6', bg: '#ede9fe' },
    ];

    return (
        <div className="admin-dashboard-page">
            <Helmet>
                <title>Admin Dashboard | Kiran Beauty Salon</title>
            </Helmet>

            <section className="page-hero">
                <div className="page-hero-bg" />
                <div className="container">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="page-hero-title">Business <span className="text-gold">Overview</span></h1>
                        <p className="page-hero-desc">Monitor your salon's performance and manage your business operations.</p>
                    </motion.div>
                </div>
            </section>

            <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10, paddingBottom: '5rem' }}>
                {/* Stats Grid */}
                <div className="grid-4" style={{ marginBottom: '2rem' }}>
                    {statCards.map((card, i) => (
                        <motion.div 
                            key={card.label} 
                            className="dash-stat-card"
                            style={{ background: '#fff' }}
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="dash-stat-icon" style={{ background: card.bg, color: card.color }}>
                                <card.icon size={24} />
                            </div>
                            <div className="dash-stat-num" style={{ fontSize: '2rem', marginTop: '1rem' }}>{card.value}</div>
                            <div className="dash-stat-label" style={{ fontWeight: 600, color: 'var(--slate)' }}>{card.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Status Breakdown Bar */}
                <div className="admin-card" style={{ marginBottom: '3rem', padding: '1.5rem 2rem' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Appointment Breakdown</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {statusBreakdown.map((item) => (
                            <div key={item.label} style={{ background: item.bg, color: item.color, padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{item.label}:</span>
                                <span>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid-2-1">
                    {/* Recent Appointments */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title"><FiActivity /> Recent Appointments</h3>
                            <Link to="/admin/appointments" className="btn btn-outline btn-sm">View All <FiArrowRight /></Link>
                        </div>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Service</th>
                                        <th>Date/Time</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan="5"><div className="skeleton" style={{ height: '40px', margin: '10px 0' }} /></td>
                                            </tr>
                                        ))
                                    ) : (recentAppointments || []).length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No recent appointments</td>
                                        </tr>
                                    ) : (
                                        (recentAppointments || []).map((apt) => (
                                            <tr key={apt.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{apt.customer_name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--slate)' }}>{apt.customer_phone}</div>
                                                </td>
                                                <td>{apt.serviceName}</td>
                                                <td>
                                                    <div>{new Date(apt.date * 1000).toLocaleDateString('en-IN')}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--slate)' }}>{apt.time_slot}</div>
                                                </td>
                                                <td>
                                                    <span className={`status-pill status-${apt.status}`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 700 }}>₹{apt.total_amount}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title">Quick Actions</h3>
                        </div>
                        <div className="admin-actions-list">
                            <button style={{ background: '#f59e0b', color: '#fff' }} className="admin-action-btn">Manage Services</button>
                            <button style={{ background: '#10b981', color: '#fff' }} className="admin-action-btn">Export Bookings (CSV)</button>
                            <button style={{ background: '#6366f1', color: '#fff' }} className="admin-action-btn">Update Gallery</button>
                            <button style={{ background: '#ec4899', color: '#fff' }} className="admin-action-btn">Add Testimonial</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
                @media (max-width: 992px) { .grid-2-1 { grid-template-columns: 1fr; } }
                
                .admin-card { background: #fff; border-radius: 1.5rem; padding: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .admin-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .admin-card-title { display: flex; align-items: center; gap: 0.75rem; margin: 0; font-size: 1.25rem; font-weight: 700; color: #1a1a2e; }
                
                .admin-table-wrapper { overflow-x: auto; }
                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th { text-align: left; padding: 1rem; color: var(--slate); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #eee; }
                .admin-table td { padding: 1.25rem 1rem; border-bottom: 1px solid #f8f9fa; font-size: 0.95rem; }
                
                .status-pill { padding: 0.35rem 0.85rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
                .status-pending { background: #fef9c3; color: #a16207; }
                .status-confirmed { background: #dcfce7; color: #15803d; }
                .status-completed { background: #dcfce7; color: #15803d; }
                .status-cancelled { background: #fee2e2; color: #991b1b; }
                
                .admin-actions-list { display: flex; flexDirection: column; gap: 1rem; }
                .admin-action-btn { width: 100%; padding: 1rem; border: none; border-radius: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
                .admin-action-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
            `}</style>
        </div>
    );
}
