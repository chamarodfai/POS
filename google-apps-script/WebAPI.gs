/**
 * POS System Web API - Google Apps Script
 * API สำหรับเชื่อมต่อระหว่างเว็บไซต์และ Google Sheets
 * วันที่: 8 สิงหาคม 2025
 */

// ===============================
// ฟังก์ชันสร้าง Sheets อัตโนมัติ
// ===============================

function setupDatabase(e) {
  try {
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!ss) {
      ss = SpreadsheetApp.create('POS System Database');
    }
    
    // สร้าง MenuItems sheet
    let menuSheet = ss.getSheetByName('MenuItems');
    if (!menuSheet) {
      menuSheet = ss.insertSheet('MenuItems');
      const menuHeaders = [
        'ID', 'Name', 'Price', 'Cost', 'Category', 
        'Description', 'Image', 'Available', 'CreatedAt', 'UpdatedAt'
      ];
      menuSheet.getRange(1, 1, 1, menuHeaders.length).setValues([menuHeaders]);
    }
    
    // สร้าง Orders sheet
    let orderSheet = ss.getSheetByName('Orders');
    if (!orderSheet) {
      orderSheet = ss.insertSheet('Orders');
      const orderHeaders = [
        'ID', 'OrderNumber', 'Subtotal', 'Discount', 'PromotionId', 
        'Total', 'Status', 'CreatedAt', 'UpdatedAt'
      ];
      orderSheet.getRange(1, 1, 1, orderHeaders.length).setValues([orderHeaders]);
    }
    
    // สร้าง OrderItems sheet
    let orderItemSheet = ss.getSheetByName('OrderItems');
    if (!orderItemSheet) {
      orderItemSheet = ss.insertSheet('OrderItems');
      const itemHeaders = [
        'ID', 'OrderId', 'MenuItemId', 'MenuItemName', 'Quantity', 'Price', 'Subtotal'
      ];
      orderItemSheet.getRange(1, 1, 1, itemHeaders.length).setValues([itemHeaders]);
    }
    
    // สร้าง Promotions sheet
    let promoSheet = ss.getSheetByName('Promotions');
    if (!promoSheet) {
      promoSheet = ss.insertSheet('Promotions');
      const promoHeaders = [
        'ID', 'Name', 'Description', 'DiscountType', 'DiscountValue', 
        'MinOrderAmount', 'StartDate', 'EndDate', 'Active', 'CreatedAt', 'UpdatedAt'
      ];
      promoSheet.getRange(1, 1, 1, promoHeaders.length).setValues([promoHeaders]);
    }
    
    // สร้าง Reports sheet
    let reportSheet = ss.getSheetByName('Reports');
    if (!reportSheet) {
      reportSheet = ss.insertSheet('Reports');
      const reportHeaders = [
        'Date', 'TotalOrders', 'TotalRevenue', 'TotalCost', 
        'TotalProfit', 'ProfitMargin', 'TopSellingItem', 'GeneratedAt'
      ];
      reportSheet.getRange(1, 1, 1, reportHeaders.length).setValues([reportHeaders]);
    }
    
    // ลบ Sheet1 ถ้ามี
    try {
      const sheet1 = ss.getSheetByName('Sheet1');
      if (sheet1) {
        ss.deleteSheet(sheet1);
      }
    } catch (e) {
      // ไม่สำคัญถ้าลบไม่ได้
    }
    
    return createResponse(true, 'Database setup completed', {
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      sheets: ['MenuItems', 'Orders', 'OrderItems', 'Promotions', 'Reports']
    }, e);
  } catch (error) {
    return createResponse(false, 'Error setting up database: ' + error.message, null, e);
  }
}

// ===============================
// ฟังก์ชันทดสอบ
// ===============================

function testFunction() {
  return "Test successful! Google Apps Script is working.";
}

// ===============================
// การตั้งค่า Web App
// ===============================

