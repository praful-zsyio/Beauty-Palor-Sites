const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'kiran_beauty.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ===== INITIALIZE TABLES =====
const initDB = () => {
    // Users Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin', 'staff')),
      avatar TEXT,
      is_verified INTEGER DEFAULT 0,
      loyalty_points INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      street TEXT, city TEXT, state TEXT, pincode TEXT,
      reset_token TEXT,
      reset_expires INTEGER,
      created_at INTEGER DEFAULT (strftime('%s','now')),
      updated_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

    // Services Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT,
      category TEXT NOT NULL DEFAULT 'Other' CHECK(category IN ('Hair','Skin','Nails','Makeup','Spa','Bridal','Academy','Other')),
      sub_category TEXT,
      price REAL NOT NULL,
      discounted_price REAL,
      duration INTEGER NOT NULL,
      thumbnail TEXT DEFAULT '',
      features TEXT DEFAULT '[]',
      includes TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      available_time_slots TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      is_popular INTEGER DEFAULT 0,
      ratings REAL DEFAULT 0,
      num_reviews INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s','now')),
      updated_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

    // Reviews Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

    // Appointments Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      staff_id INTEGER REFERENCES users(id),
      date INTEGER NOT NULL,
      time_slot TEXT NOT NULL,
      end_time TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','in-progress','completed','cancelled','no-show')),
      notes TEXT,
      special_requests TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      -- Payment
      amount REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash','card','upi','net-banking','stripe')),
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending','paid','failed','refunded')),
      transaction_id TEXT,
      paid_at INTEGER,
      -- Cancellation
      cancel_reason TEXT,
      cancelled_by TEXT,
      cancelled_at INTEGER,
      refund_amount REAL,
      refund_status TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now')),
      updated_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

    // Gallery Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image TEXT NOT NULL,
      category TEXT,
      is_featured INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      created_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

    // Testimonials Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      name TEXT NOT NULL,
      review TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      service TEXT,
      image TEXT,
      is_approved INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

    // Courses Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      duration TEXT,
      fee REAL,
      syllabus TEXT DEFAULT '[]',
      certificate INTEGER DEFAULT 1,
      mode TEXT DEFAULT 'offline' CHECK(mode IN ('offline','online','hybrid')),
      image TEXT,
      is_active INTEGER DEFAULT 1,
      intake TEXT,
      eligibility TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    )
  `);

    console.log('✅ SQLite database initialized successfully');

    // Seed default admin if no users exist
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
        const bcrypt = require('bcryptjs');
        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync('admin123', salt);
        db.prepare(`
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        `).run('Admin', 'admin@kiran.com', hashedPassword, 'admin');
        console.log('👤 Default Admin Created: admin@kiran.com / admin123');
    }
};

// Helper: generate appointment ID
const generateAppointmentId = () => {
    return `KBS-${Date.now().toString(36).toUpperCase()}`;
};

initDB();

module.exports = { db, generateAppointmentId };
