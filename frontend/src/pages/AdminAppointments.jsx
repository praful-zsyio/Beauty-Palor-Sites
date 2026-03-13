import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiPhone, FiSearch, FiFilter, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { api } from '../store';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState({ status: '', search: '' });

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [aptRes, statsRes] = await Promise.all([
                api.get('/appointments/my?limit=100'), // Reusing my for now, but need a real admin all endpoint
                api.get('/admin/stats')
            ]);
            // Note: appointments/my actually returns all for admin in better-sqlite3 logic?
            // Let's check backend... actually Appointment.findAll exists.
            
            // Fetching specifically using admin findAll
            const realAptRes = await api.get(`/appointments/admin/all?status=${filter.status}`);
            setAppointments(realAptRes.data.data);
            setStats(statsRes.data.data.stats);
        } catch (err) {
            toast.error('Failed to fetch appointments');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [filter.status]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/appointments/${id}/status`, { status: newStatus });
            toast.success(`Updated to ${newStatus}`);
            fetchAllData();
        } catch (err) {
            toast.error('Update failed');
        }
    };

    return (
        <div className="admin-appointments-page" style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <Helmet>
                <title>Manage Appointments | Admin</title>
            </Helmet>

            <div className="container">
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e' }}>Manage Appointments</h1>
                        <p style={{ color: 'var(--slate)' }}>View and update all customer bookings</p>
                    </div>
                    <button onClick={fetchAllData} className="btn btn-outline btn-sm">
                        <FiRefreshCw /> Refresh
                    </button>
                </header>

                {/* Filters */}
                <div className="admin-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <div className="input-wrap">
                                <FiSearch className="input-icon" />
                                <input 
                                    className="form-control" 
                                    placeholder="Search customer name or ID..." 
                                    value={filter.search}
                                    onChange={(e) => setFilter({...filter, search: e.target.value})}
                                />
                            </div>
                        </div>
                        <select 
                            className="form-control" 
                            style={{ width: '200px' }}
                            value={filter.status}
                            onChange={(e) => setFilter({...filter, status: e.target.value})}
                        >
                            <option value="">All Statuses</option>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th>Appointment</th>
                                    <th>Customer</th>
                                    <th>Service</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => <tr key={i}><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>)
                                ) : appointments.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--slate)' }}>No appointments found.</td></tr>
                                ) : (
                                    appointments.filter(a => a.customer_name?.toLowerCase().includes(filter.search.toLowerCase()) || a.appointment_id?.includes(filter.search)).map(apt => (
                                        <tr key={apt.id}>
                                            <td>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{apt.appointment_id}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--slate)' }}>{new Date(apt.date * 1000).toLocaleDateString()}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{apt.customer_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--slate)' }}><FiPhone size={10} /> {apt.customer_phone}</div>
                                            </td>
                                            <td>{apt.service_name || apt.serviceName || 'Service'}</td>
                                            <td>
                                                <div>{apt.time_slot}</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>₹{apt.total_amount?.toLocaleString()}</div>
                                            </td>
                                            <td>
                                                <span className={`status-pill status-${apt.status}`}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button 
                                                        title="Confirm" 
                                                        onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                                        style={{ color: '#15803d', border: 'none', background: 'none', cursor: 'pointer' }}
                                                    >
                                                        <FiCheckCircle size={18} />
                                                    </button>
                                                    <button 
                                                        title="Complete" 
                                                        onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                                        style={{ color: '#1d4ed8', border: 'none', background: 'none', cursor: 'pointer' }}
                                                    >
                                                        <FiCheckCircle size={18} />
                                                    </button>
                                                    <button 
                                                        title="Cancel" 
                                                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                                        style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer' }}
                                                    >
                                                        <FiXCircle size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .admin-card { background: #fff; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th, .admin-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
                .status-pill { padding: 0.25rem 0.75rem; borderRadius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
                .status-pending { background: #fef9c3; color: #a16207; }
                .status-confirmed { background: #dcfce7; color: #15803d; }
                .status-completed { background: #dcfce7; color: #15803d; }
                .status-cancelled { background: #fee2e2; color: #991b1b; }
            `}</style>
        </div>
    );
}