function handleCreateOrderFromGet(e) {
  try {
    console.log('handleCreateOrderFromGet called');
    console.log('Parameters:', e.parameter);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let ordersSheet = ss.getSheetByName('Orders');
    let orderItemsSheet = ss.getSheetByName('OrderItems');
    
    // สร้าง sheets ถ้าไม่มี
    if (!ordersSheet) {
      ordersSheet = ss.insertSheet('Orders');
      const orderHeaders = [
        'ID', 'OrderNumber', 'Subtotal', 'Discount', 'PromotionId', 
        'Total', 'Status', 'CreatedAt', 'UpdatedAt'
      ];
      ordersSheet.getRange(1, 1, 1, orderHeaders.length).setValues([orderHeaders]);
    }
    
    if (!orderItemsSheet) {
      orderItemsSheet = ss.insertSheet('OrderItems');
      const itemHeaders = [
        'ID', 'OrderId', 'MenuItemId', 'MenuItemName', 'Quantity', 'Price', 'Subtotal'
      ];
      orderItemsSheet.getRange(1, 1, 1, itemHeaders.length).setValues([itemHeaders]);
    }
    
    // อ่านข้อมูล order จาก parameter
    const orderData = JSON.parse(e.parameter.orderData || '{}');
    const now = new Date().toISOString();
    const orderId = generateId('order');
    const orderNumber = generateOrderNumber();
    
    // คำนวณยอดรวม
    let subtotal = 0;
    if (orderData.items && orderData.items.length > 0) {
      orderData.items.forEach(item => {
        subtotal += (item.quantity || 0) * (item.price || 0);
      });
    }
    
    const discount = orderData.discount || 0;
    const total = subtotal - discount;
    
    // เพิ่มข้อมูลออเดอร์
    const orderRow = [
      orderId,
      orderNumber,
      subtotal,
      discount,
      '', // promotionId
      total,
      orderData.status || 'pending',
      now,
      now
    ];
    
    ordersSheet.appendRow(orderRow);
    
    // เพิ่มรายการสินค้าในออเดอร์
    const orderItems = [];
    if (orderData.items && orderData.items.length > 0) {
      orderData.items.forEach(item => {
        const itemId = generateId('item');
        const itemSubtotal = (item.quantity || 0) * (item.price || 0);
        
        const itemRow = [
          itemId,
          orderId,
          item.menuItemId || '',
          item.menuItemName || '',
          item.quantity || 0,
          item.price || 0,
          itemSubtotal
        ];
        
        orderItemsSheet.appendRow(itemRow);
        
        orderItems.push({
          id: itemId,
          orderId: orderId,
          menuItemId: item.menuItemId || '',
          menuItemName: item.menuItemName || '',
          quantity: item.quantity || 0,
          price: item.price || 0,
          subtotal: itemSubtotal
        });
      });
    }
    
    const createdOrder = {
      id: orderId,
      orderNumber: orderNumber,
      subtotal: subtotal,
      discount: discount,
      total: total,
      status: orderData.status || 'pending',
      items: orderItems,
      createdAt: now,
      updatedAt: now
    };
    
    return createResponse(true, 'Order created successfully via GET', createdOrder, e);
  } catch (error) {
    console.error('Error in handleCreateOrderFromGet:', error);
    return createResponse(false, 'Error creating order: ' + error.message, null, e);
  }
}

// สร้าง Reports sheet
function setupReportsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let reportSheet = ss.getSheetByName('Reports');
  if (!reportSheet) {
    reportSheet = ss.insertSheet('Reports');
    const reportHeaders = [
      'Date', 'TotalOrders', 'TotalRevenue', 'TotalCost', 
      'TotalProfit', 'ProfitMargin', 'TopSellingItem', 'GeneratedAt'
    ];
    reportSheet.getRange(1, 1, 1, reportHeaders.length).setValues([reportHeaders]);
  }
  
  // ลบ Sheet1 ถ้ามี
  try {
    const sheet1 = ss.getSheetByName('Sheet1');
    if (sheet1) {
      ss.deleteSheet(sheet1);
    }
  } catch (e) {
    // ไม่สำคัญถ้าลบไม่ได้
  }
}

// ===============================
// ฟังก์ชันทดสอบ
// ===============================

function testFunction() {
  return "Test successful! Google Apps Script is working.";
}

// ===============================
// การตั้งค่า Web App
// ===============================

