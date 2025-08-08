#!/usr/bin/env node

/**
 * สคริปต์สำหรับทดสอบการเชื่อมต่อ Google Sheets
 * ใช้สำหรับตรวจสอบว่าการตั้งค่า Google Sheets API ถูกต้องหรือไม่
 */

import dotenv from 'dotenv';
import { GoogleSheetsDatabase } from './src/database/googleSheets.js';

// โหลด environment variables
dotenv.config();

async function testGoogleSheetsConnection() {
  console.log('🧪 ทดสอบการเชื่อมต่อ Google Sheets...\n');

  try {
    // ตรวจสอบ environment variables
    console.log('📋 ตรวจสอบการตั้งค่า...');
    
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    
    if (!spreadsheetId) {
      throw new Error('❌ GOOGLE_SPREADSHEET_ID ไม่ได้กำหนดใน .env');
    }
    
    if (!serviceAccountKey) {
      throw new Error('❌ GOOGLE_SERVICE_ACCOUNT_KEY ไม่ได้กำหนดใน .env');
    }
    
    console.log(`✅ Spreadsheet ID: ${spreadsheetId}`);
    console.log(`✅ Service Account Key: ${serviceAccountKey}\n`);

    // สร้าง database instance
    console.log('🔗 กำลังเชื่อมต่อ Google Sheets...');
    const db = new GoogleSheetsDatabase();
    
    // รอให้ initialization เสร็จ
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // ทดสอบการดึงข้อมูล
    console.log('📊 ทดสอบการดึงข้อมูลเมนู...');
    const menuItems = await db.getAllMenuItems();
    
    console.log(`✅ พบเมนูทั้งหมด ${menuItems.length} รายการ:`);
    menuItems.forEach((item, index) => {
      const profit = item.price - (item.cost || 0);
      const profitPercent = item.price > 0 ? ((profit / item.price) * 100).toFixed(1) : 0;
      
      console.log(`   ${index + 1}. ${item.name}`);
      console.log(`      📋 หมวดหมู่: ${item.category}`);
      console.log(`      💰 ราคา: ${item.price} บาท | ต้นทุน: ${item.cost || 0} บาท | กำไร: ${profit} บาท (${profitPercent}%)`);
      console.log(`      🟢 สถานะ: ${item.available ? 'พร้อมขาย' : 'ไม่พร้อมขาย'}\n`);
    });

    // ทดสอบการสร้างข้อมูลใหม่
    console.log('➕ ทดสอบการเพิ่มเมนูใหม่...');
    const testMenuItem = {
      name: 'ทดสอบเมนู',
      price: 50,
      cost: 30,
      category: 'ทดสอบ',
      description: 'เมนูสำหรับทดสอบระบบ',
      available: true
    };
    
    const newItem = await db.createMenuItem(testMenuItem);
    console.log(`✅ เพิ่มเมนูใหม่สำเร็จ: ${newItem.name} (ID: ${newItem.id})`);
    
    // ทดสอบการอัปเดต
    console.log('✏️ ทดสอบการแก้ไขเมนู...');
    const updatedItem = await db.updateMenuItem(newItem.id, {
      price: 55,
      description: 'เมนูทดสอบที่แก้ไขแล้ว'
    });
    
    if (updatedItem) {
      console.log(`✅ แก้ไขเมนูสำเร็จ: ราคาใหม่ ${updatedItem.price} บาท`);
    }
    
    // ทดสอบการลบ
    console.log('🗑️ ทดสอบการลบเมนู...');
    const deleted = await db.deleteMenuItem(newItem.id);
    
    if (deleted) {
      console.log('✅ ลบเมนูทดสอบสำเร็จ');
    }

    // ทดสอบการดึงข้อมูลออเดอร์
    console.log('📦 ทดสอบการดึงข้อมูลออเดอร์...');
    const orders = await db.getAllOrders();
    console.log(`✅ พบออเดอร์ทั้งหมด ${orders.length} รายการ`);

    // แสดงลิงก์ Google Sheets
    const sheetsUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    console.log(`\n🔗 ลิงก์ Google Sheets: ${sheetsUrl}`);
    
    console.log('\n🎉 การทดสอบเสร็จสมบูรณ์! ระบบพร้อมใช้งาน');
    
  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาดในการทดสอบ:');
    console.error(error.message);
    console.error('\n💡 แนะนำการแก้ไข:');
    console.error('1. ตรวจสอบไฟล์ .env ว่ามี GOOGLE_SPREADSHEET_ID และ GOOGLE_SERVICE_ACCOUNT_KEY');
    console.error('2. ตรวจสอบไฟล์ service-account-key.json ว่าอยู่ในตำแหน่งที่ถูกต้อง');
    console.error('3. ตรวจสอบว่าได้แชร์ Spreadsheet ให้ Service Account แล้ว');
    console.error('4. ตรวจสอบว่าได้เปิดใช้งาน Google Sheets API ใน Google Cloud Console');
    
    process.exit(1);
  }
}

// รันการทดสอบ
testGoogleSheetsConnection();
