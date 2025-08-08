# การแก้ไข Error ใน Google Apps Script

## ปัญหาที่พบและวิธีแก้ไข

### 1. Error: Cannot read properties of undefined (reading 'parameter')

**สาเหตุ:** ฟังก์ชัน `doGet` ได้รับ request ที่ไม่มี parameter

**การแก้ไข:**
```javascript
function doGet(e) {
  try {
    // ตรวจสอบว่ามี parameter หรือไม่
    if (!e.parameter) {
      return createResponse(false, 'No parameters provided', null);
    }
    
    const action = e.parameter.action;
    
    if (!action) {
      return createResponse(false, 'Action parameter is required', null);
    }
    
    // ... rest of the code
  } catch (error) {
    console.error('Error in doGet:', error);
    return createResponse(false, error.message, null);
  }
}
```

### 2. Error: output.setHeaders is not a function

**สาเหตุ:** Google Apps Script ไม่รองรับ `setHeaders` ใน ContentService

**การแก้ไข:**
```javascript
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  };
  
  const output = ContentService.createTextOutput(JSON.stringify(response));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // ลบ setHeaders ออก - Google Apps Script จัดการ CORS อัตโนมัติ
  return output;
}
```

### 3. การทดสอบ API

#### ทดสอบ GET Request
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getMenuItems
```

#### ทดสอบ POST Request
```javascript
const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'createMenuItem',
    menuItem: {
      name: 'ทดสอบ',
      price: 50,
      cost: 30,
      category: 'ทดสอบ',
      description: 'สำหรับทดสอบ',
      available: true
    }
  })
});

const result = await response.json();
console.log(result);
```

### 4. การ Debug

1. **ตรวจสอบ Logs**
   - ไปที่ Google Apps Script Editor
   - คลิก "Executions" เพื่อดู logs

2. **เพิ่ม console.log**
   ```javascript
   function doGet(e) {
     console.log('doGet called with:', e);
     console.log('Parameters:', e.parameter);
     // ... rest of code
   }
   ```

3. **ทดสอบ Function**
   - เลือกฟังก์ชันที่ต้องการทดสอบ
   - คลิก "Run" เพื่อทดสอบ

### 5. การตั้งค่า Web App ที่ถูกต้อง

1. **Deploy Settings:**
   - Execute as: "Me"
   - Who has access: "Anyone" หรือ "Anyone with Google account"

2. **Version Management:**
   - สร้าง New deployment ทุกครั้งที่มีการเปลี่ยนแปลง code
   - หรือใช้ "Manage deployments" → "Edit" → "New version"

### 6. Response Format ที่ถูกต้อง

```javascript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* ข้อมูลที่ได้ */ },
  "timestamp": "2025-08-08T10:30:00.000Z"
}
```

### 7. Common Issues และวิธีแก้

#### Issue: "Script function not found"
**แก้ไข:** ตรวจสอบว่า function name ถูกต้อง และบันทึก project แล้ว

#### Issue: "Authorization required"
**แก้ไข:** รัน function ครั้งแรกใน editor เพื่อให้ permission

#### Issue: "Execution transcript disabled"
**แก้ไข:** เปิด logging ใน Google Apps Script settings

#### Issue: CORS Error
**แก้ไข:** Google Apps Script จัดการ CORS อัตโนมัติสำหรับ Web Apps

### 8. Best Practices

1. **Error Handling:**
   ```javascript
   try {
     // main logic
   } catch (error) {
     console.error('Error:', error);
     return createResponse(false, error.message, null);
   }
   ```

2. **Input Validation:**
   ```javascript
   if (!data.menuItem || !data.menuItem.name) {
     return createResponse(false, 'Menu item name is required', null);
   }
   ```

3. **Logging:**
   ```javascript
   console.log('Processing request:', data);
   ```

4. **Testing:**
   - ทดสอบแต่ละ function ใน editor ก่อน
   - ใช้ตัวอย่างข้อมูลจริง
   - ตรวจสอบ response format

### 9. การอัปเดต Code

1. แก้ไข code ใน editor
2. บันทึก project (Ctrl+S)
3. Deploy → "Manage deployments" → "Edit" → "New version" → "Deploy"
4. ทดสอบ API ใหม่

### 10. URLs สำคัญ

- **Apps Script Editor:** https://script.google.com
- **API Testing Tool:** https://reqbin.com
- **JSON Validator:** https://jsonlint.com
