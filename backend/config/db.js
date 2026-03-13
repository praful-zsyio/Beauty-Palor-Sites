const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const appRoot = path.resolve(__dirname, '..');
const dataDir = path.join(appRoot, 'data');
try {
    if (!fs.existsSync(dataDir)) {
        console.log('📁 Creating data directory:', dataDir);
        fs.mkdirSync(dataDir, { recursive: true });
    }
} catch (err) {
    console.error('❌ Failed to create data directory:', err.message);
}

const dbPath = path.join(dataDir, 'kiran_beauty.db');
console.log('💾 Database path:', dbPath);

let db;
try {
    db = new Database(dbPath, { 
        verbose: process.env.NODE_ENV === 'development' ? console.log : null,
        fileMustExist: false
    });
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    console.log('✅ SQLite Database Connected');
} catch (err) {
    console.error('❌ SQLite Connection Error:', err.message);
    process.exit(1); // Exit with code 1 if DB fails to connect
}

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

    // Seed services if none exist (and seeding not disabled)
    const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get().count;
    if (serviceCount === 0 && process.env.SKIP_SEEDING !== 'true') {
        const insertService = db.prepare(`
            INSERT INTO services (name, description, short_description, category, price, discounted_price, duration, thumbnail, features, includes, tags, is_featured, is_popular, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const services = [
            // HAIR
            ['Hair Cut & Styling', 'Professional haircut and styling by our expert stylists. Get a fresh new look with our precision cuts tailored to your face shape and lifestyle.', 'Expert cut + blow dry', 'Hair', 500, 450, 45, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', JSON.stringify(['Wash & Condition', 'Precision Cut', 'Blow Dry', 'Style Finish']), JSON.stringify(['Free Head Massage']), JSON.stringify(['haircut', 'styling', 'blowdry']), 1, 1, 1],
            ['Hair Coloring & Highlights', 'Transform your look with vibrant hair color or subtle highlights. We use premium, ammonia-free colors for a healthy shine.', 'Vibrant, long-lasting color', 'Hair', 2000, 1800, 120, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', JSON.stringify(['Color Consultation', 'Patch Test', 'Color Application', 'Deep Conditioning']), JSON.stringify(['Complimentary Toner', 'Color Protection Serum']), JSON.stringify(['hair color', 'highlights', 'balayage']), 1, 1, 2],
            ['Keratin Smoothing Treatment', 'Eliminate frizz and restore shine with our professional keratin treatment. Enjoy smooth, manageable hair for up to 6 months.', 'Frizz-free hair for 6 months', 'Hair', 4500, 4000, 180, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', JSON.stringify(['Clarifying Shampoo', 'Keratin Application', 'Flat Iron Sealing', 'After-care Kit']), JSON.stringify(['Free Deep Conditioning', 'Keratin Shampoo Sample']), JSON.stringify(['keratin', 'smoothing', 'anti-frizz']), 0, 1, 3],
            ['Bridal Hair Styling', 'Look breathtaking on your big day with our signature bridal hair styling. Includes trial session and wedding day service.', 'Perfect bridal look for your big day', 'Hair', 3500, 3000, 120, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', JSON.stringify(['Hair Trial Session', 'Updo / Half-up Style', 'Accessories Pinning', 'Final Touch-up']), JSON.stringify(['Free Veil Pinning', 'Hair Accessories Kit']), JSON.stringify(['bridal', 'wedding', 'updo']), 1, 0, 4],

            // SKIN
            ['Classic Facial', 'Revitalize your skin with our signature classic facial. Deep cleansing, exfoliation, and hydration for a glowing complexion.', 'Deep cleanse & hydration glow', 'Skin', 1200, 999, 60, 'https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?w=800', JSON.stringify(['Deep Cleansing', 'Steam', 'Exfoliation', 'Mask & Moisturization']), JSON.stringify(['Free Face Massage', 'Toner Application']), JSON.stringify(['facial', 'skincare', 'glow']), 1, 1, 5],
            ['Anti-Aging Treatment', 'Turn back the clock with our advanced anti-aging facial. Targets fine lines, wrinkles, and loss of elasticity for youthful skin.', 'Reduce fine lines & look younger', 'Skin', 3500, 3000, 90, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', JSON.stringify(['Skin Analysis', 'Collagen Infusion', 'Microcurrent Therapy', 'Eye Treatment']), JSON.stringify(['Free Serum Application', 'Sunscreen']), JSON.stringify(['anti-aging', 'wrinkles', 'collagen']), 1, 0, 6],
            ['Acne Treatment Facial', 'Targeted treatment for acne-prone skin. Reduces breakouts, controls sebum, and calms inflammation for clearer skin.', 'Clear skin & reduced breakouts', 'Skin', 1800, 1500, 75, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800', JSON.stringify(['Deep Pore Cleansing', 'Extraction', 'LED Light Therapy', 'Soothing Mask']), JSON.stringify(['Free Spot Treatment', 'Acne Gel Sample']), JSON.stringify(['acne', 'pimples', 'clear skin']), 0, 1, 7],

            // NAILS
            ['Manicure & Nail Art', 'Treat your hands to a luxurious manicure with your choice of stunning nail art designs by our skilled nail artists.', 'Beautiful nails with custom art', 'Nails', 800, 699, 60, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800', JSON.stringify(['Nail Shaping', 'Cuticle Care', 'Base & Top Coat', 'Custom Nail Art']), JSON.stringify(['Free Hand Massage', 'Nail Oil']), JSON.stringify(['manicure', 'nail art', 'gel nails']), 0, 1, 8],
            ['Gel Pedicure', 'Pamper your feet with our luxurious gel pedicure. Long-lasting color with foot scrub, massage, and moisturization included.', 'Soft, beautiful feet with gel color', 'Nails', 1200, 999, 75, 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800', JSON.stringify(['Foot Soak', 'Scrub & Exfoliation', 'Nail Shaping', 'Gel Polish Application']), JSON.stringify(['Free Foot Massage', 'Paraffin Wax Dip']), JSON.stringify(['pedicure', 'gel nails', 'foot care']), 0, 1, 9],

            // MAKEUP
            ['Party Makeup', 'Get party-ready with our glamorous makeup look. From subtle elegance to bold dramatic — we create what you envision.', 'Glamorous look for any event', 'Makeup', 2000, 1800, 60, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800', JSON.stringify(['Skin Prep', 'Foundation & Contouring', 'Eye Makeup', 'Lip & Setting Spray']), JSON.stringify(['Free Lashes', 'Touch-up Kit']), JSON.stringify(['makeup', 'party', 'glam']), 0, 1, 10],
            ['Bridal Makeup', 'Look absolutely stunning on your wedding day with our professional bridal makeup. Includes HD makeup, airbrush finish, and long-lasting formula.', 'Flawless HD bridal look', 'Makeup', 8000, 7000, 150, 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800', JSON.stringify(['Skin Prep & Primer', 'HD Foundation', 'Contouring & Highlighting', 'Eye & Lip Makeup', 'Setting & Finishing']), JSON.stringify(['Free Lashes', 'Hair Accessories', 'Touch-up Kit']), JSON.stringify(['bridal makeup', 'wedding', 'HD makeup']), 1, 1, 11],

            // SPA
            ['Swedish Full Body Massage', 'Unwind and de-stress with our relaxing full body Swedish massage. Eases muscle tension and promotes deep relaxation.', 'Total relaxation & stress relief', 'Spa', 3000, 2700, 90, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', JSON.stringify(['Hot Towel Wrap', 'Aromatherapy Oil', 'Full Body Massage', 'Scalp Massage']), JSON.stringify(['Herbal Tea', 'Relaxation Lounge Access']), JSON.stringify(['massage', 'spa', 'relaxation']), 1, 0, 12],
            ['Head, Face & Neck Massage', 'A targeted massage focusing on the head, face, and neck to relieve tension headaches and facial stress.', 'Relieve stress & headaches', 'Spa', 1000, 899, 45, 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800', JSON.stringify(['Scalp Massage', 'Acupressure Points', 'Neck & Shoulder Relief', 'Facial Massage']), JSON.stringify(['Hot Oil Treatment']), JSON.stringify(['head massage', 'relaxation', 'stress relief']), 0, 1, 13],

            // BRIDAL
            ['Complete Bridal Package', 'Our all-inclusive bridal package covers everything — from bridal makeup and hair styling to mehendi and pre-bridal skin treatments.', 'Complete transformation for your big day', 'Bridal', 25000, 22000, 480, 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800', JSON.stringify(['Pre-Bridal Facial', 'Bridal Makeup', 'Bridal Hair Styling', 'Mehendi Application', 'Nail Art']), JSON.stringify(['Free Skin Consultation', 'Groom Grooming Package', 'Touch-up Kit', 'Bridal Gift Bag']), JSON.stringify(['bridal package', 'wedding', 'complete package']), 1, 1, 14],

            // ACADEMY
            ['Professional Makeup Course', 'Learn the art of professional makeup from industry experts. Covers bridal, editorial, and everyday makeup techniques with hands-on training.', '6-week certified makeup course', 'Academy', 15000, 12000, 2880, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', JSON.stringify(['Basic & Advanced Makeup', 'Bridal Makeup', 'Airbrush Technique', 'Industry Tips & Tricks']), JSON.stringify(['Kit Included', 'Certificate on Completion', 'Job Placement Assistance']), JSON.stringify(['makeup course', 'academy', 'certification']), 1, 0, 15],
        ];

        for (const s of services) {
            insertService.run(...s);
        }
        console.log(`🌸 Seeded ${services.length} services successfully`);
    }
};

// Helper: generate appointment ID
const generateAppointmentId = () => {
    return `KBS-${Date.now().toString(36).toUpperCase()}`;
};

initDB();

module.exports = { db, generateAppointmentId };
