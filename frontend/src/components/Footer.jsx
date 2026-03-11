import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiInstagram, FiFacebook, FiYoutube, FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { GiFlowerTwirl } from 'react-icons/gi';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-wave" />
            <div className="footer-content">
                <div className="container">
                    <div className="footer-grid">
                        {/* Brand */}
                        <div className="footer-brand">
                            <Link to="/" className="footer-logo">
                                <GiFlowerTwirl className="footer-logo-icon" />
                                <div>
                                    <p className="footer-logo-name">Kiran Beauty</p>
                                    <p className="footer-logo-sub">Salon & Academy</p>
                                </div>
                            </Link>
                            <p className="footer-tagline">
                                Where beauty meets expertise. Transform yourself with our premium beauty services and professional courses.
                            </p>
                            <div className="footer-socials">
                                {[
                                    { Icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
                                    { Icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook' },
                                    { Icon: FiYoutube, href: 'https://youtube.com', label: 'YouTube' },
                                ].map(({ Icon, href, label }) => (
                                    <motion.a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link"
                                        aria-label={label}
                                        whileHover={{ scale: 1.15, y: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Icon size={18} />
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-col">
                            <h4 className="footer-col-title">Quick Links</h4>
                            <ul className="footer-links">
                                {[
                                    { name: 'Home', path: '/' },
                                    { name: 'Services', path: '/services' },
                                    { name: 'Gallery', path: '/gallery' },
                                    { name: 'Academy', path: '/academy' },
                                    { name: 'About Us', path: '/about' },
                                    { name: 'Contact', path: '/contact' },
                                ].map((l) => (
                                    <li key={l.path}>
                                        <Link to={l.path} className="footer-link">
                                            <span className="link-arrow">→</span> {l.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Services */}
                        <div className="footer-col">
                            <h4 className="footer-col-title">Our Services</h4>
                            <ul className="footer-links">
                                {['Bridal Makeup', 'Hair Styling', 'Skin Treatments', 'Nail Art', 'Facials & Spa', 'Beauty Academy'].map((s) => (
                                    <li key={s}>
                                        <Link to="/services" className="footer-link">
                                            <span className="link-arrow">→</span> {s}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="footer-col">
                            <h4 className="footer-col-title">Contact Us</h4>
                            <div className="footer-contact">
                                <div className="contact-item">
                                    <FiMapPin className="contact-icon" />
                                    <div>
                                        <p>Men Corner, Kaka Complex, New Kaka Complex</p>
                                        <p>Pithampur Industrial Area, Sagour Kuti</p>
                                        <p>Pithampur, Madhya Pradesh 454775</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <FiPhone className="contact-icon" />
                                    <div>
                                        <a href="tel:+916265175996">+91 6265175996</a>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <FiMail className="contact-icon" />
                                    <a href="mailto:info@kiranbeauty.com">info@kiranbeauty.com</a>
                                </div>
                                <div className="contact-item">
                                    <FiClock className="contact-icon" />
                                    <div>
                                        <p>Mon–Sat: 9:00 AM – 8:00 PM</p>
                                        <p>Sunday: 10:00 AM – 6:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <div className="footer-bottom-inner">
                        <p>© 2024 Kiran Beauty Salon & Academy. All rights reserved.</p>
                        <div className="footer-bottom-links">
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
