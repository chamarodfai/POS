import { GoogleAuth } from 'google-auth-library';
import { sheets_v4, google } from 'googleapis';
import { MenuItem, Promotion, Order, OrderItem } from '../types';

export class GoogleSheetsDatabase {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;
  private auth: GoogleAuth;

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      // ใช้ Service Account หรือ API Key
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || './service-account-key.json',
    });
    
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '';
    
    this.initializeSheets();
  }

  private async initializeSheets(): Promise<void> {
    try {
      // ตรวจสอบว่า spreadsheet มีอยู่หรือไม่
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      
      // เพิ่มข้อมูลตัวอย่างถ้ายังไม่มี
      await this.insertSampleData();
    } catch (error) {
      console.log('Spreadsheet not found or no access, creating sample data...');
      await this.createSampleSpreadsheet();
    }
  }

  private async createSampleSpreadsheet(): Promise<void> {
    try {
      // สร้าง spreadsheet ใหม่ (ถ้าต้องการ)
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: 'POS Database - Beverage Shop',
          },
          sheets: [
            { properties: { title: 'MenuItems' } },
            { properties: { title: 'Promotions' } },
            { properties: { title: 'Orders' } },
            { properties: { title: 'OrderItems' } },
          ],
        },
      });
      
      this.spreadsheetId = response.data.spreadsheetId || '';
      console.log(`Created new spreadsheet: ${this.spreadsheetId}`);
      
      await this.insertSampleData();
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
    }
  }

  private async insertSampleData(): Promise<void> {
    try {
      // Headers สำหรับ MenuItems
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'MenuItems!A1:J1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Name', 'Price', 'Cost', 'Category', 'Description', 'Image', 'Available', 'CreatedAt', 'UpdatedAt']],
        },
      });

      // ข้อมูลตัวอย่าง MenuItems
      const sampleMenuItems = [
        ['menu-1', 'กาแฟอเมริกาโน่', 45, 25, 'กาแฟ', 'กาแฟอเมริกาโน่หอมกรุ่น', '', true, new Date().toISOString(), new Date().toISOString()],
        ['menu-2', 'กาแฟลาเต้', 55, 32, 'กาแฟ', 'กาแฟลาเต้นมข้นหวาน', '', true, new Date().toISOString(), new Date().toISOString()],
        ['menu-3', 'กาแฟคาปูชิโน่', 60, 35, 'กาแฟ', 'กาแฟคาปูชิโน่โฟมนุ่ม', '', true, new Date().toISOString(), new Date().toISOString()],
        ['menu-4', 'ชาเขียวมัทฉะ', 65, 42, 'ชา', 'ชาเขียวมัทฉะแท้จากญี่ปุ่น', '', true, new Date().toISOString(), new Date().toISOString()],
        ['menu-5', 'ชาไทย', 40, 22, 'ชา', 'ชาไทยแท้รสชาติเข้มข้น', '', true, new Date().toISOString(), new Date().toISOString()],
        ['menu-6', 'สมูทตี้มะม่วง', 70, 38, 'สมูทตี้', 'สมูทตี้มะม่วงสด', '', true, new Date().toISOString(), new Date().toISOString()],
        ['menu-7', 'น้ำส้มคั้นสด', 50, 18, 'น้ำผลไม้', 'น้ำส้มคั้นสด 100%', '', true, new Date().toISOString(), new Date().toISOString()],
        ['menu-8', 'เลมอนเสด', 45, 20, 'น้ำผลไม้', 'เลมอนเสดเปร้ยวหวาน', '', true, new Date().toISOString(), new Date().toISOString()],
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'MenuItems!A2:J9',
        valueInputOption: 'RAW',
        requestBody: {
          values: sampleMenuItems,
        },
      });

      // Headers สำหรับ Promotions
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'Promotions!A1:I1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Name', 'Description', 'DiscountType', 'DiscountValue', 'MinOrderAmount', 'StartDate', 'EndDate', 'Active']],
        },
      });

      // ข้อมูลตัวอย่าง Promotions
      const samplePromotions = [
        ['promo-1', 'ลดราคา 10% เมื่อซื้อครบ 200 บาท', 'รับส่วนลด 10% เมื่อซื้อครบ 200 บาท', 'percentage', 10, 200, '2025-01-01', '2025-12-31', true],
        ['promo-2', 'ลดทันที 20 บาท', 'ลดทันที 20 บาท สำหรับทุกออเดอร์', 'fixed', 20, 100, '2025-01-01', '2025-12-31', true],
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'Promotions!A2:I3',
        valueInputOption: 'RAW',
        requestBody: {
          values: samplePromotions,
        },
      });

      // Headers สำหรับ Orders
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'Orders!A1:H1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'OrderNumber', 'Subtotal', 'Discount', 'PromotionID', 'Total', 'Status', 'CreatedAt']],
        },
      });

      // Headers สำหรับ OrderItems
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'OrderItems!A1:F1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'OrderID', 'MenuItemID', 'Quantity', 'Price', 'Subtotal']],
        },
      });

      console.log('Sample data inserted successfully');
    } catch (error) {
      console.error('Error inserting sample data:', error);
    }
  }

  // Menu Items methods
  async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'MenuItems!A2:J1000', // เพิ่ม cost และ updatedAt columns
      });

      const rows = response.data.values || [];
      return rows.map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        price: parseFloat(row[2]) || 0,
        cost: parseFloat(row[3]) || 0, // เพิ่ม cost field
        category: row[4] || '',
        description: row[5] || '',
        image: row[6] || '',
        available: row[7] === 'true' || row[7] === true,
        createdAt: row[8] || new Date().toISOString(),
        updatedAt: row[9] || new Date().toISOString(),
      })).filter(item => item.id); // กรองแถวว่าง
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  }

  async getMenuItemById(id: string): Promise<MenuItem | null> {
    try {
      const menuItems = await this.getAllMenuItems();
      return menuItems.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Error fetching menu item by ID:', error);
      return null;
    }
  }

  async createMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    try {
      const now = new Date().toISOString();
      const newId = `menu-${Date.now()}`;
      const newItem: MenuItem = {
        id: newId,
        ...item,
        createdAt: now,
        updatedAt: now
      };

      const newRow = [
        newItem.id,
        newItem.name,
        newItem.price,
        newItem.cost || 0,
        newItem.category,
        newItem.description || '',
        newItem.image || '',
        newItem.available,
        newItem.createdAt,
        newItem.updatedAt
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'MenuItems!A:J',
        valueInputOption: 'RAW',
        requestBody: {
          values: [newRow],
        },
      });

      return newItem;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    try {
      // หาแถวที่ต้องอัปเดต
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'MenuItems!A:J',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === id);
      
      if (rowIndex === -1) {
        return null;
      }

      const currentRow = rows[rowIndex];
      const updatedRow = [
        currentRow[0], // ID
        updates.name !== undefined ? updates.name : currentRow[1],
        updates.price !== undefined ? updates.price : currentRow[2],
        updates.cost !== undefined ? updates.cost : currentRow[3],
        updates.category !== undefined ? updates.category : currentRow[4],
        updates.description !== undefined ? updates.description : currentRow[5],
        updates.image !== undefined ? updates.image : currentRow[6],
        updates.available !== undefined ? updates.available : currentRow[7],
        currentRow[8], // CreatedAt (ไม่เปลี่ยน)
        new Date().toISOString(), // UpdatedAt
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `MenuItems!A${rowIndex + 1}:J${rowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [updatedRow],
        },
      });

      // Return updated item
      return {
        id: updatedRow[0],
        name: updatedRow[1],
        price: parseFloat(updatedRow[2]),
        cost: parseFloat(updatedRow[3]),
        category: updatedRow[4],
        description: updatedRow[5],
        image: updatedRow[6],
        available: updatedRow[7] === 'true' || updatedRow[7] === true,
        createdAt: updatedRow[8],
        updatedAt: updatedRow[9],
      };
    } catch (error) {
      console.error('Error updating menu item:', error);
      return null;
    }
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      // หาแถวที่ต้องลบ
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'MenuItems!A:H',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === id);
      
      if (rowIndex === -1) {
        return false;
      }

      // ลบแถว
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0, // MenuItems sheet
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      });

      return true;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      return false;
    }
  }

  // Promotions methods
  async getAllPromotions(): Promise<Promotion[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Promotions!A2:I1000',
      });

      const rows = response.data.values || [];
      return rows.map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        description: row[2] || '',
        discountType: (row[3] || 'percentage') as 'percentage' | 'fixed',
        discountValue: parseFloat(row[4]) || 0,
        minOrderAmount: row[5] ? parseFloat(row[5]) : undefined,
        startDate: row[6] || '',
        endDate: row[7] || '',
        active: row[8] === 'true' || row[8] === true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching promotions:', error);
      return [];
    }
  }

  // Orders methods
  generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    // สำหรับ Google Sheets เราจะใช้ timestamp เป็นตัวเลขลำดับ
    const orderCount = Date.now() % 10000; // ใช้ 4 หลักสุดท้ายของ timestamp
    return `${datePrefix}${String(orderCount).padStart(4, '0')}`;
  }

  async createOrder(order: Omit<Order, 'createdAt' | 'updatedAt' | 'orderNumber'>): Promise<Order> {
    try {
      const orderNumber = this.generateOrderNumber();
      const now = new Date().toISOString();

      // เพิ่ม Order
      const orderRow = [
        order.id,
        orderNumber,
        order.subtotal,
        order.discount,
        order.promotionId || '',
        order.total,
        order.status,
        now,
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Orders!A:H',
        valueInputOption: 'RAW',
        requestBody: {
          values: [orderRow],
        },
      });

      // เพิ่ม OrderItems
      const orderItemRows = order.items.map(item => [
        item.id,
        order.id,
        item.menuItemId,
        item.quantity,
        item.price,
        item.subtotal,
      ]);

      if (orderItemRows.length > 0) {
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: 'OrderItems!A:F',
          valueInputOption: 'RAW',
          requestBody: {
            values: orderItemRows,
          },
        });
      }

      return { ...order, orderNumber, createdAt: now, updatedAt: now };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      // ดึงข้อมูล Orders
      const ordersResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Orders!A2:H1000',
      });

      // ดึงข้อมูล OrderItems
      const orderItemsResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'OrderItems!A2:F1000',
      });

      // ดึงข้อมูล MenuItems เพื่อใช้ join
      const menuItems = await this.getAllMenuItems();

      const orderRows = ordersResponse.data.values || [];
      const orderItemRows = orderItemsResponse.data.values || [];

      return orderRows.map(row => {
        const orderId = row[0];
        
        // หา OrderItems ที่เป็นของ Order นี้
        const items = orderItemRows
          .filter(itemRow => itemRow[1] === orderId)
          .map(itemRow => {
            const menuItem = menuItems.find(mi => mi.id === itemRow[2]);
            return {
              id: itemRow[0],
              menuItemId: itemRow[2],
              menuItem,
              quantity: parseInt(itemRow[3]) || 0,
              price: parseFloat(itemRow[4]) || 0,
              subtotal: parseFloat(itemRow[5]) || 0,
            };
          });

        return {
          id: orderId,
          orderNumber: row[1] || '',
          items,
          subtotal: parseFloat(row[2]) || 0,
          discount: parseFloat(row[3]) || 0,
          promotionId: row[4] || undefined,
          total: parseFloat(row[5]) || 0,
          status: (row[6] || 'pending') as 'pending' | 'confirmed' | 'completed' | 'cancelled',
          createdAt: row[7] || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  getSpreadsheetId(): string {
    return this.spreadsheetId;
  }
}
