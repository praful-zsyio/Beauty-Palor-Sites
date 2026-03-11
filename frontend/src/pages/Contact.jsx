import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { api } from '../store';
import './Contact.css';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await api.post('/contact', form);
            toast.success(res.data.message || 'Message sent! We\'ll get back to you soon. 🌸');
            setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
            toast.error(msg);
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <Helmet>
                <title>Contact Us | Kiran Beauty Salon & Academy</title>
                <meta name="description" content="Get in touch with Kiran Beauty Salon & Academy. We're here to answer your questions and help you book appointments." />
            </Helmet>

            <section className="page-hero">
                <div className="page-hero-bg" />
                <div className="container">
                    <motion.div className="page-hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="page-hero-title">Contact <span className="text-gold">Us</span></h1>
                        <p className="page-hero-desc">We'd love to hear from you. Reach out for bookings, enquiries, or just a chat!</p>
                    </motion.div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="contact-grid">
                        {/* Info */}
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <div className="section-label">Get in Touch</div>
                            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>We're Here to <span className="text-gradient">Help</span></h2>
                            <div className="contact-info-cards">
                                {[
                                    { Icon: FiMapPin, title: 'Our Location', lines: ['Men Corner, Kaka Complex, New Kaka Complex', 'Pithampur Industrial Area, Sagour Kuti', 'Pithampur, Madhya Pradesh 454775'] },
                                    { Icon: FiPhone, title: 'Phone Number', lines: ['+91 6265175996'] },
                                    { Icon: FiMail, title: 'Email Address', lines: ['info@kiranbeauty.com', 'academy@kiranbeauty.com'] },
                                    { Icon: FiClock, title: 'Working Hours', lines: ['Mon–Sat: 9:00 AM – 8:00 PM', 'Sunday: 10:00 AM – 6:00 PM'] },
                                ].map((item) => (
                                    <div key={item.title} className="contact-info-card">
                                        <div className="info-icon-box"><item.Icon size={20} /></div>
                                        <div>
                                            <h4 className="info-title">{item.title}</h4>
                                            {item.title === 'Phone Number'
                                                ? item.lines.map((l) => <a key={l} className="info-line" href="tel:+916265175996" style={{ color: 'var(--rose-500)', fontWeight: 600, textDecoration: 'none' }}>Call Us: {l}</a>)
                                                : item.lines.map((l) => <p key={l} className="info-line">{l}</p>)
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Form */}
                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                            <div className="contact-form-card">
                                <h3 className="contact-form-title">Send Us a Message</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid-2">
                                        <div className="form-group">
                                            <label className="form-label">Your Name *</label>
                                            <input className="form-control" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone Number</label>
                                            <input className="form-control" placeholder="Mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address *</label>
                                        <input className="form-control" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Subject</label>
                                        <select className="form-control" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                                            <option value="">Select a topic</option>
                                            <option>Appointment Booking</option>
                                            <option>Service Enquiry</option>
                                            <option>Academy Admission</option>
                                            <option>Bridal Package</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Message *</label>
                                        <textarea className="form-control" rows={5} placeholder="Tell us how we can help..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={sending}>
                                        <FiSend /> {sending ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Google Map ── */}
            <section style={{ padding: '0 0 4rem' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '2rem' }}
                    >
                        <div className="section-label" style={{ justifyContent: 'center' }}>Find Us</div>
                        <h2 className="section-title">Our <span className="text-gradient">Location</span></h2>
                        <p style={{ color: 'var(--slate)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Men Corner, Kaka Complex, Pithampur Industrial Area, Madhya Pradesh 454775
                        </p>
                        <a
                            href="https://maps.app.goo.gl/7yBMWFQ7vP62uv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ display: 'inline-flex', marginTop: '1rem' }}
                        >
                            <FiMapPin /> Open in Google Maps
                        </a>
                    </motion.div>
                    <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(26,26,46,0.12)', border: '1px solid rgba(244,63,94,0.08)' }}>
                        <iframe
                            title="Kiran Beauty Salon Location"
                            src="https://maps.google.com/maps?q=Kiran%20Beauty%20Salon%20Pithampur&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="380"
                            style={{ border: 0, display: 'block' }}
                            loading="lazy"
                            allowFullScreen
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
