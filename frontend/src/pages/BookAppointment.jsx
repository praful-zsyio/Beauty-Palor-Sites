import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiPhone, FiMail, FiCheck } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { useServiceStore, useAppointmentStore, useAuthStore } from '../store';
import './BookAppointment.css';

const steps = ['Service', 'Date & Time', 'Details', 'Confirm'];

export default function BookAppointment() {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { service, fetchService, services, fetchServices } = useServiceStore();
    const { bookAppointment, fetchAvailableSlots, availableSlots, isLoading } = useAppointmentStore();

    const [step, setStep] = useState(serviceId ? 1 : 0);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [form, setForm] = useState({
        customerName: user?.name || '',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        notes: '',
        paymentMethod: 'cash',
    });
    const [booked, setBooked] = useState(null);

    useEffect(() => {
        if (serviceId) {
            fetchService(serviceId).then(() => {
                setSelectedService(service);
            });
        } else {
            fetchServices({ limit: 50 });
        }
    }, [serviceId]);

    useEffect(() => {
        if (service && serviceId) setSelectedService(service);
    }, [service]);

    useEffect(() => {
        if (selectedDate && selectedService) {
            fetchAvailableSlots(selectedDate.toISOString().split('T')[0], selectedService._id);
        }
    }, [selectedDate, selectedService]);

    const handleBook = async () => {
        if (!selectedService || !selectedDate || !selectedSlot) {
            toast.error('Please complete all required fields');
            return;
        }
        const result = await bookAppointment({
            serviceId: selectedService._id,
            date: selectedDate.toISOString(),
            timeSlot: selectedSlot,
            ...form,
        });
        if (result.success) {
            setBooked(result.data);
            toast.success('Appointment booked successfully! 🎉');
        } else {
            toast.error(result.error || 'Booking failed');
        }
    };

    if (booked) {
        return (
            <div className="booking-success">
                <motion.div
                    className="success-card"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                >
                    <div className="success-icon">✅</div>
                    <h2>Booking Confirmed!</h2>
                    <p className="booking-id">ID: <strong>{booked.appointmentId}</strong></p>
                    <div className="success-details">
                        <p>📅 {new Date(booked.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p>🕐 {booked.timeSlot}</p>
                        <p>💰 ₹{booked.payment?.totalAmount?.toLocaleString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                        <Link to="/dashboard" className="btn btn-primary">View Dashboard</Link>
                        <Link to="/" className="btn btn-outline">Back to Home</Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="book-page">
            <Helmet>
                <title>Book Appointment | Kiran Beauty Salon</title>
                <meta name="description" content="Book your beauty appointment at Kiran Beauty Salon & Academy." />
            </Helmet>

            <section className="page-hero" style={{ paddingBottom: '3rem' }}>
                <div className="page-hero-bg" />
                <div className="container">
                    <motion.div className="page-hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="page-hero-title">Book <span className="text-gold">Appointment</span></h1>
                        <p className="page-hero-desc">Choose your service and preferred time — we'll take care of the rest</p>
                    </motion.div>
                </div>
            </section>

            <div className="container book-container">
                {/* Progress Steps */}
                <div className="book-steps">
                    {steps.map((s, i) => (
                        <div key={s} className={`book-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                            <div className="step-circle">
                                {i < step ? <FiCheck size={14} /> : i + 1}
                            </div>
                            <span className="step-label">{s}</span>
                            {i < steps.length - 1 && <div className="step-line" />}
                        </div>
                    ))}
                </div>

                <div className="book-content">
                    {/* Step 0: Select Service */}
                    {step === 0 && (
                        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="book-step-title">Choose a Service</h2>
                            <div className="service-select-grid">
                                {services.map((s) => (
                                    <div
                                        key={s._id}
                                        className={`service-select-card ${selectedService?._id === s._id ? 'selected' : ''}`}
                                        onClick={() => setSelectedService(s)}
                                    >
                                        <div className="ssc-emoji">{s.category === 'Hair' ? '💇' : s.category === 'Skin' ? '✨' : s.category === 'Nails' ? '💅' : s.category === 'Makeup' ? '💄' : '🌸'}</div>
                                        <div>
                                            <p className="ssc-name">{s.name}</p>
                                            <p className="ssc-meta">{s.duration}min • ₹{(s.discountedPrice || s.price).toLocaleString()}</p>
                                        </div>
                                        {selectedService?._id === s._id && <FiCheck className="ssc-check" />}
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-primary btn-lg" disabled={!selectedService} onClick={() => setStep(1)} style={{ marginTop: '1.5rem' }}>
                                Continue →
                            </button>
                        </motion.div>
                    )}

                    {/* Step 1: Date & Time */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="book-step-title">Pick Date & Time</h2>
                            <div className="date-time-grid">
                                <div>
                                    <label className="form-label"><FiCalendar /> Select Date</label>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={setSelectedDate}
                                        minDate={new Date()}
                                        inline
                                        className="form-control"
                                    />
                                </div>
                                {selectedDate && (
                                    <div>
                                        <label className="form-label"><FiClock /> Available Slots</label>
                                        {availableSlots.length > 0 ? (
                                            <div className="slots-grid">
                                                {availableSlots.map((slot) => (
                                                    <button
                                                        key={slot}
                                                        className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                                                        onClick={() => setSelectedSlot(slot)}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-slots">
                                                <p>All slots are booked for this date.</p>
                                                <p>Please select another date.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button className="btn btn-outline" onClick={() => setStep(serviceId ? 1 : 0)}>← Back</button>
                                <button className="btn btn-primary btn-lg" disabled={!selectedDate || !selectedSlot} onClick={() => setStep(2)}>
                                    Continue →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Customer Details */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="book-step-title">Your Details</h2>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label"><FiUser /> Full Name *</label>
                                    <input className="form-control" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Your full name" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><FiPhone /> Phone Number *</label>
                                    <input className="form-control" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="10-digit mobile number" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label"><FiMail /> Email Address *</label>
                                <input className="form-control" type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} placeholder="your@email.com" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Special Requests / Notes</label>
                                <textarea className="form-control" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special requests or allergies to mention..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Payment Method</label>
                                <div className="payment-methods">
                                    {['cash', 'card', 'upi'].map((m) => (
                                        <button
                                            key={m}
                                            className={`payment-method-btn ${form.paymentMethod === m ? 'selected' : ''}`}
                                            onClick={() => setForm({ ...form, paymentMethod: m })}
                                        >
                                            {m === 'cash' ? '💵 Cash' : m === 'card' ? '💳 Card' : '📱 UPI'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                                <button className="btn btn-primary btn-lg" disabled={!form.customerName || !form.customerPhone || !form.customerEmail} onClick={() => setStep(3)}>
                                    Review Booking →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && selectedService && (
                        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="book-step-title">Confirm Booking</h2>
                            <div className="confirm-summary">
                                <div className="summary-row">
                                    <span>Service</span>
                                    <strong>{selectedService.name}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Category</span>
                                    <span className="badge badge-rose">{selectedService.category}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Duration</span>
                                    <strong>{selectedService.duration} minutes</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Date</span>
                                    <strong>{selectedDate?.toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Time</span>
                                    <strong>{selectedSlot}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Name</span>
                                    <strong>{form.customerName}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Phone</span>
                                    <strong>{form.customerPhone}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Payment</span>
                                    <strong>{form.paymentMethod.toUpperCase()}</strong>
                                </div>
                                <div className="summary-divider" />
                                <div className="summary-row total">
                                    <span>Total Amount (incl. GST)</span>
                                    <strong className="summary-total">
                                        ₹{(((selectedService.discountedPrice || selectedService.price) * 1.18)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </strong>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button className="btn btn-outline" onClick={() => setStep(2)}>← Edit</button>
                                <button className="btn btn-primary btn-lg" onClick={handleBook} disabled={isLoading} style={{ flex: 1, justifyContent: 'center' }}>
                                    {isLoading ? '⏳ Booking...' : '✅ Confirm Booking'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar Summary */}
                {selectedService && step > 0 && (
                    <motion.div className="book-sidebar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="sidebar-card">
                            <h3 className="sidebar-title">Booking Summary</h3>
                            <div className="sidebar-service">
                                <span>🌸</span>
                                <div>
                                    <p className="sidebar-service-name">{selectedService.name}</p>
                                    <p className="sidebar-service-meta">{selectedService.duration} min</p>
                                </div>
                            </div>
                            {selectedDate && <p className="sidebar-info">📅 {selectedDate.toLocaleDateString('en-IN')}</p>}
                            {selectedSlot && <p className="sidebar-info">🕐 {selectedSlot}</p>}
                            <div className="sidebar-price">
                                <span>Total</span>
                                <strong>₹{(selectedService.discountedPrice || selectedService.price).toLocaleString()}</strong>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
