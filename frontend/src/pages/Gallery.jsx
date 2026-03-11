import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import './Gallery.css';

const salonPhotos = [
    "https://lh3.googleusercontent.com/gps-cs-s/AHVAweq_u4tUoYTwEWbRE0j4TA97rg2Os3aFmYsNbwMNAGmjqFjjfH8chl4NUnNgCBO3o7-i_2PKw9L1mxJD05NQ9bsqKhqouFbScQJnHejwVilpKeKbPfqVXs0ntSuuJdrQH8uZVxpgHA=w600",
    "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerAUmjoSaqvUgMC1xr376dFsIsopLDN13cKdexrhzD0puxgNRzZmUje23IlghrsvW1sxtEh2sNCHmkvEhn_WKCajfOVCllHdXt4mgN19N8yydRlIIaBzwNzu1q9oapENw2qCA=w600",
    "https://lh3.googleusercontent.com/gps-cs-s/AHVAweogxT3Zc-AQu7LEUlJen2LGv-2DYzU9xCJNkminKij8Lofex2seIjOr72dZPuqL7ODUFChmqnNUytmGgbUa4p8EZXjPdnX_u9xQQC8So39OX4HKG2WERTcCE7zdU4hBaR9Bn6tn6g=w600",
    "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoUSc0QDStJX3_BABP9h1ERJ39Q0zhEfRcw41vrBiUa9CC-CbHLp1xamXrQeV2nnV4p79AhC26hQ2394C_KBDId6kL-YdVdSVODMD0SM9HWkWupyvwr7hqw8a9AmUhKNZx83OTn=w600",
];

const galleryItems = [
    { id: 1, category: 'Bridal', title: 'Elegant Bridal Look', emoji: '👰', color: '#fef9e7' },
    { id: 2, category: 'Hair', title: 'Balayage Highlights', emoji: '💇', color: '#fdf2f8' },
    { id: 3, category: 'Makeup', title: 'Party Glam Makeup', emoji: '💄', color: '#fff1f2' },
    { id: 4, category: 'Nails', title: 'Floral Nail Art', emoji: '💅', color: '#f0fdf4' },
    { id: 5, category: 'Skin', title: 'Hydra Facial Glow', emoji: '✨', color: '#fff7ed' },
    { id: 6, category: 'Bridal', title: 'Traditional Bridal', emoji: '🌸', color: '#fef9e7' },
    { id: 7, category: 'Hair', title: 'Keratin Treatment', emoji: '💇', color: '#fdf2f8' },
    { id: 8, category: 'Makeup', title: 'Engagement Makeup', emoji: '💍', color: '#fff1f2' },
    { id: 9, category: 'Nails', title: 'French Tip Design', emoji: '💅', color: '#f0fdf4' },
    { id: 10, category: 'Skin', title: 'Anti-Aging Facial', emoji: '✨', color: '#fff7ed' },
    { id: 11, category: 'Bridal', title: 'Mehendi Ceremony', emoji: '🌿', color: '#fef9e7' },
    { id: 12, category: 'Hair', title: 'Hair Coloring', emoji: '🎨', color: '#fdf2f8' },
];

const CATS = ['All', 'Bridal', 'Hair', 'Makeup', 'Nails', 'Skin'];

export default function Gallery() {
    const [activecat, setActiveCat] = useState('All');
    const filtered = activecat === 'All' ? galleryItems : galleryItems.filter(g => g.category === activecat);

    return (
        <div>
            <Helmet>
                <title>Gallery | Kiran Beauty Salon &amp; Academy</title>
                <meta name="description" content="Browse our stunning portfolio of bridal looks, hair transformations, makeup artistry, and nail designs at Kiran Beauty Salon & Academy, Pithampur." />
            </Helmet>

            <section className="page-hero">
                <div className="page-hero-bg" />
                <div className="container">
                    <motion.div className="page-hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="section-label" style={{ justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}>Our Work</div>
                        <h1 className="page-hero-title">Beauty <span className="text-gold">Gallery</span></h1>
                        <p className="page-hero-desc">A showcase of our finest beauty transformations and artistry</p>
                    </motion.div>
                </div>
            </section>

            {/* ── Real Salon Photos Section ── */}
            <section className="salon-photos-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '2.5rem' }}
                    >
                        <div className="section-label" style={{ justifyContent: 'center' }}>Inside Our Salon</div>
                        <h2 className="section-title">Our Salon <span className="text-gradient">Gallery</span></h2>
                        <p style={{ color: 'var(--slate)', maxWidth: '520px', margin: '0.75rem auto 0' }}>
                            Step inside Kiran Beauty Salon &amp; Academy — where every corner is crafted for your comfort and beauty.
                        </p>
                    </motion.div>

                    <div className="salon-photo-grid">
                        {salonPhotos.map((src, index) => (
                            <motion.div
                                key={index}
                                className="salon-photo-item"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: index * 0.1 }}
                                whileHover={{ scale: 1.03 }}
                            >
                                <img src={src} alt={`Kiran Beauty Salon - Photo ${index + 1}`} loading="lazy" />
                                <div className="salon-photo-overlay">
                                    <span>Kiran Beauty Salon &amp; Academy</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Category Portfolio Grid ── */}
            <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginBottom: '2rem' }}
                >
                    <div className="section-label" style={{ justifyContent: 'center' }}>Our Portfolio</div>
                    <h2 className="section-title">Browse by <span className="text-gradient">Category</span></h2>
                </motion.div>

                <div className="category-pills" style={{ justifyContent: 'center', marginBottom: '2.5rem' }}>
                    {CATS.map((c) => (
                        <motion.button key={c} className={`category-pill ${activecat === c ? 'active' : ''}`}
                            onClick={() => setActiveCat(c)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            {c}
                        </motion.button>
                    ))}
                </div>

                <motion.div className="gallery-grid" layout>
                    <AnimatePresence>
                        {filtered.map((item, i) => (
                            <motion.div key={item.id} className="gallery-item"
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.35, delay: i * 0.04 }}
                                whileHover={{ scale: 1.03 }}
                                style={{ background: item.color }}
                            >
                                <div className="gallery-item-inner">
                                    <div className="gallery-emoji">{item.emoji}</div>
                                    <div className="gallery-overlay">
                                        <span className="gallery-cat">{item.category}</span>
                                        <p className="gallery-title">{item.title}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
