import { GoogleSheetsDatabase } from './database/googleSheets';

// สร้าง Demo Google Spreadsheet สำหรับทดสอบ
async function createDemoSpreadsheet() {
  try {
    console.log('🚀 Creating demo Google Spreadsheet...');
    
    const db = new GoogleSheetsDatabase();
    
    // รอให้ระบบสร้าง spreadsheet และข้อมูลตัวอย่าง
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const spreadsheetId = db.getSpreadsheetId();
    const sheetsUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    
    console.log('✅ Demo spreadsheet created successfully!');
    console.log(`📊 Spreadsheet ID: ${spreadsheetId}`);
    console.log(`🔗 View spreadsheet: ${sheetsUrl}`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Copy the Spreadsheet ID to your .env file');
    console.log('2. Share the spreadsheet with your service account email');
    console.log('3. Make sure the service account has Editor permissions');
    
  } catch (error) {
    console.error('❌ Error creating demo spreadsheet:', error);
    console.log('');
    console.log('🔧 Please check:');
    console.log('1. Google Sheets API is enabled');
    console.log('2. Service account key file exists');
    console.log('3. Environment variables are set correctly');
  }
}

// รันสคริปต์ถ้าเรียกใช้โดยตรง
if (require.main === module) {
  createDemoSpreadsheet();
}

export { createDemoSpreadsheet };