function doGet(e) {
  try {
    // Log ข้อมูลที่ได้รับ
    console.log('doGet called');
    console.log('Event object:', e);
    
    // ตรวจสอบว่ามี parameter หรือไม่
    if (!e || !e.parameter) {
      console.log('No parameters found');
      return createResponse(false, 'No parameters provided. Try adding ?action=test to URL', null, e);
    }
    
    console.log('Parameters received:', e.parameter);
    const action = e.parameter.action;
    
    if (!action) {
      return createResponse(false, 'Action parameter is required. Available actions: test, getMenuItems', null, e);
    }
    
    console.log('Action:', action);
    
    switch (action) {
      case 'test':
        return createResponse(true, 'API is working correctly!', { timestamp: new Date() }, e);
      case 'setup':
        return setupDatabase(e);
      case 'getMenuItems':
        return handleGetMenuItems(e);
      case 'createMenuItem':
        return handleCreateMenuItemFromGet(e);
      case 'updateMenuItem':
        return handleUpdateMenuItemFromGet(e);
      case 'deleteMenuItem':
        return handleDeleteMenuItemFromGet(e);
      case 'createOrder':
        return handleCreateOrderFromGet(e);
      case 'getPromotions':
        return handleGetPromotions(e);
      case 'getOrders':
        return handleGetOrders(e);
      case 'getReports':
        return handleGetReports(e);
      default:
        return createResponse(false, 'Invalid action: ' + action + '. Available actions: test, setup, getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, createOrder, getPromotions, getOrders, getReports', null, e);
    }
  } catch (error) {
    console.error('Error in doGet:', error);
    return createResponse(false, 'Server error: ' + error.message, null, e);
  }
}

function doPost(e) {
  try {
    // ตรวจสอบว่ามี postData หรือไม่
    if (!e.postData || !e.postData.contents) {
      return createResponse(false, 'No post data provided', null);
    }
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (!action) {
      return createResponse(false, 'Action parameter is required', null);
    }
    
    switch (action) {
      case 'createMenuItem':
        return handleCreateMenuItem(data);
      case 'updateMenuItem':
        return handleUpdateMenuItem(data);
      case 'deleteMenuItem':
        return handleDeleteMenuItem(data);
      case 'createOrder':
        return handleCreateOrder(data);
      case 'updateOrder':
        return handleUpdateOrder(data);
      case 'applyPromotion':
        return handleApplyPromotion(data);
      default:
        return createResponse(false, 'Invalid action: ' + action, null);
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return createResponse(false, 'Error processing request: ' + error.message, null);
  }
}

// ===============================
// Helper Functions
// ===============================

function createResponse(success, message, data, eventObject) {
  const response = {
    success: success,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  };
  
  // ตรวจสอบว่ามี callback parameter สำหรับ JSONP หรือไม่
  if (eventObject && eventObject.parameter && eventObject.parameter.callback) {
    const callbackName = eventObject.parameter.callback;
    const jsonpResponse = callbackName + '(' + JSON.stringify(response) + ');';
    
    const output = ContentService.createTextOutput(jsonpResponse);
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    return output;
  }
  
  // Response ปกติสำหรับ JSON
  const output = ContentService.createTextOutput(JSON.stringify(response));
  output.setMimeType(ContentService.MimeType.JSON);
  
  return output;
}

function generateId(prefix) {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
}

// ===============================
// Menu Items API
// ===============================

function handleGetMenuItems(e) {
  try {
    console.log('handleGetMenuItems called');
    
    // สร้าง spreadsheet ใหม่ถ้าไม่มี
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!ss) {
      // สร้าง spreadsheet ใหม่
      ss = SpreadsheetApp.create('POS System Database');
      console.log('Created new spreadsheet');
    }
    
    console.log('Got spreadsheet:', ss ? 'Success' : 'Failed');
    
    let sheet = ss.getSheetByName('MenuItems');
    
    if (!sheet) {
      // สร้าง MenuItems sheet ถ้าไม่มี
      sheet = ss.insertSheet('MenuItems');
      
      // เพิ่ม headers
      const headers = [
        'ID', 'Name', 'Price', 'Cost', 'Category', 
        'Description', 'Image', 'Available', 'CreatedAt', 'UpdatedAt'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      console.log('Created MenuItems sheet with headers');
    }
    
    console.log('Got MenuItems sheet:', sheet ? 'Success' : 'Failed');
    
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    const lastRow = sheet.getLastRow();
    console.log('Last row:', lastRow);
    
    if (lastRow <= 1) {
      return createResponse(true, 'MenuItems sheet is empty', [], e);
    }
    
    const data = sheet.getDataRange().getValues();
    console.log('Data rows:', data.length);
    
    const menuItems = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // ถ้ามี ID
        const menuItem = {
          id: row[0],
          name: row[1],
          price: row[2],
          cost: row[3],
          category: row[4],
          description: row[5],
          image: row[6],
          available: row[7] === 'TRUE' || row[7] === true || row[7] === 'true',
          createdAt: row[8],
          updatedAt: row[9]
        };
        menuItems.push(menuItem);
      }
    }
    
    console.log('Menu items found:', menuItems.length);
    return createResponse(true, 'Menu items retrieved successfully', menuItems, e);
  } catch (error) {
    console.error('Error in handleGetMenuItems:', error);
    return createResponse(false, 'Error retrieving menu items: ' + error.message, null, e);
  }
}

