import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleSheetsDatabase } from './database/googleSheets';
import { v4 as uuidv4 } from 'uuid';
import { MenuItem, Promotion, Order, OrderItem, ApiResponse } from './types';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Google Sheets Database
const db = new GoogleSheetsDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'POS API is running' });
});

// ===============================
// MENU ITEMS ENDPOINTS
// ===============================

// Get all menu items
app.get('/api/menu-items', async (req, res) => {
  try {
    const menuItems = await db.getAllMenuItems();
    res.json({ success: true, data: menuItems });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch menu items' });
  }
});

// Get menu item by ID
app.get('/api/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await db.getMenuItemById(id);
    
    if (!menuItem) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    
    res.json({ success: true, data: menuItem });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch menu item' });
  }
});

// Create new menu item
app.post('/api/menu-items', async (req, res) => {
  try {
    const { name, price, cost, category, description, image, available } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, price, category' 
      });
    }

    const newMenuItem = await db.createMenuItem({
      name,
      price: Number(price),
      cost: Number(cost) || 0,
      category,
      description: description || '',
      image: image || '',
      available: available !== undefined ? Boolean(available) : true
    });

    res.status(201).json({ success: true, data: newMenuItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ success: false, error: 'Failed to create menu item' });
  }
});

// Update menu item
app.put('/api/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Convert string numbers to actual numbers
    if (updates.price) updates.price = Number(updates.price);
    if (updates.cost) updates.cost = Number(updates.cost);
    if (updates.available !== undefined) updates.available = Boolean(updates.available);

    const updatedMenuItem = await db.updateMenuItem(id, updates);
    
    if (!updatedMenuItem) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    res.json({ success: true, data: updatedMenuItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ success: false, error: 'Failed to update menu item' });
  }
});

// Delete menu item
app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteMenuItem(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ success: false, error: 'Failed to delete menu item' });
  }
});

// ===============================
// PROMOTIONS ENDPOINTS
// ===============================

// Get all promotions
app.get('/api/promotions', async (req, res) => {
  try {
    const promotions = await db.getAllPromotions();
    res.json({ success: true, data: promotions });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch promotions' });
  }
});

// ===============================
// ORDERS ENDPOINTS
// ===============================

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { items, promotionId } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order must contain at least one item' 
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const menuItem = await db.getMenuItemById(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ 
          success: false, 
          error: `Menu item not found: ${item.menuItemId}` 
        });
      }

      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        id: uuidv4(),
        menuItemId: item.menuItemId,
        menuItemName: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        subtotal: itemSubtotal
      });
    }

    // Apply promotion if any
    let discount = 0;
    if (promotionId) {
      // Get promotion and calculate discount
      // This would need to be implemented based on your promotion logic
    }

    const total = subtotal - discount;
    const orderNumber = db.generateOrderNumber();

    const newOrder = await db.createOrder({
      orderNumber,
      items: orderItems,
      subtotal,
      discount,
      promotionId: promotionId || null,
      total,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// ===============================
// REPORTS ENDPOINTS
// ===============================

// Sales report endpoint
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
        status: 'connected'
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get sheets info' });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 API endpoints available at http://localhost:${port}/api`);
  console.log(`📋 Google Sheets info: http://localhost:${port}/api/sheets/info`);
});

export default app;
