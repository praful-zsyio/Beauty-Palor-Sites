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

// Initialize SQLite DB (this runs table creation)
require('./config/db');

const errorHandler = require('./middleware/error');

const app = express();

// Security
app.use(helmet());
app.use(morgan('dev'));
app.use((req, res, next) => {
    console.log(`>>> Incoming Request: ${req.method} ${req.originalUrl}`);
    next();
});

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

// CORS
app.use(cors({
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/chat', require('./routes/chat'));

app.get('/api/test-public', (req, res) => {
    res.status(200).json({ success: true, message: 'This API is 100% public and should never show authorization errors.' });
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
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`💾 Database: SQLite → ./data/kiran_beauty.db`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});