function handleCreateMenuItemFromGet(e) {
  try {
    console.log('handleCreateMenuItemFromGet called');
    console.log('Parameters:', e.parameter);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('MenuItems');
    
    if (!sheet) {
      // สร้าง MenuItems sheet ถ้าไม่มี
      sheet = ss.insertSheet('MenuItems');
      const headers = [
        'ID', 'Name', 'Price', 'Cost', 'Category', 
        'Description', 'Image', 'Available', 'CreatedAt', 'UpdatedAt'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // อ่านข้อมูลจาก URL parameters
    const params = e.parameter;
    const now = new Date().toISOString();
    const id = generateId('menu');
    
    const newRow = [
      id,
      params.name || '',
      parseFloat(params.price) || 0,
      parseFloat(params.cost) || 0,
      params.category || '',
      params.description || '',
      params.image || '',
      params.available === 'true' ? 'TRUE' : 'FALSE',
      now,
      now
    ];
    
    sheet.appendRow(newRow);
    
    const createdItem = {
      id: id,
      name: params.name || '',
      price: parseFloat(params.price) || 0,
      cost: parseFloat(params.cost) || 0,
      category: params.category || '',
      description: params.description || '',
      image: params.image || '',
      available: params.available === 'true',
      createdAt: now,
      updatedAt: now
    };
    
    return createResponse(true, 'Menu item created successfully via GET', createdItem, e);
  } catch (error) {
    console.error('Error in handleCreateMenuItemFromGet:', error);
    return createResponse(false, 'Error creating menu item: ' + error.message, null, e);
  }
}

function handleUpdateMenuItemFromGet(e) {
  try {
    console.log('handleUpdateMenuItemFromGet called');
    console.log('Parameters:', e.parameter);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('MenuItems');
    
    if (!sheet) {
      return createResponse(false, 'MenuItems sheet not found', null, e);
    }
    
    // อ่านข้อมูลจาก URL parameters
    const params = e.parameter;
    const id = params.id;
    
    if (!id) {
      return createResponse(false, 'Menu item ID is required', null, e);
    }
    
    // หา row ที่ต้องแก้ไข
    const data = sheet.getDataRange().getValues();
    let targetRowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) { // Column A = ID
        targetRowIndex = i + 1; // +1 เพราะ getRange ใช้ 1-based index
        break;
      }
    }
    
    if (targetRowIndex === -1) {
      return createResponse(false, 'Menu item not found', null, e);
    }
    
    const now = new Date().toISOString();
    
    // อัปเดตข้อมูล (เฉพาะ field ที่ส่งมา)
    if (params.name !== undefined) sheet.getRange(targetRowIndex, 2).setValue(params.name);
    if (params.price !== undefined) sheet.getRange(targetRowIndex, 3).setValue(parseFloat(params.price) || 0);
    if (params.cost !== undefined) sheet.getRange(targetRowIndex, 4).setValue(parseFloat(params.cost) || 0);
    if (params.category !== undefined) sheet.getRange(targetRowIndex, 5).setValue(params.category);
    if (params.description !== undefined) sheet.getRange(targetRowIndex, 6).setValue(params.description);
    if (params.image !== undefined) sheet.getRange(targetRowIndex, 7).setValue(params.image);
    if (params.available !== undefined) sheet.getRange(targetRowIndex, 8).setValue(params.available === 'true' ? 'TRUE' : 'FALSE');
    
    // อัปเดต UpdatedAt เสมอ
    sheet.getRange(targetRowIndex, 10).setValue(now);
    
    // อ่านข้อมูลที่อัปเดตแล้ว
    const updatedRow = sheet.getRange(targetRowIndex, 1, 1, 10).getValues()[0];
    
    const updatedItem = {
      id: updatedRow[0],
      name: updatedRow[1],
      price: updatedRow[2],
      cost: updatedRow[3],
      category: updatedRow[4],
      description: updatedRow[5],
      image: updatedRow[6],
      available: updatedRow[7] === 'TRUE' || updatedRow[7] === true || updatedRow[7] === 'true',
      createdAt: updatedRow[8],
      updatedAt: updatedRow[9]
    };
    
    return createResponse(true, 'Menu item updated successfully', updatedItem, e);
  } catch (error) {
    console.error('Error in handleUpdateMenuItemFromGet:', error);
    return createResponse(false, 'Error updating menu item: ' + error.message, null, e);
  }
}

