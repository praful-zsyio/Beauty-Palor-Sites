const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'kiran_beauty.db');

const resetDb = () => {
    if (fs.existsSync(dbPath)) {
        console.log(`🗑️  Deleting database at ${dbPath}...`);
        fs.unlinkSync(dbPath);
        if (fs.existsSync(`${dbPath}-shm`)) fs.unlinkSync(`${dbPath}-shm`);
        if (fs.existsSync(`${dbPath}-wal`)) fs.unlinkSync(`${dbPath}-wal`);
        console.log('✅ Database file removed.');
    } else {
        console.log('ℹ️ No database file found to delete.');
    }
};

const clearTables = () => {
    if (!fs.existsSync(dbPath)) {
        console.log('❌ Database file does not exist. Run reset or start the server first.');
        return;
    }
    const db = new Database(dbPath);
    console.log('🧹 Clearing all tables...');
    try {
        db.exec('DELETE FROM appointments');
        db.exec('DELETE FROM reviews');
        db.exec('DELETE FROM services');
        db.exec('DELETE FROM users WHERE role != "admin"');
        console.log('✅ Tables cleared (Admin user preserved).');
    } catch (err) {
        console.error('❌ Error clearing tables:', err.message);
    } finally {
        db.close();
    }
};

const args = process.argv.slice(2);
const command = args[0] || '--reset';

if (command === '--reset') {
    resetDb();
    console.log('✨ Data will be fully re-initialized on next start.');
} else if (command === '--clear') {
    clearTables();
} else {
    console.log('Usage: node scripts/manage-db.js [--reset | --clear]');
}
