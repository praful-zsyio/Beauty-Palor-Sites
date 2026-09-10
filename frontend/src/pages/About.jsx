import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiAward, FiUsers, FiStar, FiCheck } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import './About.css';

const team = [
    { name: 'Shivani Sonwane', role: 'Founder, Master Celebrity Makeup Artist & Cosmetologist', emoji: '👑', exp: 'Master Artist & Founder' },
];

const milestones = [
    { year: '2026', title: 'Grand Opening', desc: 'Shivani Beauty Palor & Academy opened its luxury salon doors at New Agrawal Colony Near New Sun Bright School Pithampur' },
    { year: '2026', title: 'Academy Launch', desc: 'Launched certified professional bridal, hair & cosmetology academy courses' },
    { year: '2026', title: 'Excellence Award', desc: 'Recognized as the premier luxury makeover and bridal destination' },
    { year: '2026', title: 'Digital Luxury Experience', desc: 'Introduced smart booking, Google Authentication & VIP personalized care' },
];

export default function About() {
    return (
        <div>
            <Helmet>
                <title>About Us | Shivani Beauty Palor & Academy</title>
                <meta name="description" content="Learn about Shivani Beauty Palor & Academy at New Agrawal Colony Near New Sun Bright School Pithampur — founded in 2026 by Shivani Sonwane." />
            </Helmet>

            {/* Hero */}
            <section className="page-hero">
                <div className="page-hero-bg" />
                <div className="container">
                    <motion.div className="page-hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="section-label" style={{ justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}>Our Story</div>
                        <h1 className="page-hero-title">About <span className="text-gold">Shivani Beauty Palor</span></h1>
                        <p className="page-hero-desc">Founded in 2026 by Shivani Sonwane — Transforming beauty, empowering confidence, and luxury bridal artistry</p>
                    </motion.div>
                </div>
            </section>

            {/* Story */}
            <section className="section">
                <div className="container">
                    <div className="about-story-grid">
                        <motion.div className="about-story-visual" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <div className="story-big-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                                <img
                                    src="/images/hero_salon.jpg"
                                    alt="Shivani Beauty Palor Interior"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div className="story-badge-floating" style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 2, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
                                    <FiAward style={{ color: '#d4a843', fontSize: '1.2rem' }} />
                                    <span>🏆 Winner: Best Bridal Studio MP</span>
                                </div>
                            </div>
                            <div className="story-small-cards">
                                <div className="story-small-card"><FiUsers style={{ color: 'var(--rose-500)' }} /><strong>Est. 2026</strong><span>Modern Luxury</span></div>
                                <div className="story-small-card"><FiStar style={{ color: '#f59e0b' }} /><strong>4.9★</strong><span>Rating</span></div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                            <div className="section-label">Who We Are</div>
                            <h2 className="section-title">A Legacy of <span className="text-gradient">Beauty</span></h2>
                            <p className="about-desc">Founded in 2026 by Shivani Sonwane, Shivani Beauty Palor & Academy is located at New Agrawal Colony Near New Sun Bright School Pithampur, Madhya Pradesh. Designed with modern aesthetics and top-tier luxury care, it is the region's premier bridal and aesthetic sanctuary.</p>
                            <p className="about-desc">We believe that beauty is more than skin deep — it's about confidence, self-expression, and artistry. Shivani Sonwane brings the latest international trends and personalized attention to every single client.</p>
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
            <section className="section" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)' }}>
                <div className="container">
                    <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="section-label" style={{ justifyContent: 'center' }}>Our Journey</div>
                        <h2 className="section-title">Milestones of <span className="text-gradient">Excellence</span></h2>
                    </motion.div>
                    <div className="timeline">
                        {milestones.map((m, i) => (
                            <motion.div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}
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
                        <div className="section-label" style={{ justifyContent: 'center' }}>Founder & Master Artist</div>
                        <h2 className="section-title">Meet <span className="text-gradient">Shivani Sonwane</span></h2>
                        <p style={{ color: 'var(--slate)', maxWidth: 500, margin: '0.75rem auto 0' }}>The creative vision behind Shivani Beauty Palor & Academy</p>
                    </motion.div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
                        {team.map((member, i) => (
                            <motion.div key={member.name} className="team-card" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}
                                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                                whileHover={{ y: -8 }}>
                                <div className="team-avatar">{member.emoji}</div>
                                <h3 className="team-name">{member.name}</h3>
                                <p className="team-role">{member.role}</p>
                                <span className="team-exp">{member.exp}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
