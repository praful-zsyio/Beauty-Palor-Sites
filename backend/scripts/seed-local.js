/**
 * Run this script to seed the local SQLite database with services.
 * Usage: node scripts/seed-local.js
 */

const path = require('path');
require('dotenv').config();
// This imports db.js which calls initDB() — which now includes service seeding
require('../config/db');
console.log('✅ Seed complete! Restart your backend server.');
