import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiCalendar, FiChevronDown } from 'react-icons/fi';
import { GiFlowerTwirl } from 'react-icons/gi';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import './Navbar.css';

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Academy', path: '/academy' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileOpen(false);
        setIsUserMenuOpen(false);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const isHome = location.pathname === '/';

    return (
        <motion.nav
            className={`navbar ${isScrolled || !isHome ? 'scrolled' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="nav-container">
                {/* Logo */}
                <Link to="/" className="nav-logo">
                    <GiFlowerTwirl className="logo-icon" />
                    <div className="logo-text">
                        <span className="logo-name">Kiran</span>
                        <span className="logo-sub">Beauty & Academy</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <ul className="nav-links">
                    {navLinks.map((link) => (
                        <li key={link.path}>
                            <NavLink
                                to={link.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                {link.name}
                                <span className="nav-link-line" />
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Actions */}
                <div className="nav-actions">
                    <Link to="/book" className="btn btn-primary btn-sm">
                        <FiCalendar size={14} />
                        Book Now
                    </Link>

                    {user ? (
                        <div className="user-menu" ref={userMenuRef}>
                            <button
                                className="user-trigger"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <div className="user-avatar">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <FiChevronDown
                                    size={14}
                                    style={{
                                        transform: isUserMenuOpen ? 'rotate(180deg)' : 'none',
                                        transition: 'transform 0.3s',
                                    }}
                                />
                            </button>
                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        className="user-dropdown"
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="user-info">
                                            <p className="user-name">{user.name}</p>
                                            <p className="user-email">{user.email}</p>
                                        </div>
                                        <Link to="/dashboard" className="dropdown-item">
                                            <FiUser size={15} /> My Dashboard
                                        </Link>
                                        <Link to="/book" className="dropdown-item">
                                            <FiCalendar size={15} /> Book Appointment
                                        </Link>
                                        <button className="dropdown-item danger" onClick={handleLogout}>
                                            <FiLogOut size={15} /> Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-outline btn-sm">
                            Sign In
                        </Link>
                    )}

                    {/* Mobile Toggle */}
                    <button
                        className="mobile-toggle"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {navLinks.map((link, i) => (
                            <motion.div
                                key={link.path}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <NavLink
                                    to={link.path}
                                    className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
                                >
                                    {link.name}
                                </NavLink>
                            </motion.div>
                        ))}
                        <div className="mobile-actions">
                            <Link to="/book" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                <FiCalendar size={15} /> Book Now
                            </Link>
                            {!user && (
                                <Link to="/login" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                                    Sign In
                                </Link>
                            )}
                            {user && (
                                <button className="btn btn-outline" onClick={handleLogout} style={{ width: '100%' }}>
                                    <FiLogOut size={15} /> Sign Out
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
