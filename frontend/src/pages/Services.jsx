import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiX } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useServiceStore } from '../store';
import ServiceCard from '../components/ServiceCard';
import './Services.css';

const CATEGORIES = ['All', 'Hair', 'Skin', 'Nails', 'Makeup', 'Spa', 'Bridal', 'Academy'];
const SORT_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'popular', label: 'Most Popular' },
];

export default function Services() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [localSearch, setLocalSearch] = useState('');
    const { services, fetchServices, isLoading, pagination } = useServiceStore();

    const category = searchParams.get('category') || 'All';
    const sort = searchParams.get('sort') || '';
    const page = Number(searchParams.get('page') || 1);
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    useEffect(() => {
        const params = { page, limit: 12 };
        if (category && category !== 'All') params.category = category;
        if (sort) params.sort = sort;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (localSearch) params.search = localSearch;
        fetchServices(params);
    }, [category, sort, page, minPrice, maxPrice]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { page: 1, limit: 12 };
        if (category !== 'All') params.category = category;
        if (sort) params.sort = sort;
        if (localSearch) params.search = localSearch;
        fetchServices(params);
    };

    const updateParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setLocalSearch('');
        setSearchParams({});
    };

    const hasFilters = category !== 'All' || sort || minPrice || maxPrice || localSearch;

    return (
        <div className="services-page">
            <Helmet>
                <title>Our Services | Kiran Beauty Salon & Academy</title>
                <meta name="description" content="Browse our full range of beauty services including hair, skin, nails, makeup, bridal, spa and academy courses." />
            </Helmet>

            {/* Page Header */}
            <section className="page-hero">
                <div className="page-hero-bg" />
                <div className="container">
                    <motion.div
                        className="page-hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="section-label" style={{ justifyContent: 'center', color: 'rgba(255,255,255,0.8)' }}>
                            Transform Yourself
                        </p>
                        <h1 className="page-hero-title">Our <span className="text-gold">Services</span></h1>
                        <p className="page-hero-desc">
                            Explore our comprehensive range of premium beauty services — crafted with expertise and passion
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container">
                {/* Search + Controls */}
                <div className="services-controls">
                    <form className="search-bar" onSubmit={handleSearch}>
                        <FiSearch size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="search-input"
                        />
                        {localSearch && (
                            <button type="button" onClick={() => setLocalSearch('')} className="search-clear">
                                <FiX size={16} />
                            </button>
                        )}
                    </form>

                    <div className="controls-right">
                        <select
                            className="sort-select form-control"
                            value={sort}
                            onChange={(e) => updateParam('sort', e.target.value)}
                            style={{ width: 'auto', padding: '0.6rem 1rem' }}
                        >
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>

                        <button
                            className={`btn btn-outline btn-sm ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FiFilter size={15} /> Filters
                        </button>

                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            ><FiGrid size={16} /></button>
                            <button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            ><FiList size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            className="filter-panel"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="filter-group">
                                <label className="form-label">Price Range</label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="number" placeholder="Min ₹" className="form-control"
                                        value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)}
                                        style={{ maxWidth: 120 }}
                                    />
                                    <span>—</span>
                                    <input
                                        type="number" placeholder="Max ₹" className="form-control"
                                        value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)}
                                        style={{ maxWidth: 120 }}
                                    />
                                </div>
                            </div>
                            {hasFilters && (
                                <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                                    <FiX size={14} /> Clear All Filters
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Category Pills */}
                <div className="category-pills">
                    {CATEGORIES.map((cat) => (
                        <motion.button
                            key={cat}
                            className={`category-pill ${category === cat ? 'active' : ''}`}
                            onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </div>

                {/* Results count */}
                {pagination.total !== undefined && (
                    <p className="results-count">
                        Showing <strong>{services.length}</strong> of <strong>{pagination.total}</strong> services
                        {category !== 'All' && ` in "${category}"`}
                    </p>
                )}

                {/* Services Grid */}
                {isLoading ? (
                    <div className={`services-grid ${viewMode}`}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: viewMode === 'grid' ? 380 : 120, borderRadius: '1.25rem' }} />
                        ))}
                    </div>
                ) : services.length > 0 ? (
                    <motion.div
                        className={`services-grid ${viewMode}`}
                        layout
                    >
                        {services.map((s, i) => <ServiceCard key={s._id} service={s} index={i} />)}
                    </motion.div>
                ) : (
                    <motion.div
                        className="no-results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="no-results-icon">🔍</div>
                        <h3>No services found</h3>
                        <p>Try adjusting your search or filters</p>
                        <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
                    </motion.div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="pagination">
                        {[...Array(pagination.totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                                onClick={() => updateParam('page', i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
