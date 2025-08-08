/**
 * POS System - Google Apps Script
 * ระบบจัดการข้อมูล POS ผ่าน Google Sheets
 * วันที่: 8 สิงหาคม 2025
 */

// ===============================
// การตั้งค่าเริ่มต้น
// ===============================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏪 POS System')
    .addItem('📋 สร้างโครงสร้างตาราง', 'setupSheets')
    .addItem('📝 เพิ่มข้อมูลตัวอย่าง', 'addSampleData')
    .addItem('💰 คำนวณกำไรรวม', 'calculateTotalProfit')
    .addItem('📊 สร้างรายงานยอดขาย', 'generateSalesReport')
    .addItem('🔧 ตรวจสอบข้อมูล', 'validateData')
    .addToUi();
}

// ===============================
// การสร้างโครงสร้างตาราง
// ===============================

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // สร้าง Sheets หากยังไม่มี
  createSheetIfNotExists(ss, 'MenuItems');
  createSheetIfNotExists(ss, 'Promotions');
  createSheetIfNotExists(ss, 'Orders');
  createSheetIfNotExists(ss, 'OrderItems');
  createSheetIfNotExists(ss, 'Reports');
  
  // ตั้งค่า Headers
  setupMenuItemsSheet(ss);
  setupPromotionsSheet(ss);
  setupOrdersSheet(ss);
  setupOrderItemsSheet(ss);
  setupReportsSheet(ss);
  
  SpreadsheetApp.getUi().alert('✅ สร้างโครงสร้างตารางเรียบร้อย!');
}

function createSheetIfNotExists(spreadsheet, sheetName) {
  try {
    const existingSheet = spreadsheet.getSheetByName(sheetName);
    if (!existingSheet) {
      const sheet = spreadsheet.insertSheet(sheetName);
      console.log(`สร้าง Sheet: ${sheetName}`);
      return sheet;
    }
    return existingSheet;
  } catch (e) {
    const sheet = spreadsheet.insertSheet(sheetName);
    console.log(`สร้าง Sheet: ${sheetName}`);
    return sheet;
  }
}

function setupMenuItemsSheet(ss) {
  const sheet = ss.getSheetByName('MenuItems');
  if (!sheet) {
    console.error('MenuItems sheet not found');
    return;
  }
  
  // ตรวจสอบว่ามี headers อยู่แล้วหรือไม่
  if (sheet.getLastRow() > 0) {
    const existingHeaders = sheet.getRange(1, 1, 1, 10).getValues()[0];
    if (existingHeaders[0] === 'ID') {
      console.log('MenuItems headers already exist');
      return;
    }
  }
  
  const headers = [
    'ID', 'Name', 'Price', 'Cost', 'Category', 
    'Description', 'Image', 'Available', 'CreatedAt', 'UpdatedAt'
  ];
  
  // ตั้งค่า Headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // จัดรูปแบบคอลัมน์
  sheet.setColumnWidth(1, 80);   // ID
  sheet.setColumnWidth(2, 150);  // Name
  sheet.setColumnWidth(3, 80);   // Price
  sheet.setColumnWidth(4, 80);   // Cost
  sheet.setColumnWidth(5, 100);  // Category
  sheet.setColumnWidth(6, 200);  // Description
  sheet.setColumnWidth(7, 100);  // Image
  sheet.setColumnWidth(8, 80);   // Available
  sheet.setColumnWidth(9, 150);  // CreatedAt
  sheet.setColumnWidth(10, 150); // UpdatedAt
  
  // เพิ่ม Data Validation
  const availableRange = sheet.getRange('H:H');
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['TRUE', 'FALSE'])
    .build();
  availableRange.setDataValidation(rule);
  
  sheet.setFrozenRows(1);
}

function setupPromotionsSheet(ss) {
  const sheet = ss.getSheetByName('Promotions');
  if (!sheet) {
    console.error('Promotions sheet not found');
    return;
  }
  
  // ตรวจสอบว่ามี headers อยู่แล้วหรือไม่
  if (sheet.getLastRow() > 0) {
    const existingHeaders = sheet.getRange(1, 1, 1, 11).getValues()[0];
    if (existingHeaders[0] === 'ID') {
      console.log('Promotions headers already exist');
      return;
    }
  }
  
  const headers = [
    'ID', 'Name', 'Description', 'DiscountType', 'DiscountValue',
    'MinOrderAmount', 'StartDate', 'EndDate', 'Active', 'CreatedAt', 'UpdatedAt'
  ];
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#34a853');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Data Validation สำหรับ DiscountType
  const discountTypeRange = sheet.getRange('D:D');
  const typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['percentage', 'fixed'])
    .build();
  discountTypeRange.setDataValidation(typeRule);
  
  // Data Validation สำหรับ Active
  const activeRange = sheet.getRange('I:I');
  const activeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['TRUE', 'FALSE'])
    .build();
  activeRange.setDataValidation(activeRule);
  
  sheet.setFrozenRows(1);
}