function handleDeleteMenuItemFromGet(e) {
  try {
    console.log('handleDeleteMenuItemFromGet called');
    console.log('Parameters:', e.parameter);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('MenuItems');
    
    if (!sheet) {
      return createResponse(false, 'MenuItems sheet not found', null, e);
    }
    
    // อ่านข้อมูลจาก URL parameters
    const params = e.parameter;
    const id = params.id;
    
    if (!id) {
      return createResponse(false, 'Menu item ID is required', null, e);
    }
    
    // หา row ที่ต้องลบ
    const data = sheet.getDataRange().getValues();
    let targetRowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) { // Column A = ID
        targetRowIndex = i + 1; // +1 เพราะ deleteRows ใช้ 1-based index
        break;
      }
    }
    
    if (targetRowIndex === -1) {
      return createResponse(false, 'Menu item not found', null, e);
    }
    
    // ลบ row
    sheet.deleteRows(targetRowIndex, 1);
    
    return createResponse(true, 'Menu item deleted successfully', null, e);
  } catch (error) {
    console.error('Error in handleDeleteMenuItemFromGet:', error);
    return createResponse(false, 'Error deleting menu item: ' + error.message, null, e);
  }
}

function handleCreateMenuItem(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('MenuItems');
    
    if (!sheet) {
      return createResponse(false, 'MenuItems sheet not found', null);
    }
    
    const menuItem = data.menuItem;
    const now = new Date().toISOString();
    const id = generateId('menu');
    
    const newRow = [
      id,
      menuItem.name,
      menuItem.price,
      menuItem.cost,
      menuItem.category,
      menuItem.description || '',
      menuItem.image || '',
      menuItem.available ? 'TRUE' : 'FALSE',
      now,
      now
    ];
    
    sheet.appendRow(newRow);
    
    const createdItem = {
      id: id,
      name: menuItem.name,
      price: menuItem.price,
      cost: menuItem.cost,
      category: menuItem.category,
      description: menuItem.description || '',
      image: menuItem.image || '',
      available: menuItem.available,
      createdAt: now,
      updatedAt: now
    };
    
    return createResponse(true, 'Menu item created successfully', createdItem);
  } catch (error) {
    return createResponse(false, error.message, null);
  }
}

function handleUpdateMenuItem(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('MenuItems');
    
    if (!sheet) {
      return createResponse(false, 'MenuItems sheet not found', null);
    }
    
    const menuItemId = data.id;
    const menuItem = data.menuItem;
    const sheetData = sheet.getDataRange().getValues();
    
    // หาแถวที่ต้องอัปเดต
    let rowIndex = -1;
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === menuItemId) {
        rowIndex = i + 1; // +1 เพราะ getRange ใช้ 1-based index
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Menu item not found', null);
    }
    
    const now = new Date().toISOString();
    
    // อัปเดตข้อมูล
    sheet.getRange(rowIndex, 2).setValue(menuItem.name);
    sheet.getRange(rowIndex, 3).setValue(menuItem.price);
    sheet.getRange(rowIndex, 4).setValue(menuItem.cost);
    sheet.getRange(rowIndex, 5).setValue(menuItem.category);
    sheet.getRange(rowIndex, 6).setValue(menuItem.description || '');
    sheet.getRange(rowIndex, 7).setValue(menuItem.image || '');
    sheet.getRange(rowIndex, 8).setValue(menuItem.available ? 'TRUE' : 'FALSE');
    sheet.getRange(rowIndex, 10).setValue(now); // UpdatedAt
    
    const updatedItem = {
      id: menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      cost: menuItem.cost,
      category: menuItem.category,
      description: menuItem.description || '',
      image: menuItem.image || '',
      available: menuItem.available,
      updatedAt: now
    };
    
    return createResponse(true, 'Menu item updated successfully', updatedItem);
  } catch (error) {
    return createResponse(false, error.message, null);
  }
}

