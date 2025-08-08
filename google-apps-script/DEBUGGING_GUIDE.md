# 🔧 การแก้ไข Error และทดสอบ Google Apps Script

## ขั้นตอนการทดสอบ

### 1. ทดสอบฟังก์ชันใน Apps Script Editor

1. **เปิด Google Apps Script Editor**
2. **เลือกฟังก์ชัน `testFunction`**
3. **คลิก "Run"**
4. **ตรวจสอบผลลัพธ์**

หากสำเร็จ จะแสดง: "Test successful! Google Apps Script is working."

### 2. ทดสอบ doGet ใน Editor

1. **เลือกฟังก์ชัน `doGet`**
2. **คลิก "Run"**
3. **อนุญาต permissions หากขึ้น popup**

### 3. Deploy Web App

1. **คลิก "Deploy" → "New deployment"**
2. **เลือก type: "Web app"**
3. **ตั้งค่า:**
   - Execute as: "Me"
   - Who has access: "Anyone"
4. **คลิก "Deploy"**
5. **คัดลอก Web app URL**

### 4. ทดสอบ API ผ่าน URL

#### ทดสอบฟังก์ชัน Test
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=test
```

**ผลลัพธ์ที่ควรได้:**
```json
{
  "success": true,
  "message": "API is working correctly!",
  "data": {
    "timestamp": "2025-08-08T..."
  },
  "timestamp": "2025-08-08T..."
}
```

#### ทดสอบ GetMenuItems
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getMenuItems
```

### 5. การแก้ไข Error ทีละขั้น

#### Error: "Cannot read properties of undefined (reading 'parameter')"

**สาเหตุ:**
- Web App ยังไม่ได้ deploy
- URL ไม่ถูกต้อง
- Permission ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบ URL ที่ได้จาก Deploy
2. ลอง deploy ใหม่
3. ตรวจสอบ permission settings

#### Error: "MenuItems sheet not found"

**วิธีแก้:**
1. เปิด Google Sheets ที่เชื่อมต่อกับ Apps Script
2. รันฟังก์ชัน `setupSheets()` จากเมนู POS System
3. หรือสร้าง sheet ชื่อ "MenuItems" manually

### 6. ขั้นตอนการแก้ไขแบบ Step-by-Step

#### ขั้นตอนที่ 1: ตรวจสอบ Basic Function
```javascript
// ใน Apps Script Editor
function simpleTest() {
  return "Hello World";
}
```

#### ขั้นตอนที่ 2: ทดสอบ Spreadsheet Access
```javascript
function testSpreadsheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return "Spreadsheet ID: " + ss.getId();
  } catch (error) {
    return "Error: " + error.message;
  }
}
```

#### ขั้นตอนที่ 3: ทดสอบ Sheet Access
```javascript
function testSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('MenuItems');
    if (sheet) {
      return "MenuItems sheet found with " + sheet.getLastRow() + " rows";
    } else {
      return "MenuItems sheet not found";
    }
  } catch (error) {
    return "Error: " + error.message;
  }
}
```

### 7. ขั้นตอนการ Deploy ที่ถูกต้อง

1. **บันทึก Project** (Ctrl+S)
2. **ตั้งชื่อ Project** (ถ้ายังไม่มี)
3. **คลิก Deploy → New deployment**
4. **เลือก settings:**
   ```
   Type: Web app
   Execute as: Me (your email)
   Who has access: Anyone
   ```
5. **คลิก "Deploy"**
6. **Authorize permissions**
7. **คัดลอก Web app URL**

### 8. การทดสอบ URL ที่ถูกต้อง

#### URL Format:
```
https://script.google.com/macros/s/{SCRIPT_ID}/exec?action=test
```

#### ตัวอย่าง URL:
```
https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXX/exec?action=test
```

### 9. การตรวจสอบ Logs

1. **ใน Apps Script Editor**
2. **คลิก "Executions"**
3. **ดู logs ของ execution ล่าสุด**
4. **ตรวจสอบ error messages**

### 10. Common Issues และการแก้ไข

#### Issue: "Script function not found: doGet"
**แก้ไข:** ตรวจสอบว่า deploy เป็น "Web app" ไม่ใช่ "API executable"

#### Issue: "Authorization required"
**แก้ไข:** รันฟังก์ชันใน editor ก่อนเพื่อให้ permission

#### Issue: "The script completed but did not return anything"
**แก้ไข:** ตรวจสอบว่าฟังก์ชัน return ContentService output

### 11. การ Debug แบบ Advanced

#### เพิ่ม Detailed Logging:
```javascript
function doGet(e) {
  console.log('=== doGet Debug Info ===');
  console.log('Event object exists:', !!e);
  console.log('Event parameter exists:', !!(e && e.parameter));
  console.log('Full event object:', JSON.stringify(e));
  
  // ... rest of function
}
```

### 12. ตัวอย่าง Response ที่ถูกต้อง

#### Success Response:
```json
{
  "success": true,
  "message": "API is working correctly!",
  "data": {...},
  "timestamp": "2025-08-08T10:42:01.000Z"
}
```

#### Error Response:
```json
{
  "success": false,
  "message": "Error description here",
  "data": null,
  "timestamp": "2025-08-08T10:42:01.000Z"
}
```

### 13. Emergency Backup Plan

หากยังมีปัญหา ให้ใช้ฟังก์ชันง่าย ๆ นี้:

```javascript
function doGet(e) {
  const output = ContentService.createTextOutput('Hello from Google Apps Script!');
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
}
```

### 14. ขั้นตอนสุดท้าย

1. **ทดสอบ URL ด้วย action=test**
2. **ตรวจสอบ response format**
3. **ทดสอบ getMenuItems หลังจากสร้าง sheet**
4. **ติดตั้งข้อมูลตัวอย่าง**
5. **ทดสอบ functionality ทั้งหมด**
