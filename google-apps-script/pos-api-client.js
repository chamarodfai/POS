/**
 * POS API Client - JavaScript
 * ไคลเอนต์สำหรับเชื่อมต่อกับ Google Apps Script API
 */

class POSAPIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // ===============================
  // Helper Methods
  // ===============================

  async makeRequest(endpoint, options = {}) {
    try {
      const url = endpoint.includes('?') 
        ? `${this.baseUrl}${endpoint}`
        : `${this.baseUrl}?${endpoint}`;
        
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // ===============================
  // Menu Items API
  // ===============================

  async getMenuItems() {
    return await this.makeRequest('action=getMenuItems');
  }

  async createMenuItem(menuItem) {
    return await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'createMenuItem',
        menuItem: menuItem
      })
    });
  }

  async updateMenuItem(id, menuItem) {
    return await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'updateMenuItem',
        id: id,
        menuItem: menuItem
      })
    });
  }

  async deleteMenuItem(id) {
    return await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'deleteMenuItem',
        id: id
      })
    });
  }

  // ===============================
  // Orders API
  // ===============================

  async getOrders() {
    return await this.makeRequest('action=getOrders');
  }

  async createOrder(orderData) {
    return await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'createOrder',
        order: orderData
      })
    });
  }

  async updateOrderStatus(orderId, status) {
    return await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'updateOrder',
        id: orderId,
        updates: { status: status }
      })
    });
  }

  // ===============================
  // Promotions API
  // ===============================

  async getPromotions() {
    return await this.makeRequest('action=getPromotions');
  }

  async applyPromotion(promotionId, orderAmount) {
    return await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'applyPromotion',
        promotionId: promotionId,
        orderAmount: orderAmount
      })
    });
  }

  // ===============================
  // Reports API
  // ===============================

  async getReports() {
    return await this.makeRequest('action=getReports');
  }
}

// ===============================
// Usage Examples
// ===============================

// Initialize API client
const API_BASE_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
const posAPI = new POSAPIClient(API_BASE_URL);

// ตัวอย่างการใช้งาน
class POSManager {
  constructor() {
    this.api = new POSAPIClient(API_BASE_URL);
    this.menuItems = [];
    this.cart = [];
    this.promotions = [];
  }

  // ===============================
  // Menu Management
  // ===============================

