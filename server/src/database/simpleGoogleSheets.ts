// Simple Google Sheets Database (Public Read-Only)
// ใช้สำหรับ demo โดยไม่ต้องตั้งค่า authentication

export class SimpleGoogleSheetsDatabase {
  private spreadsheetId: string;
  private apiKey: string;

  constructor() {
    // ใช้ spreadsheet สาธารณะที่มีข้อมูลตัวอย่าง
    this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
    this.apiKey = process.env.GOOGLE_API_KEY || '';
  }

  private async fetchSheetData(range: string): Promise<any[][]> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      return [];
    }
  }

  async getAllMenuItems() {
    // สำหรับ demo ใช้ข้อมูลตัวอย่าง
    return [
      {
        id: 'menu-1',
        name: 'กาแฟอเมริกาโน่',
        price: 45,
        cost: 25, // ต้นทุน 25 บาท กำไร 20 บาท
        category: 'กาแฟ',
        description: 'กาแฟอเมริกาโน่หอมกรุ่น',
        image: '',
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'menu-2',
        name: 'กาแฟลาเต้',
        price: 55,
        cost: 30, // ต้นทุน 30 บาท กำไร 25 บาท
        category: 'กาแฟ',
        description: 'กาแฟลาเต้นมข้นหวาน',
        image: '',
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'menu-3',
        name: 'กาแฟคาปูชิโน่',
        price: 60,
        cost: 32, // ต้นทุน 32 บาท กำไร 28 บาท
        category: 'กาแฟ',
        description: 'กาแฟคาปูชิโน่โฟมนุ่ม',
        image: '',
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'menu-4',
        name: 'ชาเขียวมัทฉะ',
        price: 65,
        cost: 35, // ต้นทุน 35 บาท กำไร 30 บาท
        category: 'ชา',
        description: 'ชาเขียวมัทฉะแท้จากญี่ปุ่น',
        image: '',
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'menu-5',
        name: 'ชาไทย',
        price: 40,
        cost: 18, // ต้นทุน 18 บาท กำไร 22 บาท
        category: 'ชา',
        description: 'ชาไทยแท้รสชาติเข้มข้น',
        image: '',
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'menu-6',
        name: 'สมูทตี้มะม่วง',
        price: 70,
        cost: 42, // ต้นทุน 42 บาท กำไร 28 บาท
        category: 'สมูทตี้',
        description: 'สมูทตี้มะม่วงสด',
        image: '',
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'menu-7',
        name: 'น้ำส้มคั้นสด',
        price: 50,
        cost: 28, // ต้นทุน 28 บาท กำไร 22 บาท
        category: 'น้ำผลไม้',
        description: 'น้ำส้มคั้นสด 100%',
        image: '',
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'menu-8',
        name: 'เลมอนเสด',
        price: 45,
        cost: 22, // ต้นทุน 22 บาท กำไร 23 บาท
        category: 'น้ำผลไม้',
        description: 'เลมอนเสดเปร้ยวหวาน',
        image: '',
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async createMenuItem(item: any) {
    // สำหรับ demo แค่ return ข้อมูลที่ส่งมา
    console.log('Demo: Creating menu item:', item.name);
    return { ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }

  async updateMenuItem(id: string, updates: any) {
    console.log('Demo: Updating menu item:', id, updates);
    return { ...updates, updatedAt: new Date().toISOString() };
  }

  async deleteMenuItem(id: string) {
    console.log('Demo: Deleting menu item:', id);
    return true;
  }

  async getAllPromotions() {
    return [
      {
        id: 'promo-1',
        name: 'ลดราคา 10% เมื่อซื้อครบ 200 บาท',
        description: 'รับส่วนลด 10% เมื่อซื้อครบ 200 บาท',
        discountType: 'percentage' as const,
        discountValue: 10,
        minOrderAmount: 200,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'promo-2',
        name: 'ลดทันที 20 บาท',
        description: 'ลดทันที 20 บาท สำหรับทุกออเดอร์',
        discountType: 'fixed' as const,
        discountValue: 20,
        minOrderAmount: 100,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const orderCount = Math.floor(Math.random() * 9999) + 1;
    return `${year}${month}${day}${String(orderCount).padStart(4, '0')}`;
  }

  async createOrder(order: any) {
    const orderNumber = this.generateOrderNumber();
    const now = new Date().toISOString();
    console.log('Demo: Creating order:', orderNumber);
    return { ...order, orderNumber, createdAt: now, updatedAt: now };
  }

  async getAllOrders() {
    return [];
  }

  getSpreadsheetId(): string {
    return this.spreadsheetId;
  }
}
