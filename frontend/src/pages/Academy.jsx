import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiCalendar } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import './Academy.css';

const courses = [
    { title: 'Professional Makeup Artist', duration: '3 Months', fee: '₹25,000', mode: 'Offline', emoji: '💄', features: ['Foundation & Contouring', 'Bridal Makeup', 'Airbrush Techniques', 'HD Makeup', 'Certification'] },
    { title: 'Hair Styling & Coloring', duration: '2 Months', fee: '₹18,000', mode: 'Offline', emoji: '💇', features: ['Basic Hair Cuts', 'Coloring & Balayage', 'Keratin Treatment', 'Bridal Hair', 'Certification'] },
    { title: 'Skin Care & Beautician', duration: '4 Months', fee: '₹30,000', mode: 'Hybrid', emoji: '✨', features: ['Facial Techniques', 'Skin Analysis', 'Chemical Peels', 'Anti-Aging Treatments', 'Certification'] },
    { title: 'Nail Art Master Class', duration: '6 Weeks', fee: '₹12,000', mode: 'Offline', emoji: '💅', features: ['Basic Nail Art', 'Gel Extensions', '3D Nail Art', 'Nail Business', 'Certificate'] },
    { title: 'Bridal Beauty Expert', duration: '1 Month', fee: '₹20,000', mode: 'Offline', emoji: '👰', features: ['Bridal Makeup', 'Mehendi Basics', 'Hair Styling', 'Saree Draping', 'Portfolio'] },
    { title: 'Complete Beauty Diploma', duration: '6 Months', fee: '₹55,000', mode: 'Offline', emoji: '🎓', features: ['All Services', 'Business Training', 'Marketing Basics', 'Internship', 'Govt. Recognized Diploma'], featured: true },
];

export default function Academy() {
    return (
        <div>
            <Helmet>
                <title>Beauty Academy | Kiran Beauty Salon & Academy</title>
                <meta name="description" content="Join Kiran Beauty Academy. Professional makeup, hair styling, skincare and nail art courses with certification." />
            </Helmet>

            <section className="page-hero">
                <div className="page-hero-bg" />
                <div className="container">
                    <motion.div className="page-hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="section-label" style={{ justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}>Professional Training</div>
                        <h1 className="page-hero-title">Kiran Beauty <span className="text-gold">Academy</span></h1>
                        <p className="page-hero-desc">Launch your beauty career with industry-certified courses taught by expert artists</p>
                        <div className="academy-hero-stats">
                            {[{ n: '500+', l: 'Students Trained' }, { n: '95%', l: 'Placement Rate' }, { n: '10+', l: 'Courses' }, { n: '100%', l: 'Certified' }].map((s) => (
                                <div key={s.l} className="academy-stat">
                                    <strong>{s.n}</strong><span>{s.l}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Why Academy */}
            <section className="section">
                <div className="container">
                    <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="section-label" style={{ justifyContent: 'center' }}>Why Choose Us</div>
                        <h2 className="section-title">Learn from the <span className="text-gradient">Best</span></h2>
                    </motion.div>
                    <div className="grid grid-4" style={{ marginTop: '2.5rem' }}>
                        {[
                            { emoji: '🏆', title: 'Expert Faculty', desc: 'Learn from internationally certified beauty professionals' },
                            { emoji: '📜', title: 'Certified Courses', desc: 'Industry-recognized certifications that open doors globally' },
                            { emoji: '💼', title: 'Job Assistance', desc: '95% placement rate with top salons and brands' },
                            { emoji: '🛠️', title: 'Hands-on Training', desc: 'Real client experience in our working salon' },
                        ].map((f, i) => (
                            <motion.div key={f.title} className="academy-feature-card"
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -6 }}>
                                <div className="af-emoji">{f.emoji}</div>
                                <h4 className="af-title">{f.title}</h4>
                                <p className="af-desc">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Courses */}
            <section className="section" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%)' }}>
                <div className="container">
                    <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="section-label" style={{ justifyContent: 'center' }}>Our Programs</div>
                        <h2 className="section-title">Professional <span className="text-gradient">Courses</span></h2>
                    </motion.div>
                    <div className="courses-grid" style={{ marginTop: '2.5rem' }}>
                        {courses.map((c, i) => (
                            <motion.div key={c.title} className={`course-card ${c.featured ? 'featured' : ''}`}
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -8 }}>
                                {c.featured && <div className="course-featured-badge">⭐ Most Popular</div>}
                                <div className="course-emoji">{c.emoji}</div>
                                <h3 className="course-title">{c.title}</h3>
                                <div className="course-meta">
                                    <span>⏱ {c.duration}</span>
                                    <span>📍 {c.mode}</span>
                                </div>
                                <ul className="course-features">
                                    {c.features.map((f) => (
                                        <li key={f}><FiCheck style={{ color: 'var(--rose-500)', flexShrink: 0 }} /> {f}</li>
                                    ))}
                                </ul>
                                <div className="course-footer">
                                    <div className="course-fee">{c.fee}</div>
                                    <Link to="/contact" className={`btn btn-sm ${c.featured ? 'btn-primary' : 'btn-outline'}`}>
                                        Enquire <FiArrowRight size={13} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section">
                <div className="container">
                    <motion.div className="academy-cta" initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                        <div className="cta-orb cta-orb-1" /><div className="cta-orb cta-orb-2" />
                        <h2 className="cta-title">Ready to <span className="text-gold">Start Your Journey?</span></h2>
                        <p className="cta-desc">Enroll now and get ₹2,000 off on any course. Limited seats available!</p>
                        <div className="cta-actions">
                            <Link to="/contact" className="btn btn-gold btn-lg"><FiCalendar /> Book Free Demo</Link>
                            <a href="tel:+919876543210" className="btn btn-ghost btn-lg">Call Us</a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