  async loadMenuItems() {
    try {
      const result = await this.api.getMenuItems();
      if (result.success) {
        this.menuItems = result.data;
        this.displayMenuItems();
      } else {
        console.error('Failed to load menu items:', result.message);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  }

  async addMenuItem(menuItem) {
    try {
      const result = await this.api.createMenuItem(menuItem);
      if (result.success) {
        this.menuItems.push(result.data);
        this.displayMenuItems();
        return true;
      } else {
        console.error('Failed to add menu item:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      return false;
    }
  }

  async updateMenuItem(id, menuItem) {
    try {
      const result = await this.api.updateMenuItem(id, menuItem);
      if (result.success) {
        const index = this.menuItems.findIndex(item => item.id === id);
        if (index !== -1) {
          this.menuItems[index] = { ...this.menuItems[index], ...result.data };
        }
        this.displayMenuItems();
        return true;
      } else {
        console.error('Failed to update menu item:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      return false;
    }
  }

  async deleteMenuItem(id) {
    try {
      const result = await this.api.deleteMenuItem(id);
      if (result.success) {
        this.menuItems = this.menuItems.filter(item => item.id !== id);
        this.displayMenuItems();
        return true;
      } else {
        console.error('Failed to delete menu item:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      return false;
    }
  }

  // ===============================
  // Cart Management
  // ===============================

  addToCart(menuItemId, quantity = 1) {
    const menuItem = this.menuItems.find(item => item.id === menuItemId);
    if (!menuItem) {
      console.error('Menu item not found');
      return;
    }

    const existingItem = this.cart.find(item => item.menuItemId === menuItemId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        menuItemId: menuItemId,
        menuItemName: menuItem.name,
        quantity: quantity,
        price: menuItem.price
      });
    }

    this.updateCartDisplay();
  }

  removeFromCart(menuItemId) {
    this.cart = this.cart.filter(item => item.menuItemId !== menuItemId);
    this.updateCartDisplay();
  }

  updateCartItemQuantity(menuItemId, quantity) {
    const item = this.cart.find(item => item.menuItemId === menuItemId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(menuItemId);
      } else {
        item.quantity = quantity;
        this.updateCartDisplay();
      }
    }
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.quantity * item.price), 0);
  }

  clearCart() {
    this.cart = [];
    this.updateCartDisplay();
  }

  // ===============================
  // Order Management
  // ===============================

  async createOrder(discount = 0, promotionId = null) {
    if (this.cart.length === 0) {
      alert('ตะกร้าสินค้าว่างเปล่า');
      return false;
    }

    try {
      const orderData = {
        items: this.cart,
        discount: discount,
        promotionId: promotionId,
        status: 'pending'
      };

      const result = await this.api.createOrder(orderData);
      if (result.success) {
        console.log('Order created successfully:', result.data);
        this.clearCart();
        alert(`สร้างออเดอร์สำเร็จ\nหมายเลขออเดอร์: ${result.data.orderNumber}`);
        return result.data;
      } else {
        console.error('Failed to create order:', result.message);
        alert('เกิดข้อผิดพลาดในการสร้างออเดอร์');
        return false;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      return false;
    }
  }

  // ===============================
  // Promotions
  // ===============================

  async loadPromotions() {
    try {
      const result = await this.api.getPromotions();
      if (result.success) {
        this.promotions = result.data.filter(promo => promo.active);
        this.displayPromotions();
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  }

  async applyPromotion(promotionId) {
    const cartTotal = this.getCartTotal();
    
    try {
      const result = await this.api.applyPromotion(promotionId, cartTotal);
      if (result.success) {
        const discountData = result.data;
        console.log('Promotion applied:', discountData);
        return discountData;
      } else {
        alert(result.message);
        return null;
      }
    } catch (error) {
      console.error('Error applying promotion:', error);
      alert('เกิดข้อผิดพลาดในการใช้โปรโมชัน');
      return null;
    }
  }

  // ===============================
  // UI Methods (ตัวอย่าง)
  // ===============================

  displayMenuItems() {
    const container = document.getElementById('menuItems');
    if (!container) return;

    container.innerHTML = '';
    this.menuItems.forEach(item => {
      if (item.available) {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item';
        itemElement.innerHTML = `
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p>ราคา: ${item.price} บาท</p>
          <button onclick="posManager.addToCart('${item.id}')">เพิ่มในตะกร้า</button>
        `;
        container.appendChild(itemElement);
      }
    });
  }

  updateCartDisplay() {
    const container = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');
    
    if (container) {
      container.innerHTML = '';
      this.cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
          <span>${item.menuItemName}</span>
          <span>จำนวน: ${item.quantity}</span>
          <span>ราคา: ${(item.quantity * item.price)} บาท</span>
          <button onclick="posManager.removeFromCart('${item.menuItemId}')">ลบ</button>
        `;
        container.appendChild(itemElement);
      });
    }

    if (totalElement) {
      totalElement.textContent = `รวม: ${this.getCartTotal()} บาท`;
    }
  }

  displayPromotions() {
    const container = document.getElementById('promotions');
    if (!container) return;

    container.innerHTML = '';
    this.promotions.forEach(promo => {
      const promoElement = document.createElement('div');
      promoElement.className = 'promotion-item';
      promoElement.innerHTML = `
        <h4>${promo.name}</h4>
        <p>${promo.description}</p>
        <button onclick="posManager.applyPromotion('${promo.id}')">ใช้โปรโมชัน</button>
      `;
      container.appendChild(promoElement);
    });
  }
}

// Initialize POS Manager
const posManager = new POSManager();

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
  posManager.loadMenuItems();
  posManager.loadPromotions();
});
