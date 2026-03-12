const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'kiran_beauty.db');

const resetDb = () => {
    if (fs.existsSync(dbPath)) {
        console.log(`🗑️  Deleting database at ${dbPath}...`);
        try {
            fs.unlinkSync(dbPath);
            if (fs.existsSync(`${dbPath}-shm`)) fs.unlinkSync(`${dbPath}-shm`);
            if (fs.existsSync(`${dbPath}-wal`)) fs.unlinkSync(`${dbPath}-wal`);
            console.log('✅ Database file removed.');
        } catch (err) {
            if (err.code === 'EBUSY') {
                console.error('❌ Error: Database is locked!');
                console.error('👉 Please STOP your backend server (Press Ctrl+C in the server terminal) and try again.');
            } else {
                console.error('❌ Failed to delete database:', err.message);
            }
        }
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

const clearServices = () => {
    if (!fs.existsSync(dbPath)) {
        console.log('❌ Database file does not exist.');
        return;
    }
    const db = new Database(dbPath);
    console.log('🧹 Deleting ALL services and reviews...');
    try {
        db.exec('DELETE FROM services');
        db.exec('DELETE FROM reviews');
        console.log('✅ All services and reviews removed from database.');
    } catch (err) {
        console.error('❌ Error clearing services:', err.message);
    } finally {
        db.close();
    }
};

const args = process.argv.slice(2);
const command = args[0] || '--reset';

if (command === '--reset') {
    resetDb();
} else if (command === '--clear') {
    clearTables();
} else if (command === '--clear-services') {
    clearServices();
} else {
    console.log('Usage: node scripts/manage-db.js [--reset | --clear | --clear-services]');
}
