import sqlite3 from 'sqlite3';
import { MenuItem, Promotion, Order, OrderItem } from '../types';

export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string = './pos.db') {
    this.db = new sqlite3.Database(dbPath);
    this.initializeTables();
  }

  private initializeTables(): void {
    this.db.serialize(() => {
      // Menu Items table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS menu_items (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          image TEXT,
          available BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Promotions table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS promotions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          discount_type TEXT NOT NULL,
          discount_value REAL NOT NULL,
          min_order_amount REAL,
          start_date DATETIME NOT NULL,
          end_date DATETIME NOT NULL,
          active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Orders table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          order_number TEXT UNIQUE NOT NULL,
          subtotal REAL NOT NULL,
          discount REAL DEFAULT 0,
          promotion_id TEXT,
          total REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (promotion_id) REFERENCES promotions (id)
        )
      `);

      // Order Items table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          menu_item_id TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          subtotal REAL NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
        )
      `);

      // Insert sample data after tables are created
      this.insertSampleData();
    });
  }

  private insertSampleData(): void {
    // Sample menu items
    const sampleMenuItems = [
      { id: 'menu-1', name: 'กาแฟอเมริกาโน่', price: 45, category: 'กาแฟ', description: 'กาแฟอเมริกาโน่หอมกรุ่น' },
      { id: 'menu-2', name: 'กาแฟลาเต้', price: 55, category: 'กาแฟ', description: 'กาแฟลาเต้นมข้นหวาน' },
      { id: 'menu-3', name: 'กาแฟคาปูชิโน่', price: 60, category: 'กาแฟ', description: 'กาแฟคาปูชิโน่โฟมนุ่ม' },
      { id: 'menu-4', name: 'ชาเขียวมัทฉะ', price: 65, category: 'ชา', description: 'ชาเขียวมัทฉะแท้จากญี่ปุ่น' },
      { id: 'menu-5', name: 'ชาไทย', price: 40, category: 'ชา', description: 'ชาไทยแท้รสชาติเข้มข้น' },
      { id: 'menu-6', name: 'สมูทตี้มะม่วง', price: 70, category: 'สมูทตี้', description: 'สมูทตี้มะม่วงสด' },
      { id: 'menu-7', name: 'น้ำส้มคั้นสด', price: 50, category: 'น้ำผลไม้', description: 'น้ำส้มคั้นสด 100%' },
      { id: 'menu-8', name: 'เลมอนเสด', price: 45, category: 'น้ำผลไม้', description: 'เลมอนเสดเปร้ยวหวาน' }
    ];

    sampleMenuItems.forEach(item => {
      this.db.run(`
        INSERT OR IGNORE INTO menu_items (id, name, price, category, description, available)
        VALUES (?, ?, ?, ?, ?, 1)
      `, [item.id, item.name, item.price, item.category, item.description]);
    });

    // Sample promotions
    const samplePromotions = [
      {
        id: 'promo-1',
        name: 'ลดราคา 10% เมื่อซื้อครบ 200 บาท',
        description: 'รับส่วนลด 10% เมื่อซื้อครบ 200 บาท',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 200,
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      },
      {
        id: 'promo-2',
        name: 'ลดทันที 20 บาท',
        description: 'ลดทันที 20 บาท สำหรับทุกออเดอร์',
        discountType: 'fixed',
        discountValue: 20,
        minOrderAmount: 100,
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      }
    ];

    samplePromotions.forEach(promo => {
      this.db.run(`
        INSERT OR IGNORE INTO promotions (id, name, description, discount_type, discount_value, min_order_amount, start_date, end_date, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [promo.id, promo.name, promo.description, promo.discountType, promo.discountValue, promo.minOrderAmount, promo.startDate, promo.endDate]);
    });
  }

  // Menu Items methods
  getAllMenuItems(): Promise<MenuItem[]> {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT id, name, price, category, description, image, available, created_at, updated_at
        FROM menu_items
        ORDER BY category, name
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as MenuItem[]);
      });
    });
  }

  createMenuItem(item: Omit<MenuItem, 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      this.db.run(`
        INSERT INTO menu_items (id, name, price, category, description, image, available, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [item.id, item.name, item.price, item.category, item.description, item.image, item.available, now, now],
      function(err) {
        if (err) reject(err);
        else resolve({ ...item, createdAt: now, updatedAt: now });
      });
    });
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt').map(key => `${key} = ?`).join(', ');
      const values = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt').map(key => (updates as any)[key]);
      
      this.db.run(`
        UPDATE menu_items SET ${fields}, updated_at = ? WHERE id = ?
      `, [...values, now, id], function(err) {
        if (err) reject(err);
        else {
          // Return updated item
          resolve({ ...updates, updatedAt: now } as MenuItem);
        }
      });
    });
  }

  deleteMenuItem(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM menu_items WHERE id = ?`, [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  // Promotions methods
  getAllPromotions(): Promise<Promotion[]> {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT id, name, description, discount_type, discount_value, min_order_amount, start_date, end_date, active, created_at, updated_at
        FROM promotions
        ORDER BY created_at DESC
      `, (err, rows: any[]) => {
        if (err) reject(err);
        else {
          const promotions = rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            discountType: row.discount_type,
            discountValue: row.discount_value,
            minOrderAmount: row.min_order_amount,
            startDate: row.start_date,
            endDate: row.end_date,
            active: row.active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          resolve(promotions);
        }
      });
    });
  }

  // Orders methods
  generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    return new Promise<string>((resolve, reject) => {
      this.db.get(`
        SELECT COUNT(*) as count FROM orders 
        WHERE order_number LIKE ?
      `, [`${datePrefix}%`], (err, row: any) => {
        if (err) reject(err);
        else {
          const orderCount = (row.count || 0) + 1;
          const orderNumber = `${datePrefix}${String(orderCount).padStart(4, '0')}`;
          resolve(orderNumber);
        }
      });
    }) as any;
  }

  createOrder(order: Omit<Order, 'createdAt' | 'updatedAt' | 'orderNumber'>): Promise<Order> {
    return new Promise((resolve, reject) => {
      const orderNumber = this.generateOrderNumber();
      const now = new Date().toISOString();
      
      this.db.run(`
        INSERT INTO orders (id, order_number, subtotal, discount, promotion_id, total, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [order.id, orderNumber, order.subtotal, order.discount, order.promotionId, order.total, order.status, now, now],
      (err) => {
        if (err) reject(err);
        else {
          // Insert order items
          const promises = order.items.map(item => 
            new Promise<void>((resolveItem, rejectItem) => {
              this.db.run(`
                INSERT INTO order_items (id, order_id, menu_item_id, quantity, price, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
              `, [item.id, order.id, item.menuItemId, item.quantity, item.price, item.subtotal],
              (err) => {
                if (err) rejectItem(err);
                else resolveItem();
              });
            })
          );

          Promise.all(promises)
            .then(() => resolve({ ...order, orderNumber, createdAt: now, updatedAt: now }))
            .catch(reject);
        }
      });
    });
  }

  getAllOrders(): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT o.*, p.name as promotion_name
        FROM orders o
        LEFT JOIN promotions p ON o.promotion_id = p.id
        ORDER BY o.created_at DESC
      `, (err, rows: any[]) => {
        if (err) reject(err);
        else {
          const orderPromises = rows.map(row => 
            new Promise<Order>((resolveOrder, rejectOrder) => {
              this.db.all(`
                SELECT oi.*, mi.name as menu_item_name, mi.category
                FROM order_items oi
                JOIN menu_items mi ON oi.menu_item_id = mi.id
                WHERE oi.order_id = ?
              `, [row.id], (err, itemRows: any[]) => {
                if (err) rejectOrder(err);
                else {
                  const items = itemRows.map(item => ({
                    id: item.id,
                    menuItemId: item.menu_item_id,
                    menuItem: {
                      id: item.menu_item_id,
                      name: item.menu_item_name,
                      category: item.category,
                      price: item.price
                    },
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.subtotal
                  }));

                  resolveOrder({
                    id: row.id,
                    orderNumber: row.order_number,
                    items,
                    subtotal: row.subtotal,
                    discount: row.discount,
                    promotionId: row.promotion_id,
                    promotion: row.promotion_name ? { name: row.promotion_name } : undefined,
                    total: row.total,
                    status: row.status,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                  });
                }
              });
            })
          );

          Promise.all(orderPromises)
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  close(): void {
    this.db.close();
  }
}