function setupOrdersSheet(ss) {
  const sheet = ss.getSheetByName('Orders');
  if (!sheet) {
    console.error('Orders sheet not found');
    return;
  }
  
  // ตรวจสอบว่ามี headers อยู่แล้วหรือไม่
  if (sheet.getLastRow() > 0) {
    const existingHeaders = sheet.getRange(1, 1, 1, 9).getValues()[0];
    if (existingHeaders[0] === 'ID') {
      console.log('Orders headers already exist');
      return;
    }
  }
  
  const headers = [
    'ID', 'OrderNumber', 'Subtotal', 'Discount', 'PromotionID',
    'Total', 'Status', 'CreatedAt', 'UpdatedAt'
  ];
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#ff9800');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Data Validation สำหรับ Status
  const statusRange = sheet.getRange('G:G');
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['pending', 'confirmed', 'completed', 'cancelled'])
    .build();
  statusRange.setDataValidation(statusRule);
  
  sheet.setFrozenRows(1);
}

function setupOrderItemsSheet(ss) {
  const sheet = ss.getSheetByName('OrderItems');
  if (!sheet) {
    console.error('OrderItems sheet not found');
    return;
  }
  
  // ตรวจสอบว่ามี headers อยู่แล้วหรือไม่
  if (sheet.getLastRow() > 0) {
    const existingHeaders = sheet.getRange(1, 1, 1, 7).getValues()[0];
    if (existingHeaders[0] === 'ID') {
      console.log('OrderItems headers already exist');
      return;
    }
  }
  
  const headers = [
    'ID', 'OrderID', 'MenuItemID', 'MenuItemName',
    'Quantity', 'Price', 'Subtotal'
  ];
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#9c27b0');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  sheet.setFrozenRows(1);
}

function setupReportsSheet(ss) {
  const sheet = ss.getSheetByName('Reports');
  if (!sheet) {
    console.error('Reports sheet not found');
    return;
  }
  
  // ตรวจสอบว่ามี headers อยู่แล้วหรือไม่
  if (sheet.getLastRow() > 0) {
    const existingHeaders = sheet.getRange(1, 1, 1, 8).getValues()[0];
    if (existingHeaders[0] === 'Date') {
      console.log('Reports headers already exist');
      return;
    }
  }
  
  const headers = [
    'Date', 'TotalOrders', 'TotalRevenue', 'TotalCost', 'TotalProfit',
    'ProfitMargin%', 'TopSellingItem', 'GeneratedAt'
  ];
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#f44336');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  sheet.setFrozenRows(1);
}

// ===============================
// การเพิ่มข้อมูลตัวอย่าง
// ===============================

function addSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  addSampleMenuItems(ss);
  addSamplePromotions(ss);
  addSampleOrders(ss);
  
  SpreadsheetApp.getUi().alert('✅ เพิ่มข้อมูลตัวอย่างเรียบร้อย!');
}

function addSampleMenuItems(ss) {
  const sheet = ss.getSheetByName('MenuItems');
  const now = new Date().toISOString();
  
  const sampleData = [
    ['menu-1', 'กาแฟอเมริกาโน่', 45, 25, 'กาแฟ', 'กาแฟอเมริกาโน่หอมกรุ่น', '', 'TRUE', now, now],
    ['menu-2', 'กาแฟลาเต้', 55, 32, 'กาแฟ', 'กาแฟลาเต้นมข้นหวาน', '', 'TRUE', now, now],
    ['menu-3', 'กาแฟคาปูชิโน่', 60, 35, 'กาแฟ', 'กาแฟคาปูชิโน่โฟมนุ่ม', '', 'TRUE', now, now],
    ['menu-4', 'ชาเขียวมัทฉะ', 65, 42, 'ชา', 'ชาเขียวมัทฉะแท้จากญี่ปุ่น', '', 'TRUE', now, now],
    ['menu-5', 'ชาไทย', 40, 22, 'ชา', 'ชาไทยแท้รสชาติเข้มข้น', '', 'TRUE', now, now],
    ['menu-6', 'สมูทตี้มะม่วง', 70, 38, 'สมูทตี้', 'สมูทตี้มะม่วงสด', '', 'TRUE', now, now],
    ['menu-7', 'น้ำส้มคั้นสด', 50, 18, 'น้ำผลไม้', 'น้ำส้มคั้นสด 100%', '', 'TRUE', now, now],
    ['menu-8', 'เลมอนเสด', 45, 20, 'น้ำผลไม้', 'เลมอนเสดเปร้ยวหวาน', '', 'TRUE', now, now]
  ];
  
  // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
  if (sheet.getLastRow() <= 1) {
    const range = sheet.getRange(2, 1, sampleData.length, sampleData[0].length);
    range.setValues(sampleData);
    
    // จัดรูปแบบราคา
    const priceRange = sheet.getRange(2, 3, sampleData.length, 2); // Price และ Cost
    priceRange.setNumberFormat('#,##0.00');
  }
}

