# การใช้งาน Google Sheets เป็น Database

## ขั้นตอนการตั้งค่า Google Sheets API

### 1. สร้าง Google Cloud Project

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่หรือเลือก Project ที่มีอยู่
3. เปิดใช้งาน Google Sheets API:
   - ไปที่ "APIs & Services" > "Library"
   - ค้นหา "Google Sheets API"
   - คลิก "Enable"

### 2. สร้าง Service Account (แนะนำ)

1. ไปที่ "APIs & Services" > "Credentials"
2. คลิก "Create Credentials" > "Service Account"
3. ใส่ชื่อ Service Account
4. ไปที่ Service Account ที่สร้าง
5. ไปที่แท็บ "Keys"
6. คลิก "Add Key" > "Create New Key" > "JSON"
7. ดาวน์โหลดไฟล์ JSON และเปลี่ยนชื่อเป็น `service-account-key.json`
8. ย้ายไฟล์ไปไว้ในโฟลเดอร์ `server/`

### 3. สร้าง Google Spreadsheet

1. ไปที่ [Google Sheets](https://sheets.google.com)
2. สร้าง Spreadsheet ใหม่
3. ตั้งชื่อ "POS Database - Beverage Shop"
4. คัดลอก Spreadsheet ID จาก URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 4. แชร์ Spreadsheet ให้ Service Account

1. เปิด Spreadsheet ที่สร้าง
2. คลิก "Share" (แชร์)
3. ใส่อีเมลของ Service Account (หาได้จากไฟล์ JSON ในฟิลด์ `client_email`)
4. เลือกสิทธิ์ "Editor"
5. ส่งคำเชิญ

### 5. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `server/`:

```env
GOOGLE_SPREADSHEET_ID=ใส่_spreadsheet_id_ที่คัดลอกมา
GOOGLE_SERVICE_ACCOUNT_KEY=./service-account-key.json
PORT=3001
```

## โครงสร้าง Spreadsheet

ระบบจะสร้าง Sheets ต่อไปนี้อัตโนมัติ:

### 1. MenuItems Sheet
| ID | Name | Price | Cost | Category | Description | Image | Available | CreatedAt | UpdatedAt |
|----|------|-------|------|----------|-------------|-------|-----------|-----------|-----------|
| menu-1 | กาแฟอเมริกาโน่ | 45 | 25 | กาแฟ | กาแฟอเมริกาโน่หอมกรุ่น | | TRUE | 2025-08-08T... | 2025-08-08T... |

**คำอธิบายฟิลด์:**
- `ID`: รหัสประจำเมนู (เช่น menu-1, menu-2)
- `Name`: ชื่อเมนู
- `Price`: ราคาขาย (บาท)
- `Cost`: ต้นทุน (บาท) - ใช้คำนวณกำไร
- `Category`: หมวดหมู่ (กาแฟ, ชา, สมูทตี้, น้ำผลไม้)
- `Description`: คำอธิบายเมนู
- `Image`: URL รูปภาพ (อาจเป็นค่าว่าง)
- `Available`: สถานะพร้อมขาย (TRUE/FALSE)
- `CreatedAt`: วันที่สร้าง
- `UpdatedAt`: วันที่แก้ไขล่าสุด

### 2. Promotions Sheet  
| ID | Name | Description | DiscountType | DiscountValue | MinOrderAmount | StartDate | EndDate | Active | CreatedAt | UpdatedAt |
|----|------|-------------|--------------|---------------|----------------|-----------|---------|--------|-----------|-----------|

**คำอธิบายฟิลด์:**
- `DiscountType`: ประเภทส่วนลด (percentage/fixed)
- `DiscountValue`: มูลค่าส่วนลด (เปอร์เซ็นต์หรือจำนวนเงิน)
- `MinOrderAmount`: จำนวนเงินขั้นต่ำสำหรับใช้โปรโมชั่น

### 3. Orders Sheet
| ID | OrderNumber | Subtotal | Discount | PromotionID | Total | Status | CreatedAt | UpdatedAt |
|----|-------------|----------|----------|-------------|-------|---------|-----------|-----------|

**คำอธิบายฟิลด์:**
- `OrderNumber`: หมายเลขออเดอร์ (รูปแบบ YYYYMMDDXXXX)
- `Subtotal`: ยอดรวมก่อนส่วนลด
- `Discount`: จำนวนเงินส่วนลด
- `Total`: ยอดรวมสุทธิ
- `Status`: สถานะออเดอร์ (pending/confirmed/completed/cancelled)

### 4. OrderItems Sheet
| ID | OrderID | MenuItemID | MenuItemName | Quantity | Price | Subtotal |
|----|---------|------------|--------------|----------|-------|----------|

**คำอธิบายฟิลด์:**
- `OrderID`: รหัสออเดอร์ที่เชื่อมโยง
- `MenuItemID`: รหัสเมนูที่สั่ง
- `MenuItemName`: ชื่อเมนู (เก็บไว้เพื่อความสะดวก)
- `Quantity`: จำนวนที่สั่ง
- `Price`: ราคาต่อหน่วยขณะสั่ง
- `Subtotal`: ยอดรวมของรายการนี้

## การใช้งาน

1. ติดตั้ง dependencies:
   ```bash
   npm install googleapis dotenv
   ```

2. ตั้งค่าไฟล์ `.env` และ `service-account-key.json`

3. รันเซิร์ฟเวอร์:
   ```bash
   npm run dev
   ```

4. ระบบจะสร้างข้อมูลตัวอย่างใน Google Sheets อัตโนมัติ

## ข้อดีของการใช้ Google Sheets

✅ **เข้าถึงง่าย**: ดูและแก้ไขข้อมูลได้ผ่านเว็บไซต์ Google Sheets  
✅ **แชร์ได้**: หลายคนสามารถเข้าถึงข้อมูลพร้อมกัน  
✅ **สำรองข้อมูลอัตโนมัติ**: Google ดูแลการสำรองข้อมูลให้  
✅ **ไม่ต้องติดตั้ง Database**: ไม่ต้องติดตั้ง SQLite หรือ Database อื่น  
✅ **Real-time**: การเปลี่ยนแปลงจะเห็นผลทันที  

## การตรวจสอบการทำงาน

เข้าไปดูที่: `http://localhost:3001/api/sheets/info`  
เพื่อดูข้อมูลการเชื่อมต่อ Google Sheets

## ข้อควรระวัง

⚠️ **API Limits**: Google Sheets API มีขิดจำกัดการใช้งาน (100 requests/100 seconds/user)  
⚠️ **ความเร็ว**: อาจช้ากว่า Database แบบดั้งเดิม  
⚠️ **ความปลอดภัย**: ควรใช้ Service Account และไม่แชร์ไฟล์ key

## การใช้งาน API สำหรับจัดการเมนู

### 📋 ดูรายการเมนูทั้งหมด
```bash
GET /api/menu-items
```

### 📝 เพิ่มเมนูใหม่
```bash
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

### ✏️ แก้ไขเมนู
```bash
PUT /api/menu-items/{id}
Content-Type: application/json

{
  "price": 40,
  "cost": 22,
  "available": false
}
```

### 🗑️ ลบเมนู
```bash
DELETE /api/menu-items/{id}
```

## การคำนวณกำไร

ระบบจะคำนวณกำไรอัตโนมัติจากสูตร:
- **กำไรต่อรายการ** = (ราคาขาย - ต้นทุน) × จำนวน
- **เปอร์เซ็นต์กำไร** = ((ราคาขาย - ต้นทุน) / ราคาขาย) × 100

### ตัวอย่างการคำนวณ:
- กาแฟอเมริกาโน่: ราคา 45 บาท, ต้นทุน 25 บาท
- กำไรต่อแก้ว = 45 - 25 = 20 บาท
- เปอร์เซ็นต์กำไร = (20/45) × 100 = 44.4%

## ข้อมูลเพิ่มเติม

### 🔧 การแก้ไขข้อมูลใน Google Sheets
- สามารถแก้ไขข้อมูลใน Google Sheets โดยตรงได้
- ระบบจะอ่านข้อมูลล่าสุดจาก Sheets ทุกครั้งที่เรียก API
- ควรระวังการแก้ไข ID เพราะจะทำให้ระบบหาข้อมูลไม่เจอ

### 📊 การสำรองข้อมูล
- Google Sheets มีการสำรองข้อมูลอัตโนมัติ
- สามารถดาวน์โหลดเป็น Excel หรือ CSV ได้
- แนะนำให้สำรองข้อมูลสำคัญเป็นประจำ

### 🚀 การยกระดับสู่ Production
หากต้องการใช้งานจริง ควรพิจารณา:
1. ใช้ Database จริง (PostgreSQL, MySQL) สำหรับความเร็วและความเสถียร
2. ตั้งค่า API Rate Limiting
3. เพิ่มระบบ Authentication
4. ใช้ HTTPS สำหรับความปลอดภัย
