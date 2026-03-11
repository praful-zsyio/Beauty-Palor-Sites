import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiStar, FiCalendar, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useServiceStore, useAuthStore } from '../store';
import './ServiceDetail.css';

export default function ServiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { service, fetchService, isLoading } = useServiceStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('about');

    useEffect(() => { fetchService(id); }, [id]);

    if (isLoading) return (
        <div style={{ padding: '10rem 0', textAlign: 'center' }}>
            <div className="skeleton" style={{ width: '100%', maxWidth: 900, height: 500, margin: '0 auto', borderRadius: '1.5rem' }} />
        </div>
    );

    if (!service) return (
        <div style={{ padding: '10rem', textAlign: 'center' }}>
            <h2>Service not found</h2>
            <Link to="/services" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Services</Link>
        </div>
    );

    const discount = service.discountedPrice && service.discountedPrice < service.price;

    return (
        <div className="service-detail-page">
            <Helmet>
                <title>{service.name} | Kiran Beauty Salon</title>
                <meta name="description" content={service.shortDescription || service.description?.slice(0, 155)} />
            </Helmet>

            {/* Back */}
            <div className="container" style={{ paddingTop: '7rem' }}>
                <button onClick={() => navigate(-1)} className="back-btn">
                    <FiArrowLeft /> Back to Services
                </button>

                <div className="detail-grid">
                    {/* Image */}
                    <motion.div
                        className="detail-image-wrap"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="detail-image">
                            {service.thumbnail ? (
                                <img src={service.thumbnail} alt={service.name} />
                            ) : (
                                <div className="detail-image-placeholder">
                                    <span>{service.category === 'Hair' ? '💇' : service.category === 'Skin' ? '✨' : service.category === 'Nails' ? '💅' : service.category === 'Makeup' ? '💄' : service.category === 'Bridal' ? '👰' : '🌸'}</span>
                                </div>
                            )}
                            {discount && (
                                <div className="detail-discount-badge">
                                    {Math.round(((service.price - service.discountedPrice) / service.price) * 100)}% OFF
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        className="detail-info"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <div className="detail-badges">
                            <span className="badge badge-rose">{service.category}</span>
                            {service.isFeatured && <span className="badge badge-gold">⭐ Featured</span>}
                            {service.isPopular && <span className="badge badge-rose">🔥 Popular</span>}
                        </div>
                        <h1 className="detail-title">{service.name}</h1>

                        <div className="detail-meta">
                            <div className="meta-item">
                                <FiStar style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                                <strong>{service.ratings?.toFixed(1) || '5.0'}</strong>
                                <span>({service.numReviews || 0} reviews)</span>
                            </div>
                            <div className="meta-item">
                                <FiClock style={{ color: 'var(--rose-500)' }} />
                                <span>{service.duration} minutes</span>
                            </div>
                        </div>

                        <div className="detail-price">
                            {discount && <span className="price-old">₹{service.price.toLocaleString()}</span>}
                            <span className="price-current">₹{(service.discountedPrice || service.price).toLocaleString()}</span>
                            {discount && <span className="price-save">Save ₹{(service.price - service.discountedPrice).toLocaleString()}</span>}
                        </div>

                        {/* Tabs */}
                        <div className="detail-tabs">
                            {['about', 'includes', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`detail-tab ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'about' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <p className="detail-desc">{service.description}</p>
                                {service.features?.length > 0 && (
                                    <ul className="detail-features">
                                        {service.features.map((f, i) => (
                                            <li key={i}><FiCheck style={{ color: 'var(--rose-500)' }} /> {f}</li>
                                        ))}
                                    </ul>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'includes' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {service.includes?.length > 0 ? (
                                    <ul className="detail-features">
                                        {service.includes.map((inc, i) => (
                                            <li key={i}><FiCheck style={{ color: '#22c55e' }} /> {inc}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ color: 'var(--slate)' }}>No additional details available.</p>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'reviews' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {service.reviews?.length > 0 ? (
                                    <div className="reviews-list">
                                        {service.reviews.map((r, i) => (
                                            <div key={i} className="review-item">
                                                <div className="review-avatar">{r.name?.charAt(0)}</div>
                                                <div>
                                                    <p className="review-name">{r.name}</p>
                                                    <div className="stars">
                                                        {[...Array(5)].map((_, j) => (
                                                            <FiStar key={j} size={12} style={{ fill: j < r.rating ? '#f59e0b' : 'none', color: j < r.rating ? '#f59e0b' : '#d1d5db' }} />
                                                        ))}
                                                    </div>
                                                    <p className="review-comment">{r.comment}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--slate)' }}>No reviews yet. Be the first to review!</p>
                                )}
                            </motion.div>
                        )}

                        <div className="detail-actions">
                            <Link
                                to={user ? `/book/${service._id}` : '/login'}
                                className="btn btn-primary btn-lg"
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                <FiCalendar /> Book Now
                            </Link>
                            <Link to="/contact" className="btn btn-outline btn-lg">Enquire</Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
