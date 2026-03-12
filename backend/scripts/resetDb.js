const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'kiran_beauty.db');

if (fs.existsSync(dbPath)) {
    console.log(`🗑️  Deleting previous database at ${dbPath}...`);
    try {
        // Close connections if any (though this is a standalone script)
        fs.unlinkSync(dbPath);
        // Also delete WAL files if they exist
        if (fs.existsSync(`${dbPath}-shm`)) fs.unlinkSync(`${dbPath}-shm`);
        if (fs.existsSync(`${dbPath}-wal`)) fs.unlinkSync(`${dbPath}-wal`);
        console.log('✅ Previous data deleted successfully.');
    } catch (err) {
        console.error('❌ Failed to delete database:', err.message);
    }
} else {
    console.log('ℹ️ No previous database found.');
}

console.log('✨ Database will be re-initialized on next server start.');