function handleDeleteMenuItem(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('MenuItems');
    
    if (!sheet) {
      return createResponse(false, 'MenuItems sheet not found', null);
    }
    
    const menuItemId = data.id;
    const sheetData = sheet.getDataRange().getValues();
    
    // หาแถวที่ต้องลบ
    let rowIndex = -1;
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === menuItemId) {
        rowIndex = i + 1; // +1 เพราะ deleteRow ใช้ 1-based index
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Menu item not found', null);
    }
    
    sheet.deleteRow(rowIndex);
    
    return createResponse(true, 'Menu item deleted successfully', { id: menuItemId });
  } catch (error) {
    return createResponse(false, error.message, null);
  }
}

// ===============================
// Promotions API
// ===============================

function handleGetPromotions(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Promotions');
    
    if (!sheet) {
      return createResponse(false, 'Promotions sheet not found', null);
    }
    
    const data = sheet.getDataRange().getValues();
    const promotions = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // ถ้ามี ID
        const promotion = {
          id: row[0],
          name: row[1],
          description: row[2],
          discountType: row[3],
          discountValue: row[4],
          minOrderAmount: row[5],
          startDate: row[6],
          endDate: row[7],
          active: row[8] === 'TRUE',
          createdAt: row[9],
          updatedAt: row[10]
        };
        promotions.push(promotion);
      }
    }
    
    return createResponse(true, 'Promotions retrieved successfully', promotions);
  } catch (error) {
    return createResponse(false, error.message, null);
  }
}

// ===============================
// Orders API
// ===============================

function handleCreateOrder(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ordersSheet = ss.getSheetByName('Orders');
    const orderItemsSheet = ss.getSheetByName('OrderItems');
    
    if (!ordersSheet || !orderItemsSheet) {
      return createResponse(false, 'Orders or OrderItems sheet not found', null);
    }
    
    const order = data.order;
    const now = new Date().toISOString();
    const orderId = generateId('order');
    const orderNumber = generateOrderNumber();
    
    // คำนวณยอดรวม
    let subtotal = 0;
    order.items.forEach(item => {
      subtotal += item.quantity * item.price;
    });
    
    const discount = order.discount || 0;
    const total = subtotal - discount;
    
    // เพิ่มข้อมูลออเดอร์
    const orderRow = [
      orderId,
      orderNumber,
      subtotal,
      discount,
      order.promotionId || '',
      total,
      order.status || 'pending',
      now,
      now
    ];
    
    ordersSheet.appendRow(orderRow);
    
    // เพิ่มรายการสินค้าในออเดอร์
    const orderItems = [];
    order.items.forEach(item => {
      const itemId = generateId('item');
      const itemRow = [
        itemId,
        orderId,
        item.menuItemId,
        item.menuItemName,
        item.quantity,
        item.price,
        item.quantity * item.price
      ];
      
      orderItemsSheet.appendRow(itemRow);
      
      orderItems.push({
        id: itemId,
        orderId: orderId,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      });
    });
    
    const createdOrder = {
      id: orderId,
      orderNumber: orderNumber,
      subtotal: subtotal,
      discount: discount,
      promotionId: order.promotionId || '',
      total: total,
      status: order.status || 'pending',
      items: orderItems,
      createdAt: now,
      updatedAt: now
    };
    
    return createResponse(true, 'Order created successfully', createdOrder);
  } catch (error) {
    return createResponse(false, error.message, null);
  }
}

