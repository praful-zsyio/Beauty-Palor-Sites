const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load env vars
dotenv.config();

if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET is not set. Using a default temporary secret. (NOT RECOMMENDED FOR PRODUCTION)');
    process.env.JWT_SECRET = 'temporary_kiran_secret_123';
}

// Initialize SQLite DB (this runs table creation)
require('./config/db');

const errorHandler = require('./middleware/error');

const app = express();

// CORS - Must be BEFORE helmet and other middlewares
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://beauty-palor-sites-4.onrender.com',
    'https://beauty-palor-sites-gcl8-d5y7v9kjw.vercel.app',
    'https://beauty-palor-sites-z6r1.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.includes(origin) || 
                         origin.endsWith('.vercel.app') || 
                         process.env.NODE_ENV === 'development';
        
        if (isAllowed) {
            callback(null, true);
        } else {
            // For now, allow all but track for security
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
}));

// Security - Relaxed for cross-origin
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));

app.get('/api/test-public', (req, res) => {
    res.status(200).json({ success: true, message: 'This API is 100% public and should never show authorization errors.' });
});

app.get('/api/public/stats', (req, res) => {
    const { db } = require('./config/db');
    const totalBookings = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;
    res.status(200).json({ success: true, totalBookings: 5000 + totalBookings }); // Added to marketing base
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🌸 Kiran Beauty Salon API is running!',
        database: 'SQLite (better-sqlite3)',
        dataFile: './data/kiran_beauty.db',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('\n🌸 Kiran Beauty Salon & Academy API');
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📧 Notification email set to: ${process.env.EMAIL_TO || 'Not Set'}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`💾 Database: SQLite → ./data/kiran_beauty.db`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});
