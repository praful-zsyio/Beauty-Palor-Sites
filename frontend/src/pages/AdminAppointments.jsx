import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiRefreshCw, FiSearch, FiPhone, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../store';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState({ search: '', status: '' });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/appointments/admin/all');
            setAppointments(res.data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch appointments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/appointments/${id}/status`, { status: newStatus });
            toast.success(`Appointment status changed to ${newStatus}!`);
            fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="admin-appointments-page">
            <Helmet>
                <title>Manage Appointments | Admin Portal | Shivani Beauty Palor</title>
            </Helmet>

            <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
                <header className="admin-page-header">
                    <div>
                        <h1 className="admin-page-title">Manage Appointments</h1>
                        <p className="admin-page-sub">View and update all customer bookings</p>
                    </div>
                    <button onClick={fetchAllData} className="btn btn-outline btn-sm">
                        <FiRefreshCw /> Refresh
                    </button>
                </header>

                {/* Filters */}
                <div className="admin-card filter-card">
                    <div className="filter-row">
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <div className="input-wrap">
                                <FiSearch className="input-icon" />
                                <input 
                                    className="form-control input-padded" 
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
                <div className="admin-card table-card">
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
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
                                    [...Array(5)].map((_, i) => <tr key={i}><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate)' }}>Loading appointments...</td></tr>)
                                ) : appointments.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--slate)' }}>No appointments found.</td></tr>
                                ) : (
                                    appointments.filter(a => a.customer_name?.toLowerCase().includes(filter.search.toLowerCase()) || a.appointment_id?.includes(filter.search)).map(apt => (
                                        <tr key={apt.id}>
                                            <td>
                                                <div className="apt-id-text">{apt.appointment_id}</div>
                                                <div className="apt-date-text">{new Date(apt.date * 1000).toLocaleDateString()}</div>
                                            </td>
                                            <td>
                                                <div className="apt-name-text">{apt.customer_name}</div>
                                                <div className="apt-phone-text"><FiPhone size={10} /> {apt.customer_phone}</div>
                                            </td>
                                            <td className="apt-service-text">{apt.service_name || apt.serviceName || 'Service'}</td>
                                            <td>
                                                <div className="apt-slot-text">{apt.time_slot}</div>
                                                <div className="apt-amount-text">₹{apt.total_amount?.toLocaleString()}</div>
                                            </td>
                                            <td>
                                                <span className={`status-pill status-${apt.status}`}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.65rem' }}>
                                                    <button 
                                                        title="Confirm" 
                                                        onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                                        className="action-icon-btn action-confirm"
                                                    >
                                                        <FiCheckCircle size={18} />
                                                    </button>
                                                    <button 
                                                        title="Complete" 
                                                        onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                                        className="action-icon-btn action-complete"
                                                    >
                                                        <FiCheckCircle size={18} />
                                                    </button>
                                                    <button 
                                                        title="Cancel" 
                                                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                                        className="action-icon-btn action-cancel"
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
                .admin-appointments-page {
                    min-height: 100vh;
                    background: var(--cream);
                    transition: background 0.3s ease;
                }
                [data-theme='dark'] .admin-appointments-page {
                    background: #0f0e15;
                }
                .admin-page-header {
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .admin-page-title {
                    font-size: 1.85rem;
                    font-weight: 800;
                    color: var(--charcoal);
                }
                [data-theme='dark'] .admin-page-title {
                    color: #f8fafc;
                }
                .admin-page-sub {
                    color: var(--slate);
                    margin-top: 0.25rem;
                }
                [data-theme='dark'] .admin-page-sub {
                    color: #94a3b8;
                }
                .admin-card {
                    background: #ffffff;
                    border-radius: 1.25rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
                    border: 1.5px solid rgba(255, 59, 78, 0.15);
                    transition: all 0.3s ease;
                }
                [data-theme='dark'] .admin-card {
                    background: #181524;
                    border-color: rgba(255, 59, 78, 0.3);
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
                }
                .filter-card {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                }
                [data-theme='dark'] .filter-card {
                    background: #181524;
                }
                .filter-row {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .table-card {
                    padding: 0;
                    overflow: hidden;
                }
                [data-theme='dark'] .table-card {
                    background: #181524;
                }
                .admin-table-wrapper {
                    overflow-x: auto;
                }
                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .admin-table thead tr {
                    background: #f8fafc;
                    border-bottom: 2px solid rgba(255, 59, 78, 0.15);
                }
                [data-theme='dark'] .admin-table thead tr {
                    background: #201c30;
                    border-bottom: 2px solid rgba(255, 59, 78, 0.3);
                }
                .admin-table th {
                    padding: 1.15rem 1rem;
                    text-align: left;
                    font-size: 0.82rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: #475569;
                }
                [data-theme='dark'] .admin-table th {
                    color: #cbd5e1;
                }
                .admin-table tbody tr {
                    background: #ffffff;
                    transition: background 0.2s ease;
                }
                [data-theme='dark'] .admin-table tbody tr {
                    background: #181524;
                }
                .admin-table td {
                    padding: 1.25rem 1rem;
                    text-align: left;
                    border-bottom: 1px solid rgba(255, 59, 78, 0.1);
                    font-size: 0.92rem;
                    color: #1e293b;
                }
                [data-theme='dark'] .admin-table td {
                    border-bottom: 1px solid #28233b;
                    color: #f8fafc;
                }
                .admin-table tbody tr:hover {
                    background: #fff5f5;
                }
                [data-theme='dark'] .admin-table tbody tr:hover {
                    background: #231e36;
                }
                .apt-id-text {
                    font-weight: 700;
                    font-size: 0.88rem;
                    color: var(--rose-500);
                }
                [data-theme='dark'] .apt-id-text {
                    color: #ff6b7a;
                }
                .apt-date-text {
                    font-size: 0.78rem;
                    color: #64748b;
                }
                [data-theme='dark'] .apt-date-text {
                    color: #94a3b8;
                }
                .apt-name-text {
                    font-weight: 700;
                    color: #1e293b;
                }
                [data-theme='dark'] .apt-name-text {
                    color: #f8fafc;
                }
                .apt-phone-text {
                    font-size: 0.78rem;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                [data-theme='dark'] .apt-phone-text {
                    color: #94a3b8;
                }
                .apt-service-text {
                    font-weight: 600;
                    color: #1e293b;
                }
                [data-theme='dark'] .apt-service-text {
                    color: #f8fafc;
                }
                .apt-slot-text {
                    font-weight: 600;
                    color: #1e293b;
                }
                [data-theme='dark'] .apt-slot-text {
                    color: #f8fafc;
                }
                .apt-amount-text {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--rose-500);
                }
                .status-pill {
                    display: inline-block;
                    padding: 0.35rem 0.85rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .status-pending {
                    background: #fef9c3;
                    color: #a16207;
                }
                [data-theme='dark'] .status-pending {
                    background: rgba(234, 179, 8, 0.2);
                    color: #fde047;
                    border: 1px solid rgba(234, 179, 8, 0.4);
                }
                .status-confirmed {
                    background: #dcfce7;
                    color: #15803d;
                }
                [data-theme='dark'] .status-confirmed {
                    background: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                    border: 1px solid rgba(34, 197, 94, 0.4);
                }
                .status-completed {
                    background: #e0e7ff;
                    color: #3730a3;
                }
                [data-theme='dark'] .status-completed {
                    background: rgba(99, 102, 241, 0.2);
                    color: #818cf8;
                    border: 1px solid rgba(99, 102, 241, 0.4);
                }
                .status-cancelled {
                    background: #fee2e2;
                    color: #991b1b;
                }
                [data-theme='dark'] .status-cancelled {
                    background: rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    border: 1px solid rgba(239, 68, 68, 0.4);
                }
                .action-icon-btn {
                    border: none;
                    background: none;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .action-icon-btn:hover {
                    transform: scale(1.15);
                }
                .action-confirm { color: #16a34a; }
                .action-complete { color: #2563eb; }
                .action-cancel { color: #dc2626; }
            `}</style>
        </div>
    );
}
