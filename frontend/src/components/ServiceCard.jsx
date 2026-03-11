import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiClock, FiStar, FiArrowRight } from 'react-icons/fi';
import { BiRupee } from 'react-icons/bi';
import './ServiceCard.css';

const categoryColors = {
    Hair: { bg: '#fdf2f8', accent: '#ec4899', text: '#be185d' },
    Skin: { bg: '#fff7ed', accent: '#f97316', text: '#c2410c' },
    Nails: { bg: '#f0fdf4', accent: '#22c55e', text: '#166534' },
    Makeup: { bg: '#fff1f2', accent: '#f43f5e', text: '#be123c' },
    Spa: { bg: '#f0f9ff', accent: '#0ea5e9', text: '#075985' },
    Bridal: { bg: '#fef9e7', accent: '#d4a843', text: '#92400e' },
    Academy: { bg: '#f5f3ff', accent: '#8b5cf6', text: '#5b21b6' },
};

export default function ServiceCard({ service, index = 0 }) {
    const colors = categoryColors[service.category] || categoryColors.Other || { bg: '#f8fafc', accent: '#64748b', text: '#334155' };
    const discount = service.discountedPrice && service.discountedPrice < service.price;
    const discountPct = discount ? Math.round(((service.price - service.discountedPrice) / service.price) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            whileHover={{ y: -8 }}
            className="service-card"
        >
            <div className="service-card-image">
                {service.thumbnail ? (
                    <img src={service.thumbnail} alt={service.name} loading="lazy" />
                ) : (
                    <div className="service-card-placeholder" style={{ background: colors.bg }}>
                        <span style={{ fontSize: '3rem' }}>
                            {service.category === 'Hair' ? '💇' : service.category === 'Skin' ? '✨' :
                                service.category === 'Nails' ? '💅' : service.category === 'Makeup' ? '💄' :
                                    service.category === 'Bridal' ? '👰' : service.category === 'Spa' ? '🧖' : '🌸'}
                        </span>
                    </div>
                )}
                <div className="service-card-badges">
                    <span className="svc-badge" style={{ background: colors.bg, color: colors.text }}>
                        {service.category}
                    </span>
                    {discount && (
                        <span className="svc-badge" style={{ background: '#fef2f2', color: '#dc2626' }}>
                            -{discountPct}%
                        </span>
                    )}
                    {service.isFeatured && (
                        <span className="svc-badge" style={{ background: '#fef9e7', color: '#92400e' }}>
                            ⭐ Featured
                        </span>
                    )}
                </div>
            </div>

            <div className="service-card-body">
                <h3 className="service-card-title">{service.name}</h3>
                <p className="service-card-desc">{service.shortDescription || service.description?.slice(0, 80) + '...'}</p>

                <div className="service-card-meta">
                    <span className="svc-rating">
                        <FiStar size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        {service.ratings?.toFixed(1) || '5.0'} ({service.numReviews || 0})
                    </span>
                    <span className="svc-duration">
                        <FiClock size={13} style={{ color: colors.accent }} />
                        {service.duration} min
                    </span>
                </div>

                <div className="service-card-footer">
                    <div className="service-price">
                        {discount && (
                            <span className="price-original">₹{service.price.toLocaleString()}</span>
                        )}
                        <span className="price-main">₹{(service.discountedPrice || service.price).toLocaleString()}</span>
                    </div>
                    <Link to={`/services/${service._id}`} className="btn btn-primary btn-sm service-btn">
                        View <FiArrowRight size={13} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
