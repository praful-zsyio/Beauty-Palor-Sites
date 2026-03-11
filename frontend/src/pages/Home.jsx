import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowRight, FiStar, FiCalendar, FiAward, FiPhone } from 'react-icons/fi';
import { GiFlowerTwirl, GiLipstick, GiNails, GiHairStrands } from 'react-icons/gi';
import { Helmet } from 'react-helmet-async';
import { useServiceStore } from '../store';
import ServiceCard from '../components/ServiceCard';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { number: '5000+', label: 'Happy Clients', icon: '😊' },
  { number: '15+', label: 'Years Experience', icon: '⭐' },
  { number: '50+', label: 'Expert Artists', icon: '💄' },
  { number: '200+', label: 'Services Offered', icon: '✨' },
];

const categories = [
  { name: 'Hair Care', icon: GiHairStrands, desc: 'Cuts, Color & Styling', color: '#fdf2f8', accent: '#ec4899', emoji: '💇' },
  { name: 'Bridal', icon: GiFlowerTwirl, desc: 'Complete Bridal Packages', color: '#fef9e7', accent: '#d4a843', emoji: '👰' },
  { name: 'Makeup', icon: GiLipstick, desc: 'Party & Event Makeup', color: '#fff1f2', accent: '#f43f5e', emoji: '💄' },
  { name: 'Nail Art', icon: GiNails, desc: 'Manicure & Pedicure', color: '#f0fdf4', accent: '#22c55e', emoji: '💅' },
  { name: 'Skin Care', icon: GiFlowerTwirl, desc: 'Facials & Treatments', color: '#fff7ed', accent: '#f97316', emoji: '✨' },
  { name: 'Spa', icon: GiFlowerTwirl, desc: 'Relaxation & Wellness', color: '#f0f9ff', accent: '#0ea5e9', emoji: '🧖' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Bride', rating: 5, text: 'Kiran Beauty transformed my wedding day! The bridal makeup was absolutely stunning and lasted all day. I felt like a princess! Highly recommend to every bride.', avatar: 'P' },
  { name: 'Anita Patel', role: 'Regular Client', rating: 5, text: 'The best salon experience I\'ve ever had. The staff is professional, the ambience is luxurious, and the results are always amazing. Worth every rupee!', avatar: 'A' },
  { name: 'Sunita Verma', role: 'Academy Student', rating: 5, text: 'Enrolled in their makeup course and it completely changed my career! The trainers are world-class and the curriculum is industry-focused. Got placed within a month!', avatar: 'S' },
];

export default function Home() {
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const { services, fetchServices, isLoading } = useServiceStore();
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.05]);

  useEffect(() => {
    fetchServices({ featured: true, limit: 6 });
  }, []);

  useEffect(() => {
    // GSAP Hero animation
    const ctx = gsap.context(() => {
      gsap.from('.hero-badge', { opacity: 0, y: 30, duration: 0.8, delay: 0.3 });
      gsap.from('.hero-title', { opacity: 0, y: 50, duration: 1, delay: 0.5, ease: 'power3.out' });
      gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8, delay: 0.8 });
      gsap.from('.hero-actions', { opacity: 0, y: 30, duration: 0.8, delay: 1.0 });
      gsap.from('.hero-floating-card', {
        opacity: 0, scale: 0.8, stagger: 0.2, delay: 1.2, duration: 0.6, ease: 'back.out(1.7)',
      });
      gsap.from('.hero-orb', {
        opacity: 0, scale: 0, stagger: 0.15, duration: 1.5, delay: 0.2, ease: 'elastic.out(1, 0.5)',
      });

      // Stats counter animation
      if (statsRef.current) {
        gsap.from('.stat-item', {
          scrollTrigger: { trigger: statsRef.current, start: 'top 80%' },
          opacity: 0, y: 40, stagger: 0.15, duration: 0.7, ease: 'power2.out',
        });
      }

      // Category cards scroll animation
      gsap.from('.category-card', {
        scrollTrigger: { trigger: '.categories-grid', start: 'top 80%' },
        opacity: 0, y: 60, stagger: 0.1, duration: 0.6, ease: 'power2.out',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={heroRef}>
      <Helmet>
        <title>Kiran Beauty Salon & Academy | Premium Beauty Services</title>
        <meta name="description" content="Premium beauty salon and academy offering bridal makeup, hair styling, skin treatments, nail art, spa services and professional beauty courses." />
      </Helmet>

      {/* ===== HERO ===== */}
      <section className="hero">
        <motion.div className="hero-bg" style={{ scale: heroScale }}>
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }} />
            ))}
          </div>
        </motion.div>

        <div className="hero-overlay" />

        <motion.div className="hero-content" style={{ y: parallaxY }}>
          <div className="container">
            <div className="hero-inner">
              <div className="hero-badge">
                <GiFlowerTwirl className="badge-icon" />
                <span>Premium Beauty Salon & Academy</span>
                <GiFlowerTwirl className="badge-icon" />
              </div>

              <h1 className="hero-title">
                Discover Your
                <span className="hero-title-accent">
                  <br />True Beauty
                </span>
                <br />
                <em>Unleashed</em>
              </h1>

              <p className="hero-subtitle">
                Experience world-class beauty treatments by expert artists.
                From bridal transformations to everyday glamour — we make every moment magical.
              </p>

              <div className="hero-actions">
                <Link to="/book" className="btn btn-gold btn-lg">
                  <FiCalendar size={18} />
                  Book Appointment
                </Link>
                <Link to="/services" className="btn btn-ghost btn-lg">
                  Explore Services
                  <FiArrowRight size={18} />
                </Link>
              </div>

              <div className="hero-trust">
                <div className="trust-stars">
                  {[1, 2, 3, 4, 5].map((i) => <FiStar key={i} style={{ fill: '#f59e0b', color: '#f59e0b' }} />)}
                </div>
                <span>4.9/5 from 2,000+ reviews</span>
              </div>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="hero-floating-cards">
            <motion.div
              className="hero-floating-card card-1"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span>💄</span> <div><p>Bridal Special</p><p>Starting ₹5,000</p></div>
            </motion.div>
            <motion.div
              className="hero-floating-card card-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <span>⭐</span> <div><p>Top Rated</p><p>5000+ Clients</p></div>
            </motion.div>
            <motion.div
              className="hero-floating-card card-3"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <span>🎓</span> <div><p>Academy</p><p>Enroll Now</p></div>
            </motion.div>
          </div>
        </motion.div>

        <div className="hero-scroll-indicator">
          <motion.div
            className="scroll-dot"
            animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <div className="stat-emoji">{stat.icon}</div>
                <h3 className="stat-number">{stat.number}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section categories-section">
        <div className="container">
          <motion.div
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label" style={{ justifyContent: 'center' }}>Our Expertise</div>
            <h2 className="section-title">
              Services That <span className="text-gradient">Transform</span> You
            </h2>
            <p className="section-desc">
              From head to toe, we offer complete beauty solutions tailored just for you.
            </p>
          </motion.div>

          <div className="categories-grid">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/services?category=${cat.name.replace(' ', '')}`}
                className="category-card"
                style={{ '--cat-accent': cat.accent, '--cat-bg': cat.color }}
              >
                <div className="category-emoji">{cat.emoji}</div>
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-desc">{cat.desc}</p>
                <div className="category-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED SERVICES ===== */}
      <section className="section featured-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="section-label">✨ Top Picks</div>
                <h2 className="section-title">Featured <span className="text-gradient">Services</span></h2>
              </div>
              <Link to="/services" className="btn btn-outline">View All Services <FiArrowRight /></Link>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="services-skeleton grid-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 380, borderRadius: '1.5rem' }} />
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-3" style={{ marginTop: '2.5rem' }}>
              {services.map((s, i) => <ServiceCard key={s._id} service={s} index={i} />)}
            </div>
          ) : (
            <div className="empty-services">
              <p>🌸 Services coming soon! Please add services via the admin panel.</p>
              <Link to="/services" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Browse All Services
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section className="section why-section">
        <div className="container">
          <div className="why-grid">
            <motion.div
              className="why-image-side"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="why-image-card">
                <div className="why-image-emoji">🌟</div>
                <div className="why-image-badge">
                  <FiAward style={{ color: '#d4a843' }} />
                  <span>Award Winning Salon</span>
                </div>
              </div>
              <div className="why-image-stats">
                <div className="why-stat">
                  <span className="why-stat-num">15+</span>
                  <span>Years of Excellence</span>
                </div>
                <div className="why-stat">
                  <span className="why-stat-num">50+</span>
                  <span>Expert Artists</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="why-content"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="section-label">Why Choose Us</div>
              <h2 className="section-title">
                The <span className="text-gradient">Kiran</span> Difference
              </h2>
              <p style={{ color: 'var(--slate)', lineHeight: 1.8, margin: '1rem 0 2rem' }}>
                We blend artistry with expertise to deliver beauty experiences that go beyond expectations. Our team of certified professionals use only premium products and the latest techniques.
              </p>
              <div className="why-features">
                {[
                  { icon: '🏆', title: 'Expert Artists', desc: 'Internationally trained beauty professionals' },
                  { icon: '🌿', title: 'Premium Products', desc: 'Only certified, skin-safe luxury products' },
                  { icon: '✨', title: 'Hygienic Standards', desc: 'ISO-certified cleanliness protocols' },
                  { icon: '💝', title: 'Personalized Care', desc: 'Customized services for every client' },
                ].map((f, i) => (
                  <motion.div
                    key={f.title}
                    className="why-feature"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.4 }}
                  >
                    <div className="feature-icon-box">{f.icon}</div>
                    <div>
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link to="/about" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
                Learn More About Us <FiArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section testimonials-section">
        <div className="container">
          <motion.div
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-label" style={{ justifyContent: 'center' }}>💬 Client Stories</div>
            <h2 className="section-title">
              What Our <span className="text-gradient">Clients</span> Say
            </h2>
          </motion.div>
          <div className="testimonials-grid" style={{ marginTop: '2.5rem' }}>
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="testimonial-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -6 }}
              >
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, j) => (
                    <FiStar key={j} style={{ fill: '#f59e0b', color: '#f59e0b' }} size={14} />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.avatar}</div>
                  <div>
                    <p className="author-name">{t.name}</p>
                    <p className="author-role">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="cta-orb cta-orb-1" />
            <div className="cta-orb cta-orb-2" />
            <div className="cta-content">
              <h2 className="cta-title">
                Ready for Your <span className="text-gold">Beauty</span> Transformation?
              </h2>
              <p className="cta-desc">
                Book your appointment today and get 20% OFF your first visit!
              </p>
              <div className="cta-actions">
                <Link to="/book" className="btn btn-gold btn-lg">
                  <FiCalendar /> Book Appointment
                </Link>
                <a href="tel:+919876543210" className="btn btn-ghost btn-lg">
                  <FiPhone /> Call Us Now
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
