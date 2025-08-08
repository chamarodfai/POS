# POS System - Chamarodfai

ระบบ Point of Sale (POS) พร้อมระบบจัดการเมนู โปรโมชั่น และรายงาน  
**ใช้ Google Sheets เป็น Database** 📊 | **Deploy บน Vercel** 🚀

## คุณสมบัติ

- 📱 หน้าออเดอร์ที่ใช้งานง่าย
- 🍹 จัดการเมนูเครื่องดื่ม
- 🎯 จัดการโปรโมชั่นและส่วนลด
- 📊 รายงานการขายแบบละเอียด พร้อมกราฟแนวโน้ม
- 📈 หน้ายอดขายรายวัน (ไม่ต้องเข้ารหัส)
- 🔐 ระบบเข้ารหัสสำหรับหน้าจัดการ (รหัส: `chamarodfai1020`)
- 💳 ระบบยืนยันการชำระเงิน
- 🧾 ใบเสร็จดิจิทัลพร้อมฟังก์ชันบันทึก
- 🔢 เลขออเดอร์อัตโนมัติ (YYYYMMDDXXXX)

## การ Deploy บน Vercel

### วิธีที่ 1: ผ่าน Vercel CLI (แนะนำ)

```bash
# เข้าไปใน client directory
cd client

# ติดตั้ง dependencies
npm install

# ติดตั้ง Vercel CLI (ถ้ายังไม่มี)
npm i -g vercel

# Deploy
vercel --prod
```

### วิธีที่ 2: ผ่าน GitHub + Vercel Dashboard

1. อัพโหลดโค้ดขึ้น GitHub
2. เชื่อมต่อ GitHub กับ Vercel
3. เลือก repository และ deploy

### ข้อมูลสำคัญสำหรับ Vercel

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `client`
- **Node.js Version**: 18.x

## การติดตั้งสำหรับพัฒนา

```bash
# ติดตั้ง dependencies ทั้งหมด
npm run setup

# รันระบบ (Frontend + Backend)
npm run dev
```

## Google Sheets Database

### ข้อดี ✅
- **เข้าถึงง่าย**: ดูและแก้ไขข้อมูลได้ผ่านเว็บ Google Sheets
- **แชร์ได้**: หลายคนสามารถเข้าถึงข้อมูลพร้อมกัน
- **สำรองข้อมูลอัตโนมัติ**: Google ดูแลการสำรองข้อมูลให้
- **ไม่ต้องติดตั้ง Database**: ไม่ต้องติดตั้ง SQLite หรือ Database อื่น
- **Real-time**: การเปลี่ยนแปลงจะเห็นผลทันที

### การตั้งค่า (ขั้นสูง)

สำหรับการใช้งานจริง โปรดดู [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)

### โหมด Demo (ปัจจุบัน)
ระบบกำลังใช้โหมด Demo ที่มีข้อมูลตัวอย่าง ไม่ต้องตั้งค่า Google Sheets API

## เทคโนโลยีที่ใช้

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Zustand (State Management)
- Vite (Build Tool)
- React Router DOM
- Lucide React (Icons)

### Backend
- Node.js + Express + TypeScript
- **Google Sheets API** (Database)
- CORS enabled
- RESTful API

## การใช้งาน

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:3001/api
3. **Google Sheets Info**: http://localhost:3001/api/sheets/info

## โครงสร้างโปรเจค

```
beverage-pos-system/
├── client/                    # Frontend React App
├── server/                    # Backend API
├── GOOGLE_SHEETS_SETUP.md    # คำแนะนำตั้งค่า Google Sheets
└── README.md
```

## API Endpoints

### Menu Items
- `GET /api/menu-items` - ดึงรายการเมนู
- `POST /api/menu-items` - เพิ่มเมนูใหม่
- `PUT /api/menu-items/:id` - แก้ไขเมนู
- `DELETE /api/menu-items/:id` - ลบเมนู

### Promotions
- `GET /api/promotions` - ดึงรายการโปรโมชั่น

### Orders
- `GET /api/orders` - ดึงรายการออเดอร์
- `POST /api/orders` - สร้างออเดอร์ใหม่
- `GET /api/orders/next-number` - ดึงเลขออเดอร์ถัดไป

### Reports
- `GET /api/reports/sales` - รายงานการขาย

### Google Sheets
- `GET /api/sheets/info` - ข้อมูลการเชื่อมต่อ Google Sheets

## การพัฒนาต่อ

ระบบนี้สามารถพัฒนาต่อได้ด้วยการ:

1. **เชื่อมต่อ Google Sheets จริง** - ตั้งค่าตาม GOOGLE_SHEETS_SETUP.md
2. **เพิ่มระบบ Authentication** - เข้าสู่ระบบผู้ใช้
3. **เพิ่มระบบ Inventory** - จัดการสต็อกสินค้า
4. **เพิ่ม Dashboard ขั้นสูง** - กราฟและสถิติ
5. **Mobile App** - ใช้ React Native

---

พัฒนาโดย GitHub Copilot 🤖
