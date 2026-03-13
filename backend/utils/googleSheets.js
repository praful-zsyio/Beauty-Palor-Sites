const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

/**
 * Sync data to Google Sheets.
 * NOTE: This requires a Google Service Account JSON file and a Sheet ID.
 * @param {string} sheetTitle - 'Bookings' or 'Enquiries'
 * @param {Object} data - The row data to add
 */
const syncToGoogleSheets = async (sheetTitle, data) => {
    // ⚠️ These are placeholders. User must provide real values in .env
    const SPREADSHEEET_ID = process.env.GOOGLE_SHEETS_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!SPREADSHEEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
        // Silently skip if not configured, we don't want to crash the app
        console.warn('⚠️ Google Sheets not configured. Skipping sync.');
        return;
    }

    try {
        const serviceAccountAuth = new JWT({
            email: CLIENT_EMAIL,
            key: PRIVATE_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        let sheet = doc.sheetsByTitle[sheetTitle];
        if (!sheet) {
            sheet = await doc.addSheet({ title: sheetTitle, headerValues: Object.keys(data) });
        }

        await sheet.addRow({
            ...data,
            loggedAt: new Date().toLocaleString('en-IN')
        });

        console.log(`📊 Data synced to Google Sheets: ${sheetTitle}`);
    } catch (error) {
        console.error('❌ Google Sheets Sync Error:', error.message);
    }
};

module.exports = { syncToGoogleSheets };
