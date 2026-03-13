const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE_PATH = path.join(__dirname, '..', 'data', 'kiran_beauty_data.xlsx');

/**
 * Log data to an Excel file. Creates the file if it doesn't exist.
 * @param {string} sheetName - Name of the worksheet ('Bookings' or 'Enquiries')
 * @param {Object} data - The data object to append
 */
const logToExcel = async (sheetName, data) => {
    try {
        const workbook = new ExcelJS.Workbook();
        let worksheet;

        // Create data directory if it doesn't exist
        const dataDir = path.dirname(EXCEL_FILE_PATH);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        if (fs.existsSync(EXCEL_FILE_PATH)) {
            await workbook.xlsx.readFile(EXCEL_FILE_PATH);
            worksheet = workbook.getWorksheet(sheetName);
        }

        if (!worksheet) {
            worksheet = workbook.addWorksheet(sheetName);
            // Define headers based on sheet type
            if (sheetName === 'Bookings') {
                worksheet.columns = [
                    { header: 'ID', key: 'id', width: 20 },
                    { header: 'Date', key: 'date', width: 15 },
                    { header: 'Time', key: 'time', width: 15 },
                    { header: 'Service', key: 'service', width: 25 },
                    { header: 'Customer', key: 'name', width: 20 },
                    { header: 'Email', key: 'email', width: 25 },
                    { header: 'Phone', key: 'phone', width: 15 },
                    { header: 'Amount', key: 'amount', width: 12 },
                    { header: 'Status', key: 'status', width: 12 },
                    { header: 'Logged At', key: 'loggedAt', width: 20 }
                ];
            } else {
                worksheet.columns = [
                    { header: 'Name', key: 'name', width: 20 },
                    { header: 'Email', key: 'email', width: 25 },
                    { header: 'Phone', key: 'phone', width: 15 },
                    { header: 'Subject', key: 'subject', width: 25 },
                    { header: 'Message', key: 'message', width: 40 },
                    { header: 'Logged At', key: 'loggedAt', width: 20 }
                ];
            }
        }

        // Add row
        worksheet.addRow({
            ...data,
            loggedAt: new Date().toLocaleString('en-IN')
        });

        await workbook.xlsx.writeFile(EXCEL_FILE_PATH);
        console.log(`✅ Data logged to Excel Sheet: ${sheetName}`);
    } catch (error) {
        console.error('❌ Excel Logging Error:', error);
    }
};

module.exports = { logToExcel, EXCEL_FILE_PATH };