function addSamplePromotions(ss) {
  const sheet = ss.getSheetByName('Promotions');
  const now = new Date().toISOString();
  
  const sampleData = [
    ['promo-1', 'ลดราคา 10% เมื่อซื้อครบ 200 บาท', 'รับส่วนลด 10% เมื่อซื้อครบ 200 บาท', 'percentage', 10, 200, '2025-01-01', '2025-12-31', 'TRUE', now, now],
    ['promo-2', 'ลดทันที 20 บาท', 'ลดทันที 20 บาท สำหรับทุกออเดอร์', 'fixed', 20, 100, '2025-01-01', '2025-12-31', 'TRUE', now, now]
  ];
  
  if (sheet.getLastRow() <= 1) {
    const range = sheet.getRange(2, 1, sampleData.length, sampleData[0].length);
    range.setValues(sampleData);
  }
}

function addSampleOrders(ss) {
  const sheet = ss.getSheetByName('Orders');
  const itemsSheet = ss.getSheetByName('OrderItems');
  const now = new Date().toISOString();
  
  // ข้อมูลออเดอร์ตัวอย่าง
  const orderData = [
    ['order-1', '202508080001', 100, 0, '', 100, 'completed', now, now],
    ['order-2', '202508080002', 155, 15.5, 'promo-1', 139.5, 'completed', now, now],
    ['order-3', '202508080003', 85, 0, '', 85, 'pending', now, now]
  ];
  
  // ข้อมูล OrderItems ตัวอย่าง
  const orderItemsData = [
    ['item-1', 'order-1', 'menu-1', 'กาแฟอเมริกาโน่', 1, 45, 45],
    ['item-2', 'order-1', 'menu-2', 'กาแฟลาเต้', 1, 55, 55],
    ['item-3', 'order-2', 'menu-3', 'กาแฟคาปูชิโน่', 1, 60, 60],
    ['item-4', 'order-2', 'menu-4', 'ชาเขียวมัทฉะ', 1, 65, 65],
    ['item-5', 'order-2', 'menu-5', 'ชาไทย', 1, 40, 40],
    ['item-6', 'order-3', 'menu-6', 'สมูทตี้มะม่วง', 1, 70, 70],
    ['item-7', 'order-3', 'menu-8', 'เลมอนเสด', 1, 45, 45]
  ];
  
  if (sheet.getLastRow() <= 1) {
    const orderRange = sheet.getRange(2, 1, orderData.length, orderData[0].length);
    orderRange.setValues(orderData);
    
    // จัดรูปแบบตัวเลข
    const numberRange = sheet.getRange(2, 3, orderData.length, 4); // Subtotal, Discount, Total
    numberRange.setNumberFormat('#,##0.00');
  }
  
  if (itemsSheet.getLastRow() <= 1) {
    const itemsRange = itemsSheet.getRange(2, 1, orderItemsData.length, orderItemsData[0].length);
    itemsRange.setValues(orderItemsData);
    
    // จัดรูปแบบตัวเลข
    const itemNumberRange = itemsSheet.getRange(2, 6, orderItemsData.length, 2); // Price, Subtotal
    itemNumberRange.setNumberFormat('#,##0.00');
  }
}

// ===============================
// ฟังก์ชันการคำนวณกำไร
// ===============================

