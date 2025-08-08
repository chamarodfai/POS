import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SimpleGoogleSheetsDatabase } from './database/simpleGoogleSheets';
import { v4 as uuidv4 } from 'uuid';
import { MenuItem, Promotion, Order, OrderItem, ApiResponse } from './types';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const db = new SimpleGoogleSheetsDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Menu Items routes
app.get('/api/menu-items', async (req, res) => {
  try {
    const items = await db.getAllMenuItems();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch menu items' });
  }
});

app.post('/api/menu-items', async (req, res) => {
  try {
    const itemData = {
      id: uuidv4(),
      ...req.body,
    };
    const item = await db.createMenuItem(itemData);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create menu item' });
  }
});

app.put('/api/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.updateMenuItem(id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update menu item' });
  }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteMenuItem(id);
    if (deleted) {
      res.json({ success: true, message: 'Menu item deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete menu item' });
  }
});

// Promotions routes
app.get('/api/promotions', async (req, res) => {
  try {
    const promotions = await db.getAllPromotions();
    res.json({ success: true, data: promotions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch promotions' });
  }
});

// Orders routes
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = {
      id: uuidv4(),
      items: req.body.items.map((item: any) => ({
        ...item,
        id: uuidv4(),
      })),
      ...req.body,
    };
    
    const order = await db.createOrder(orderData);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// Sales Reports routes
app.get('/api/reports/sales', async (req, res) => {
  try {
    const { period = 'daily', date = new Date().toISOString().split('T')[0] } = req.query;
    
    // Get all orders and menu items
    const orders = await db.getAllOrders();
    const menuItems = await db.getAllMenuItems();
    
    // Calculate totals
    let totalOrders = orders.length;
    let totalRevenue = 0;
    let totalProfit = 0;
    const itemSales: { [key: string]: { name: string; quantity: number; revenue: number; profit: number } } = {};
    
    // Calculate revenue and profit from orders
    orders.forEach((order: Order) => {
      totalRevenue += order.total;
      
      order.items.forEach((orderItem: OrderItem) => {
        const menuItem = menuItems.find((m: MenuItem) => m.id === orderItem.menuItemId);
        if (menuItem) {
          const itemRevenue = orderItem.quantity * orderItem.price;
          const itemCost = orderItem.quantity * (menuItem.cost || 0);
          const itemProfit = itemRevenue - itemCost;
          
          totalProfit += itemProfit;
          
          if (!itemSales[orderItem.menuItemId]) {
            itemSales[orderItem.menuItemId] = {
              name: menuItem.name,
              quantity: 0,
              revenue: 0,
              profit: 0
            };
          }
          
          itemSales[orderItem.menuItemId].quantity += orderItem.quantity;
          itemSales[orderItem.menuItemId].revenue += itemRevenue;
          itemSales[orderItem.menuItemId].profit += itemProfit;
        }
      });
    });
    
    // Get top selling items
    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(item => ({
        menuItemId: '',
        name: item.name,
        quantity: item.quantity,
        revenue: item.revenue
      }));
    
    const report = {
      date: date as string,
      totalOrders,
      totalRevenue,
      totalProfit,
      topSellingItems
    };
    
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sales report' });
  }
});

// Generate order number endpoint
app.get('/api/orders/next-number', async (req, res) => {
  try {
    const orderNumber = db.generateOrderNumber();
    res.json({ success: true, data: { orderNumber } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate order number' });
  }
});

// Google Sheets info endpoint
app.get('/api/sheets/info', (req, res) => {
  try {
    const spreadsheetId = db.getSpreadsheetId();
    const sheetsUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    res.json({ 
      success: true, 
      data: { 
        spreadsheetId,
        sheetsUrl,
        message: 'Using Google Sheets as database'
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get sheets info' });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 API endpoints available at http://localhost:${port}/api`);
});

export default app;
