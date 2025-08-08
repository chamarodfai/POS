# Google Apps Script Web API สำหรับ POS System

## การติดตั้งและใช้งาน

### 1. การติดตั้ง Google Apps Script Web API

1. **เปิด Google Apps Script**
   - ไปที่ [script.google.com](https://script.google.com)
   - คลิก "โครงการใหม่"

2. **วาง Code**
   - ลบ Code เก่าทั้งหมด
   - วาง Code จากไฟล์ `WebAPI.gs`
   - บันทึกโครงการ

3. **Deploy Web App**
   - คลิก "Deploy" → "New deployment"
   - เลือก type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone" (สำหรับ public API) หรือ "Anyone with Google account"
   - คลิก "Deploy"
   - คัดลอก URL ที่ได้

### 2. API Endpoints

#### Base URL
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

#### GET Requests (ดึงข้อมูล)

**ดึงรายการเมนู**
```
GET: {BASE_URL}?action=getMenuItems
```

**ดึงรายการโปรโมชัน**
```
GET: {BASE_URL}?action=getPromotions
```

**ดึงรายการออเดอร์**
```
GET: {BASE_URL}?action=getOrders
```

**ดึงรายงาน**
```
GET: {BASE_URL}?action=getReports
```

#### POST Requests (ส่งข้อมูล)

**สร้างเมนูใหม่**
```javascript
POST: {BASE_URL}
Content-Type: application/json

{
  "action": "createMenuItem",
  "menuItem": {
    "name": "กาแฟอเมริกาโน่",
    "price": 45,
    "cost": 25,
    "category": "กาแฟ",
    "description": "กาแฟอเมริกาโน่หอมกรุ่น",
    "image": "",
    "available": true
  }
}
```

**อัปเดตเมนู**
```javascript
POST: {BASE_URL}
Content-Type: application/json

{
  "action": "updateMenuItem",
  "id": "menu-1234567890-123",
  "menuItem": {
    "name": "กาแฟอเมริกาโน่",
    "price": 50,
    "cost": 25,
    "category": "กาแฟ",
    "description": "กาแฟอเมริกาโน่หอมกรุ่น",
    "image": "",
    "available": true
  }
}
```

**ลบเมนู**
```javascript
POST: {BASE_URL}
Content-Type: application/json

{
  "action": "deleteMenuItem",
  "id": "menu-1234567890-123"
}
```

**สร้างออเดอร์ใหม่**
```javascript
POST: {BASE_URL}
Content-Type: application/json

{
  "action": "createOrder",
  "order": {
    "items": [
      {
        "menuItemId": "menu-1",
        "menuItemName": "กาแฟอเมริกาโน่",
        "quantity": 2,
        "price": 45
      },
      {
        "menuItemId": "menu-2",
        "menuItemName": "กาแฟลาเต้",
        "quantity": 1,
        "price": 55
      }
    ],
    "discount": 10,
    "promotionId": "promo-1",
    "status": "pending"
  }
}
```

**อัปเดตสถานะออเดอร์**
```javascript
POST: {BASE_URL}
Content-Type: application/json

{
  "action": "updateOrder",
  "id": "order-1234567890-123",
  "updates": {
    "status": "completed"
  }
}
```

**ใช้โปรโมชัน**
```javascript
POST: {BASE_URL}
Content-Type: application/json

{
  "action": "applyPromotion",
  "promotionId": "promo-1",
  "orderAmount": 200
}
```

### 3. Response Format

ทุก API จะ return ข้อมูลในรูปแบบ JSON:

```javascript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* ข้อมูลที่ร้องขอ */ },
  "timestamp": "2025-08-08T10:30:00.000Z"
}
```

**กรณีสำเร็จ:**
- `success`: true
- `message`: ข้อความแสดงผลสำเร็จ
- `data`: ข้อมูลที่ได้

**กรณีผิดพลาด:**
- `success`: false
- `message`: ข้อความ error
- `data`: null

### 4. ตัวอย่างการใช้งานใน JavaScript

```javascript
// ดึงรายการเมนู
async function getMenuItems() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=getMenuItems`);
    const result = await response.json();
    
    if (result.success) {
      console.log('Menu items:', result.data);
      return result.data;
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// สร้างเมนูใหม่
async function createMenuItem(menuItem) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createMenuItem',
        menuItem: menuItem
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Menu item created:', result.data);
      return result.data;
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// สร้างออเดอร์
async function createOrder(orderData) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createOrder',
        order: orderData
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Order created:', result.data);
      return result.data;
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### 5. การจัดการ CORS

API นี้รองรับ CORS headers แล้ว สามารถเรียกใช้จากเว็บไซต์ domain ไหนก็ได้

### 6. ข้อจำกัด

1. **Rate Limiting**: Google Apps Script มีขำกัดจำนวน requests ต่อวัน
2. **Execution Time**: แต่ละ request ต้องทำงานไม่เกิน 6 นาที
3. **Concurrent Users**: รองรับได้พร้อมกัน 30 users

### 7. การ Debug

- ดู logs ใน Google Apps Script Editor → "Executions"
- ใช้ `console.log()` เพื่อ debug
- ตรวจสอบ Response format ให้ถูกต้อง

### 8. Security

1. **คำแนะนำ**: ใช้ "Anyone with Google account" แทน "Anyone" เพื่อความปลอดภัย
2. **Validation**: เพิ่มการตรวจสอบข้อมูลก่อนบันทึก
3. **Rate Limiting**: ใช้ service account หากต้องการ rate limit ที่สูงกว่า