function calculateTotalProfit() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    const menuSheet = ss.getSheetByName('MenuItems');
    const ordersSheet = ss.getSheetByName('Orders');
    const orderItemsSheet = ss.getSheetByName('OrderItems');
    
    if (!menuSheet || !ordersSheet || !orderItemsSheet) {
      SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet ที่จำเป็น กรุณาสร้างโครงสร้างตารางก่อน');
      return null;
    }
    
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (menuSheet.getLastRow() <= 1 || orderItemsSheet.getLastRow() <= 1) {
      SpreadsheetApp.getUi().alert('❌ ไม่พบข้อมูลเมนูหรือรายการสั่งซื้อ');
      return null;
    }
    
    // ดึงข้อมูลเมนู
    const menuData = menuSheet.getDataRange().getValues();
    const menuMap = {};
    
    for (let i = 1; i < menuData.length; i++) {
      const row = menuData[i];
      if (row[0]) { // ถ้ามี ID
        menuMap[row[0]] = {
          name: row[1],
          price: row[2],
          cost: row[3]
        };
      }
    }
    
    // ดึงข้อมูล Order Items
    const itemsData = orderItemsSheet.getDataRange().getValues();
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    
    for (let i = 1; i < itemsData.length; i++) {
      const row = itemsData[i];
      if (row[0]) { // ถ้ามี ID
        const menuItemId = row[2];
        const quantity = row[4];
        const price = row[5];
        
        const revenue = quantity * price;
        totalRevenue += revenue;
        
        if (menuMap[menuItemId]) {
          const cost = quantity * menuMap[menuItemId].cost;
          totalCost += cost;
          totalProfit += (revenue - cost);
        }
      }
    }
    
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
    
    // แสดงผลลัพธ์
    const message = `💰 สรุปผลการดำเนินงาน\n\n` +
      `📊 ยอดขายรวม: ${totalRevenue.toFixed(2)} บาท\n` +
      `💸 ต้นทุนรวม: ${totalCost.toFixed(2)} บาท\n` +
      `💰 กำไรรวม: ${totalProfit.toFixed(2)} บาท\n` +
      `📈 อัตรากำไร: ${profitMargin.toFixed(2)}%`;
      
    SpreadsheetApp.getUi().alert(message);
    
    return {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin
    };
  } catch (error) {
    console.error('Error in calculateTotalProfit:', error);
    SpreadsheetApp.getUi().alert('❌ เกิดข้อผิดพลาดในการคำนวณกำไร: ' + error.message);
    return null;
  }
}

// ===============================
// ฟังก์ชันสร้างรายงาน
// ===============================

function generateSalesReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    const reportsSheet = ss.getSheetByName('Reports');
    
    if (!reportsSheet) {
      SpreadsheetApp.getUi().alert('❌ ไม่พบ Reports sheet กรุณาสร้างโครงสร้างตารางก่อน');
      return;
    }
    
    // คำนวณข้อมูล
    const profitData = calculateTotalProfit();
    if (!profitData) {
      return; // ถ้าคำนวณกำไรไม่สำเร็จ
    }
    
    const topSellingItem = getTopSellingItem(ss);
    
    // ดึงจำนวนออเดอร์
    const ordersSheet = ss.getSheetByName('Orders');
    if (!ordersSheet) {
      SpreadsheetApp.getUi().alert('❌ ไม่พบ Orders sheet');
      return;
    }
    
    const ordersData = ordersSheet.getDataRange().getValues();
    const totalOrders = ordersData.length - 1; // ลบ header row
    
    // เพิ่มข้อมูลลงรายงาน
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    const reportRow = [
      today,
      totalOrders,
      profitData.totalRevenue,
      profitData.totalCost,
      profitData.totalProfit,
      profitData.profitMargin,
      topSellingItem,
      now
    ];
    
    reportsSheet.appendRow(reportRow);
    
    // จัดรูปแบบแถวที่เพิ่ม
    const lastRow = reportsSheet.getLastRow();
    const numberRange = reportsSheet.getRange(lastRow, 2, 1, 5); // TotalOrders ถึง ProfitMargin
    numberRange.setNumberFormat('#,##0.00');
    
    SpreadsheetApp.getUi().alert('✅ สร้างรายงานเรียบร้อย!');
  } catch (error) {
    console.error('Error in generateSalesReport:', error);
    SpreadsheetApp.getUi().alert('❌ เกิดข้อผิดพลาดในการสร้างรายงาน: ' + error.message);
  }
}

