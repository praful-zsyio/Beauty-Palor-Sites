const { db } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = {
    // Create user
    create: async ({ name, email, phone, password, role = 'customer' }) => {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        try {
            const stmt = db.prepare(`
        INSERT INTO users (name, email, phone, password, role)
        VALUES (?, ?, ?, ?, ?)
      `);
            const result = stmt.run(name, email, phone || null, hashedPassword, role);
            return User.findById(result.lastInsertRowid);
        } catch (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                throw { code: 11000, keyValue: { email } };
            }
            throw err;
        }
    },

    findById: (id) => {
        return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    },

    findByEmail: (email) => {
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    },

    findAll: (limit = 50, offset = 0) => {
        return db.prepare('SELECT * FROM users WHERE role != ? LIMIT ? OFFSET ?').all('admin', limit, offset);
    },

    update: (id, fields) => {
        const keys = Object.keys(fields).filter(k => fields[k] !== undefined);
        if (keys.length === 0) return User.findById(id);
        const sets = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => fields[k]);
        db.prepare(`UPDATE users SET ${sets}, updated_at = strftime('%s','now') WHERE id = ?`).run(...values, id);
        return User.findById(id);
    },

    updatePassword: async (id, newPassword) => {
        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(newPassword, salt);
        db.prepare(`UPDATE users SET password = ?, updated_at = strftime('%s','now') WHERE id = ?`).run(hashed, id);
    },

    matchPassword: async (inputPassword, storedHash) => {
        return await bcrypt.compare(inputPassword, storedHash);
    },

    getSignedJwtToken: (user) => {
        return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '30d',
        });
    },

    safeUser: (user) => {
        if (!user) return null;
        const { password, reset_token, reset_expires, ...safe } = user;
        return safe;
    },
};

module.exports = User;
