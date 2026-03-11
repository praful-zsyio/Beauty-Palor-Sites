import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiAward, FiUsers, FiStar, FiCheck } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import './About.css';

const team = [
    { name: 'Kiran Sharma', role: 'Founder & Lead Artist', emoji: '👸', exp: '15+ years' },
    { name: 'Priya Gupta', role: 'Bridal Specialist', emoji: '💍', exp: '10+ years' },
    { name: 'Riya Joshi', role: 'Hair Expert', emoji: '💇', exp: '8+ years' },
    { name: 'Anjali Verma', role: 'Skin Therapist', emoji: '✨', exp: '7+ years' },
];

const milestones = [
    { year: '2009', title: 'Founded', desc: 'Kiran Beauty Salon opened its doors in Pithampur' },
    { year: '2014', title: 'Academy Launch', desc: 'Started professional beauty academy courses' },
    { year: '2018', title: 'Award Winning', desc: 'Received Best Bridal Salon award in MP' },
    { year: '2022', title: '5000+ Clients', desc: 'Crossed milestone of 5000 satisfied customers' },
    { year: '2024', title: 'Online Booking', desc: 'Launched digital platform for easy appointments' },
];

export default function About() {
    return (
        <div>
            <Helmet>
                <title>About Us | Kiran Beauty Salon & Academy</title>
                <meta name="description" content="Learn about Kiran Beauty Salon & Academy — 15+ years of excellence in beauty services and professional training." />
            </Helmet>

            {/* Hero */}
            <section className="page-hero">
                <div className="page-hero-bg" />
                <div className="container">
                    <motion.div className="page-hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="section-label" style={{ justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}>Our Story</div>
                        <h1 className="page-hero-title">About <span className="text-gold">Kiran Beauty</span></h1>
                        <p className="page-hero-desc">15+ years of transforming beauty, empowering confidence, and nurturing talent</p>
                    </motion.div>
                </div>
            </section>

            {/* Story */}
            <section className="section">
                <div className="container">
                    <div className="about-story-grid">
                        <motion.div className="about-story-visual" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <div className="story-big-card">
                                <div className="story-emoji">🌸</div>
                                <div className="story-badge-floating">
                                    <FiAward style={{ color: '#d4a843' }} />
                                    <span>Est. 2009</span>
                                </div>
                            </div>
                            <div className="story-small-cards">
                                <div className="story-small-card"><FiUsers style={{ color: 'var(--rose-500)' }} /><strong>5000+</strong><span>Clients</span></div>
                                <div className="story-small-card"><FiStar style={{ color: '#f59e0b' }} /><strong>4.9★</strong><span>Rating</span></div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                            <div className="section-label">Who We Are</div>
                            <h2 className="section-title">A Legacy of <span className="text-gradient">Beauty</span></h2>
                            <p className="about-desc">Founded in 2009 by Kiran Sharma, Kiran Beauty Salon & Academy has grown from a small neighbourhood salon to a premier beauty destination in Pithampur, Madhya Pradesh.</p>
                            <p className="about-desc">We believe that beauty is more than skin deep — it's about confidence, self-expression, and artistry. Our team of internationally trained experts brings global trends to every client, while keeping the warmth and care of a family salon.</p>
                            <div className="about-values">
                                {['Premium quality products only', 'Hygiene-first approach', 'Personalized care for every client', 'Continuous learning & innovation'].map((v) => (
                                    <div key={v} className="about-value-item">
                                        <FiCheck className="value-check" />
                                        <span>{v}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/book" className="btn btn-primary btn-lg" style={{ marginTop: '1.75rem' }}>Book a Session <FiArrowRight /></Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="section" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%)' }}>
                <div className="container">
                    <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="section-label" style={{ justifyContent: 'center' }}>Our Journey</div>
                        <h2 className="section-title">Milestones of <span className="text-gradient">Excellence</span></h2>
                    </motion.div>
                    <div className="timeline">
                        {milestones.map((m, i) => (
                            <motion.div key={m.year} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                <div className="timeline-card">
                                    <span className="timeline-year">{m.year}</span>
                                    <h4 className="timeline-title">{m.title}</h4>
                                    <p className="timeline-desc">{m.desc}</p>
                                </div>
                                <div className="timeline-dot" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="section">
                <div className="container">
                    <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="section-label" style={{ justifyContent: 'center' }}>Our Experts</div>
                        <h2 className="section-title">Meet the <span className="text-gradient">Team</span></h2>
                        <p style={{ color: 'var(--slate)', maxWidth: 500, margin: '0.75rem auto 0' }}>Passionate artists who turn your beauty dreams into reality</p>
                    </motion.div>
                    <div className="grid grid-4" style={{ marginTop: '2.5rem' }}>
                        {team.map((member, i) => (
                            <motion.div key={member.name} className="team-card"
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8 }}>
                                <div className="team-avatar">{member.emoji}</div>
                                <h3 className="team-name">{member.name}</h3>
                                <p className="team-role">{member.role}</p>
                                <span className="team-exp">{member.exp} experience</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