function getTopSellingItem(ss) {
  try {
    const orderItemsSheet = ss.getSheetByName('OrderItems');
    
    if (!orderItemsSheet || orderItemsSheet.getLastRow() <= 1) {
      return 'ไม่มีข้อมูล';
    }
    
    const itemsData = orderItemsSheet.getDataRange().getValues();
    
    const salesCount = {};
    
    for (let i = 1; i < itemsData.length; i++) {
      const row = itemsData[i];
      if (row[0]) { // ถ้ามี ID
        const menuItemName = row[3];
        const quantity = row[4];
        
        if (salesCount[menuItemName]) {
          salesCount[menuItemName] += quantity;
        } else {
          salesCount[menuItemName] = quantity;
        }
      }
    }
    
    // หาสินค้าที่ขายดีที่สุด
    let topItem = '';
    let maxQuantity = 0;
    
    for (const itemName in salesCount) {
      if (salesCount[itemName] > maxQuantity) {
        maxQuantity = salesCount[itemName];
        topItem = itemName;
      }
    }
    
    return topItem ? topItem + ` (${maxQuantity} แก้ว)` : 'ไม่มีข้อมูล';
  } catch (error) {
    console.error('Error in getTopSellingItem:', error);
    return 'เกิดข้อผิดพลาด';
  }
}

// ===============================
// ฟังก์ชันตรวจสอบข้อมูล
// ===============================

function validateData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const errors = [];
  
  // ตรวจสอบข้อมูลเมนู
  const menuSheet = ss.getSheetByName('MenuItems');
  const menuData = menuSheet.getDataRange().getValues();
  
  for (let i = 1; i < menuData.length; i++) {
    const row = menuData[i];
    if (row[0]) { // ถ้ามี ID
      // ตรวจสอบราคาและต้นทุน
      if (row[2] <= 0) {
        errors.push(`เมนู "${row[1]}" มีราคาไม่ถูกต้อง (แถว ${i + 1})`);
      }
      if (row[3] < 0) {
        errors.push(`เมนู "${row[1]}" มีต้นทุนไม่ถูกต้อง (แถว ${i + 1})`);
      }
      if (row[3] >= row[2]) {
        errors.push(`เมนู "${row[1]}" มีต้นทุนสูงกว่าราคาขาย (แถว ${i + 1})`);
      }
    }
  }
  
  // ตรวจสอบข้อมูลออเดอร์
  const ordersSheet = ss.getSheetByName('Orders');
  const ordersData = ordersSheet.getDataRange().getValues();
  
  for (let i = 1; i < ordersData.length; i++) {
    const row = ordersData[i];
    if (row[0]) { // ถ้ามี ID
      // ตรวจสอบ Total = Subtotal - Discount
      const subtotal = row[2];
      const discount = row[3];
      const total = row[5];
      
      if (Math.abs((subtotal - discount) - total) > 0.01) {
        errors.push(`ออเดอร์ "${row[1]}" มีการคำนวณยอดรวมไม่ถูกต้อง (แถว ${i + 1})`);
      }
    }
  }
  
  // แสดงผลลัพธ์
  if (errors.length === 0) {
    SpreadsheetApp.getUi().alert('✅ ข้อมูลถูกต้องทั้งหมด!');
  } else {
    const errorMessage = '❌ พบข้อผิดพลาด:\n\n' + errors.join('\n');
    SpreadsheetApp.getUi().alert(errorMessage);
  }
}

// ===============================
// ฟังก์ชันเพิ่มเติม
// ===============================

function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}`;
}

// Auto-calculate subtotal when quantity or price changes
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  // ถ้าแก้ไขใน OrderItems sheet
  if (sheet.getName() === 'OrderItems') {
    const row = range.getRow();
    const col = range.getColumn();
    
    // ถ้าแก้ไข Quantity (column 5) หรือ Price (column 6)
    if ((col === 5 || col === 6) && row > 1) {
      const quantity = sheet.getRange(row, 5).getValue();
      const price = sheet.getRange(row, 6).getValue();
      const subtotal = quantity * price;
      
      sheet.getRange(row, 7).setValue(subtotal);
    }
  }
  
  // ถ้าแก้ไขใน MenuItems sheet และเป็น column Price หรือ Cost
  if (sheet.getName() === 'MenuItems') {
    const row = range.getRow();
    const col = range.getColumn();
    
    // อัปเดต UpdatedAt เมื่อมีการแก้ไข
    if (row > 1 && col >= 2 && col <= 8) {
      sheet.getRange(row, 10).setValue(new Date().toISOString());
    }
  }
}