function handleGetOrders(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ordersSheet = ss.getSheetByName('Orders');
    const orderItemsSheet = ss.getSheetByName('OrderItems');
    
    if (!ordersSheet || !orderItemsSheet) {
      return createResponse(false, 'Orders or OrderItems sheet not found', null, e);
    }
    
    const ordersData = ordersSheet.getDataRange().getValues();
    const itemsData = orderItemsSheet.getDataRange().getValues();
    
    // สร้าง map ของ order items
    const itemsMap = {};
    for (let i = 1; i < itemsData.length; i++) {
      const row = itemsData[i];
      if (row[0]) {
        const orderId = row[1];
        if (!itemsMap[orderId]) {
          itemsMap[orderId] = [];
        }
        itemsMap[orderId].push({
          id: row[0],
          menuItemId: row[2],
          menuItem: {
            id: row[2],
            name: row[3],
            price: row[5]
          },
          quantity: row[4],
          price: row[5],
          subtotal: row[6]
        });
      }
    }
    
    const orders = [];
    for (let i = 1; i < ordersData.length; i++) {
      const row = ordersData[i];
      if (row[0]) {
        const order = {
          id: row[0],
          orderNumber: row[1],
          subtotal: row[2],
          discount: row[3],
          promotionId: row[4],
          total: row[5],
          status: row[6],
          items: itemsMap[row[0]] || [],
          createdAt: row[7],
          updatedAt: row[8]
        };
        orders.push(order);
      }
    }
    
    return createResponse(true, 'Orders retrieved successfully', orders, e);
  } catch (error) {
    return createResponse(false, error.message, null, e);
  }
}

function handleUpdateOrder(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Orders');
    
    if (!sheet) {
      return createResponse(false, 'Orders sheet not found', null);
    }
    
    const orderId = data.id;
    const updates = data.updates;
    const sheetData = sheet.getDataRange().getValues();
    
    // หาแถวที่ต้องอัปเดต
    let rowIndex = -1;
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === orderId) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse(false, 'Order not found', null);
    }
    
    const now = new Date().toISOString();
    
    // อัปเดตสถานะ
    if (updates.status) {
      sheet.getRange(rowIndex, 7).setValue(updates.status);
    }
    
    // อัปเดต UpdatedAt
    sheet.getRange(rowIndex, 9).setValue(now);
    
    return createResponse(true, 'Order updated successfully', { id: orderId, updatedAt: now });
  } catch (error) {
    return createResponse(false, error.message, null);
  }
}

// ===============================
// Promotions API
// ===============================

function handleApplyPromotion(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Promotions');
    
    if (!sheet) {
      return createResponse(false, 'Promotions sheet not found', null);
    }
    
    const promotionId = data.promotionId;
    const orderAmount = data.orderAmount;
    
    const sheetData = sheet.getDataRange().getValues();
    let promotion = null;
    
    // หาโปรโมชัน
    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      if (row[0] === promotionId && row[8] === 'TRUE') { // Active promotion
        promotion = {
          id: row[0],
          name: row[1],
          description: row[2],
          discountType: row[3],
          discountValue: row[4],
          minOrderAmount: row[5]
        };
        break;
      }
    }
    
    if (!promotion) {
      return createResponse(false, 'Promotion not found or inactive', null);
    }
    
    // ตรวจสอบเงื่อนไขขั้นต่ำ
    if (orderAmount < promotion.minOrderAmount) {
      return createResponse(false, `Minimum order amount is ${promotion.minOrderAmount} baht`, null);
    }
    
    // คำนวณส่วนลด
    let discountAmount = 0;
    if (promotion.discountType === 'percentage') {
      discountAmount = (orderAmount * promotion.discountValue) / 100;
    } else if (promotion.discountType === 'fixed') {
      discountAmount = promotion.discountValue;
    }
    
    const finalAmount = orderAmount - discountAmount;
    
    const result = {
      promotion: promotion,
      originalAmount: orderAmount,
      discountAmount: discountAmount,
      finalAmount: finalAmount
    };
    
    return createResponse(true, 'Promotion applied successfully', result);
  } catch (error) {
    return createResponse(false, error.message, null);
  }
}

// ===============================
// Reports API
// ===============================

function handleGetReports(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Reports');
    
    if (!sheet) {
      return createResponse(false, 'Reports sheet not found', null);
    }
    
    const data = sheet.getDataRange().getValues();
    const reports = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {
        const report = {
          date: row[0],
          totalOrders: row[1],
          totalRevenue: row[2],
          totalCost: row[3],
          totalProfit: row[4],
          profitMargin: row[5],
          topSellingItem: row[6],
          generatedAt: row[7]
        };
        reports.push(report);
      }
    }
    
    return createResponse(true, 'Reports retrieved successfully', reports);
  } catch (error) {
    return createResponse(false, error.message, null);
  }
}

// ===============================
// Utility Functions
// ===============================

function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// ===============================
// CORS Support - Google Apps Script handles this automatically
// ===============================

// Note: Google Apps Script automatically handles CORS for web apps
// No additional CORS configuration needed
