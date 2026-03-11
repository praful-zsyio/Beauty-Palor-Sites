const { db } = require('../config/db');

// Helper to parse JSON fields
const parseService = (s) => {
    if (!s) return null;
    return {
        ...s,
        _id: s.id,
        features: JSON.parse(s.features || '[]'),
        includes: JSON.parse(s.includes || '[]'),
        tags: JSON.parse(s.tags || '[]'),
        available_time_slots: JSON.parse(s.available_time_slots || '[]'),
        isFeatured: !!s.is_featured,
        isPopular: !!s.is_popular,
        isActive: !!s.is_active,
        discountedPrice: s.discounted_price,
        shortDescription: s.short_description,
    };
};

const Service = {
    findAll: ({ category, minPrice, maxPrice, search, sort, page = 1, limit = 12, featured, popular } = {}) => {
        let where = ['is_active = 1'];
        let params = [];

        if (category && category !== 'All') { where.push('category = ?'); params.push(category); }
        if (featured === 'true') { where.push('is_featured = 1'); }
        if (popular === 'true') { where.push('is_popular = 1'); }
        if (minPrice) { where.push('price >= ?'); params.push(Number(minPrice)); }
        if (maxPrice) { where.push('price <= ?'); params.push(Number(maxPrice)); }
        if (search) { where.push('(name LIKE ? OR description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

        const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';

        let orderBy = 'sort_order ASC';
        if (sort === 'price_asc') orderBy = 'price ASC';
        else if (sort === 'price_desc') orderBy = 'price DESC';
        else if (sort === 'rating') orderBy = 'ratings DESC';
        else if (sort === 'popular') orderBy = 'num_reviews DESC';

        const offset = (Number(page) - 1) * Number(limit);
        const total = db.prepare(`SELECT COUNT(*) as count FROM services ${whereStr}`).get(...params).count;
        const services = db.prepare(`SELECT * FROM services ${whereStr} ORDER BY ${orderBy} LIMIT ? OFFSET ?`).all(...params, Number(limit), offset);

        return {
            services: services.map(parseService),
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
        };
    },

    findById: (id) => {
        const s = db.prepare('SELECT * FROM services WHERE id = ? AND is_active = 1').get(id);
        if (!s) return null;
        const reviews = db.prepare('SELECT * FROM reviews WHERE service_id = ? ORDER BY created_at DESC LIMIT 20').all(id);
        return { ...parseService(s), reviews };
    },

    create: ({ name, description, short_description, category, price, discounted_price, duration, thumbnail, features, includes, tags, is_featured, is_popular, sort_order }) => {
        const stmt = db.prepare(`
      INSERT INTO services (name, description, short_description, category, price, discounted_price, duration, thumbnail, features, includes, tags, is_featured, is_popular, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(
            name, description, short_description || null, category, price,
            discounted_price || null, duration, thumbnail || '',
            JSON.stringify(features || []), JSON.stringify(includes || []),
            JSON.stringify(tags || []), is_featured ? 1 : 0, is_popular ? 1 : 0, sort_order || 0
        );
        return Service.findById(result.lastInsertRowid);
    },

    update: (id, fields) => {
        const map = {
            name: 'name', description: 'description', short_description: 'short_description',
            category: 'category', price: 'price', discounted_price: 'discounted_price',
            duration: 'duration', thumbnail: 'thumbnail', is_featured: 'is_featured',
            is_popular: 'is_popular', sort_order: 'sort_order', is_active: 'is_active',
        };
        const keys = Object.keys(fields).filter(k => map[k] !== undefined);
        if (keys.length === 0) return Service.findById(id);
        const sets = keys.map(k => `${map[k]} = ?`).join(', ');
        const values = keys.map(k => fields[k]);
        db.prepare(`UPDATE services SET ${sets}, updated_at = strftime('%s','now') WHERE id = ?`).run(...values, id);
        return Service.findById(id);
    },

    deactivate: (id) => {
        db.prepare(`UPDATE services SET is_active = 0, updated_at = strftime('%s','now') WHERE id = ?`).run(id);
    },

    addReview: (serviceId, userId, name, rating, comment) => {
        // Check existing review
        const existing = db.prepare('SELECT id FROM reviews WHERE service_id = ? AND user_id = ?').get(serviceId, userId);
        if (existing) throw new Error('Already reviewed');

        db.prepare('INSERT INTO reviews (service_id, user_id, name, rating, comment) VALUES (?, ?, ?, ?, ?)').run(serviceId, userId, name, rating, comment || null);

        // Update service rating
        const avg = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE service_id = ?').get(serviceId);
        db.prepare('UPDATE services SET ratings = ?, num_reviews = ? WHERE id = ?').run(avg.avg, avg.cnt, serviceId);
    },

    getCategories: () => {
        return db.prepare(`
      SELECT category as _id, COUNT(*) as count, AVG(price) as avgPrice
      FROM services WHERE is_active = 1
      GROUP BY category ORDER BY count DESC
    `).all();
    },
};

module.exports = Service;
