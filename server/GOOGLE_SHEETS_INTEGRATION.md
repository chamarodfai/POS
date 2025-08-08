# 🚀 การใช้งาน Google Sheets กับระบบ POS

ไฟล์นี้อธิบายวิธีการใช้งาน Google Sheets เป็น Database สำหรับระบบ POS

## 📋 ข้อมูลเบื้องต้น

ระบบ POS นี้รองรับการใช้งาน 2 แบบ:
1. **Simple Mode** (ปัจจุบัน): ใช้ข้อมูลตัวอย่างใน memory
2. **Google Sheets Mode**: เชื่อมต่อกับ Google Sheets จริง

## 🔧 การเปลี่ยนไปใช้ Google Sheets

### ขั้นตอนที่ 1: ตั้งค่า Google Sheets
ทำตามคำแนะนำใน `GOOGLE_SHEETS_SETUP.md`

### ขั้นตอนที่ 2: เปลี่ยน Server Mode
```bash
# แทนที่การรัน
npm run dev

# ด้วย
npm run dev:google-sheets
```

### ขั้นตอนที่ 3: ทดสอบการเชื่อมต่อ
```bash
npm run test:sheets
```

## 📊 API Endpoints สำหรับการจัดการเมนู

### ดูรายการเมนูทั้งหมด
```http
GET /api/menu-items
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "menu-1",
      "name": "กาแฟอเมริกาโน่",
      "price": 45,
      "cost": 25,
      "category": "กาแฟ",
      "description": "กาแฟอเมริกาโน่หอมกรุ่น",
      "image": "",
      "available": true,
      "createdAt": "2025-08-08T...",
      "updatedAt": "2025-08-08T..."
    }
  ]
}
```

### เพิ่มเมนูใหม่
```http
POST /api/menu-items
Content-Type: application/json

{
  "name": "กาแฟเอสเปรสโซ่",
  "price": 35,
  "cost": 20,
  "category": "กาแฟ",
  "description": "กาแฟเอสเปรสโซ่แท้",
  "available": true
}
```

### แก้ไขเมนู
```http
PUT /api/menu-items/menu-1
Content-Type: application/json

{
  "price": 50,
  "cost": 25,
  "available": false
}
```

### ลบเมนู
```http
DELETE /api/menu-items/menu-1
```

## 💰 ระบบคำนวณกำไร

ระบบจะคำนวณกำไรอัตโนมัติ:

### สูตรการคำนวณ:
- **กำไรต่อรายการ** = ราคาขาย - ต้นทุน
- **เปอร์เซ็นต์กำไร** = (กำไร / ราคาขาย) × 100

### ตัวอย่าง:
```javascript
// กาแฟอเมริกาโน่
const price = 45;    // ราคาขาย
const cost = 25;     // ต้นทุน
const profit = price - cost;           // 20 บาท
const profitPercent = (profit / price) * 100;  // 44.4%
```

## 📈 การดูรายงานกำไร

```http
GET /api/reports/sales?period=daily&date=2025-08-08
```

**Response รวมข้อมูลกำไร:**
```json
{
  "success": true,
  "data": {
    "date": "2025-08-08",
    "totalOrders": 25,
    "totalRevenue": 1250.00,
    "totalProfit": 675.50,
    "topSellingItems": [...]
  }
}
```

## 🔍 การตรวจสอบสถานะระบบ

### ตรวจสอบการเชื่อมต่อ Google Sheets
```http
GET /api/sheets/info
```

### ตรวจสอบสุขภาพระบบ
```http
GET /api/health
```

## 📱 การใช้งานหน้าเว็บ

เมื่อเปลี่ยนเป็น Google Sheets mode:

1. **หน้าจัดการเมนู** จะสามารถ:
   - เพิ่ม/แก้ไข/ลบเมนูได้
   - ข้อมูลจะบันทึกลง Google Sheets ทันที
   - แสดงการคำนวณกำไรแบบ real-time

2. **หน้าสั่งอาหาร** จะ:
   - ดึงเมนูจาก Google Sheets
   - บันทึกออเดอร์ลง Google Sheets

3. **หน้ารายงาน** จะ:
   - คำนวณกำไรจากข้อมูลออเดอร์จริง
   - แสดงสถิติการขายที่แม่นยำ

## 🛠️ การ Debug

### ถ้าระบบเชื่อมต่อไม่ได้:
1. ตรวจสอบไฟล์ `.env`
2. รัน `npm run test:sheets`
3. ดู console log ของ server

### ถ้าข้อมูลไม่อัปเดต:
1. ตรวจสอบสิทธิ์ Service Account ใน Google Sheets
2. ลองรีเฟรชหน้าเว็บ
3. ตรวจสอบ Network tab ใน browser

## 🔗 ลิงก์ที่เป็นประโยชน์

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [เอกสารการตั้งค่าแบบละเอียด](./GOOGLE_SHEETS_SETUP.md)

## 🎯 Next Steps

หลังจากทดสอบ Google Sheets mode แล้ว อาจพิจารณา:

1. **เพิ่ม Error Handling** สำหรับกรณี API limit
2. **ใช้ Caching** เพื่อลดการเรียก API
3. **ยกระดับเป็น Database จริง** สำหรับ production
4. **เพิ่ม Authentication** สำหรับความปลอดภัย

---

💡 **หมายเหตุ**: Google Sheets เหมาะสำหรับการทดสอบและใช้งานเบื้องต้น หากต้องการประสิทธิภาพสูงแนะนำให้ใช้ Database จริง
