import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiDollarSign, FiActivity, FiArrowRight } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useAdminStore } from '../store';
import './Dashboard.css';

export default function AdminDashboard() {
    const { stats, recentAppointments, fetchStats, isLoading } = useAdminStore();

    useEffect(() => {
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
        { label: 'Total Bookings', value: stats?.totalAppointments || 0, icon: FiCalendar, color: '#ff3b4e', bg: 'rgba(255, 59, 78, 0.15)' },
        { label: 'Total Customers', value: stats?.totalUsers || 0, icon: FiUsers, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
        { label: 'Total Enquiries', value: stats?.totalEnquiries || 0, icon: FiActivity, color: '#ff6b7a', bg: 'rgba(255, 107, 122, 0.15)' },
    ];

    const statusBreakdown = [
        { label: 'Pending', count: stats?.pendingAppointments || 0, color: '#ca8a04', bg: 'rgba(234, 179, 8, 0.18)' },
        { label: 'Confirmed', count: stats?.confirmedAppointments || 0, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.18)' },
        { label: 'In Progress', count: stats?.inProgressAppointments || 0, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.18)' },
        { label: 'Cancelled', count: stats?.cancelledAppointments || 0, color: '#dc2626', bg: 'rgba(220, 38, 38, 0.18)' },
        { label: 'No Show', count: stats?.noShowAppointments || 0, color: '#9333ea', bg: 'rgba(147, 51, 234, 0.18)' },
    ];

    return (
        <div className="admin-dashboard-page">
            <Helmet>
                <title>Admin Dashboard | Business Overview | Shivani Beauty Palor</title>
            </Helmet>

            <section className="page-hero">
                <div className="page-hero-bg" />
                <div className="container">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="page-hero-title">Business <span className="text-gold">Overview</span></h1>
                        <p className="page-hero-desc">Monitor salon performance, bookings & client operations.</p>
                    </motion.div>
                </div>
            </section>

            <div className="container admin-dash-container">
                {/* Stats Grid */}
                <div className="grid-4" style={{ marginBottom: '2rem' }}>
                    {statCards.map((card, i) => (
                        <motion.div 
                            key={card.label} 
                            className="dash-stat-card"
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="dash-stat-icon" style={{ background: card.bg, color: card.color }}>
                                <card.icon size={24} />
                            </div>
                            <div className="dash-stat-num">{card.value}</div>
                            <div className="dash-stat-label">{card.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Status Breakdown Bar */}
                <div className="admin-card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem' }}>
                    <h4 className="breakdown-title">Appointment Breakdown</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {statusBreakdown.map((item) => (
                            <div key={item.label} className="status-breakdown-chip" style={{ background: item.bg, color: item.color }}>
                                <span>{item.label}:</span>
                                <strong>{item.count}</strong>
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
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>No recent appointments</td>
                                        </tr>
                                    ) : (
                                        (recentAppointments || []).map((apt) => (
                                            <tr key={apt.id}>
                                                <td>
                                                    <div className="apt-client-name">{apt.customer_name}</div>
                                                    <div className="apt-client-sub">{apt.customer_phone}</div>
                                                </td>
                                                <td className="apt-service-col">{apt.serviceName || apt.service_name || 'Service'}</td>
                                                <td>
                                                    <div className="apt-date-col">{new Date(apt.date * 1000).toLocaleDateString('en-IN')}</div>
                                                    <div className="apt-client-sub">{apt.time_slot}</div>
                                                </td>
                                                <td>
                                                    <span className={`status-pill status-${apt.status}`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                                <td className="apt-amount-col">₹{apt.total_amount?.toLocaleString()}</td>
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
                            <Link to="/admin/appointments" className="admin-action-btn" style={{ background: '#ff3b4e', color: '#fff', textDecoration: 'none', display: 'block', textAlign: 'center' }}>Manage Appointments</Link>
                            <Link to="/services" className="admin-action-btn" style={{ background: '#f59e0b', color: '#fff', textDecoration: 'none', display: 'block', textAlign: 'center' }}>Explore Services</Link>
                            <Link to="/gallery" className="admin-action-btn" style={{ background: '#6366f1', color: '#fff', textDecoration: 'none', display: 'block', textAlign: 'center' }}>Salon Gallery</Link>
                            <Link to="/contact" className="admin-action-btn" style={{ background: '#10b981', color: '#fff', textDecoration: 'none', display: 'block', textAlign: 'center' }}>Client Enquiries</Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .admin-dashboard-page {
                    min-height: 100vh;
                    background: var(--cream);
                    transition: background 0.3s ease;
                }
                .admin-dash-container {
                    margin-top: -3.5rem;
                    position: relative;
                    z-index: 10;
                    padding-bottom: 5rem;
                }
                .grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
                @media (max-width: 992px) { .grid-2-1 { grid-template-columns: 1fr; } }
                
                .admin-card {
                    background: #ffffff;
                    border-radius: 1.5rem;
                    padding: 2rem;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.06);
                    border: 1.5px solid rgba(255, 59, 78, 0.15);
                    transition: all 0.3s ease;
                }
                [data-theme='dark'] .admin-card {
                    background: #181524;
                    border-color: rgba(255, 59, 78, 0.3);
                    box-shadow: 0 8px 36px rgba(0,0,0,0.5);
                }
                .admin-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .admin-card-title { display: flex; align-items: center; gap: 0.75rem; margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
                [data-theme='dark'] .admin-card-title { color: #f8fafc; }

                .dash-stat-card {
                    background: #ffffff;
                    border-radius: var(--radius-lg);
                    padding: 1.75rem 1.5rem;
                    text-align: center;
                    border: 1.5px solid rgba(255, 59, 78, 0.15);
                    box-shadow: 0 4px 18px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                }
                [data-theme='dark'] .dash-stat-card {
                    background: #181524;
                    border-color: rgba(255, 59, 78, 0.3);
                    box-shadow: 0 6px 24px rgba(0,0,0,0.4);
                }
                .dash-stat-num {
                    font-family: var(--font-heading);
                    font-size: 2.1rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin-top: 0.85rem;
                }
                [data-theme='dark'] .dash-stat-num {
                    color: #f8fafc;
                }
                .dash-stat-label {
                    font-weight: 600;
                    color: #64748b;
                    font-size: 0.85rem;
                    margin-top: 0.25rem;
                }
                [data-theme='dark'] .dash-stat-label {
                    color: #94a3b8;
                }
                
                .breakdown-title {
                    margin-bottom: 1rem;
                    font-size: 0.92rem;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-weight: 700;
                }
                [data-theme='dark'] .breakdown-title {
                    color: #cbd5e1;
                }

                .status-breakdown-chip {
                    padding: 0.5rem 1.15rem;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: 1px solid rgba(255, 59, 78, 0.15);
                }
                [data-theme='dark'] .status-breakdown-chip {
                    border-color: rgba(255, 59, 78, 0.3);
                }

                .admin-table-wrapper { overflow-x: auto; }
                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table thead tr {
                    background: #f8fafc;
                    border-bottom: 2px solid rgba(255, 59, 78, 0.15);
                }
                [data-theme='dark'] .admin-table thead tr {
                    background: #201c30;
                    border-bottom: 2px solid rgba(255, 59, 78, 0.3);
                }
                .admin-table th {
                    text-align: left;
                    padding: 1rem;
                    color: #475569;
                    font-size: 0.82rem;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    font-weight: 700;
                }
                [data-theme='dark'] .admin-table th {
                    color: #cbd5e1;
                }
                .admin-table td {
                    padding: 1.25rem 1rem;
                    border-bottom: 1px solid rgba(255, 59, 78, 0.08);
                    font-size: 0.92rem;
                }
                [data-theme='dark'] .admin-table td {
                    border-bottom: 1px solid #28233b;
                }
                .admin-table tbody tr:hover {
                    background: #fff5f5;
                }
                [data-theme='dark'] .admin-table tbody tr:hover {
                    background: #221d33;
                }

                .apt-client-name { font-weight: 700; color: #1e293b; }
                [data-theme='dark'] .apt-client-name { color: #f8fafc; }
                .apt-client-sub { font-size: 0.78rem; color: #64748b; }
                [data-theme='dark'] .apt-client-sub { color: #94a3b8; }
                .apt-service-col { font-weight: 600; color: #1e293b; }
                [data-theme='dark'] .apt-service-col { color: #f8fafc; }
                .apt-date-col { font-weight: 600; color: #1e293b; }
                [data-theme='dark'] .apt-date-col { color: #f8fafc; }
                .apt-amount-col { font-weight: 700; color: var(--rose-500); }

                .status-pill {
                    display: inline-block;
                    padding: 0.35rem 0.85rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .status-pending { background: #fef9c3; color: #a16207; }
                [data-theme='dark'] .status-pending { background: rgba(234, 179, 8, 0.2); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.4); }
                .status-confirmed { background: #dcfce7; color: #15803d; }
                [data-theme='dark'] .status-confirmed { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
                .status-completed { background: #e0e7ff; color: #3730a3; }
                [data-theme='dark'] .status-completed { background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4); }
                .status-cancelled { background: #fee2e2; color: #991b1b; }
                [data-theme='dark'] .status-cancelled { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
                
                .admin-actions-list { display: flex; flex-direction: column; gap: 0.85rem; }
                .admin-action-btn { width: 100%; padding: 0.95rem 1.25rem; border: none; border-radius: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; font-size: 0.92rem; }
                .admin-action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
            `}</style>
        </div>
    );
}
