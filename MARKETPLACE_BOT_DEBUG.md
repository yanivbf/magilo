# 🐛 אבחון בעיות - בועת AI מרקטפלייס

## 🔍 איך לבדוק מה קורה

### 1️⃣ פתח את הקונסול בדפדפן
- **Chrome/Edge**: לחץ F12 ועבור ל-"Console"
- **Firefox**: לחץ F12 ועבור ל-"קונסולה"

### 2️⃣ נקה את הקונסול
- לחץ על סמל ה-🚫 או CTRL+L

### 3️⃣ שלח הודעה לבוט
- לחץ על הבועה 🤖
- כתוב: "חפש לי שוקולד"
- שלח

### 4️⃣ בדוק את הקונסול
צריך לראות:

```
🤖 AI Response: { message: "...", action: "...", page_id: "..." }
📝 Parsed response: { message: "...", action: "..." }
```

---

## ✅ תשובה תקינה מ-n8n

כך צריכה להראות תשובה נכונה מה-AI:

```json
{
  "message": "🍫 מצאתי! 'שוקולד יניב' נראה מושלם!",
  "action": "scroll_to_page",
  "page_id": "שוקולד_יניב_1760122549721_html"
}
```

---

## ❌ בעיות נפוצות

### בעיה 1: מופיע `[object Object]` בצ'אט
**סיבה**: n8n מחזיר אובייקט עטוף
**פתרון**: 
1. עבור ל-n8n
2. פתח את ה-"Respond to Webhook" node
3. ודא: **Response Body** = `{{ $json }}`
4. **לא** `{{ $json.output }}`

### בעיה 2: מופיע טקסט עם ` ```json `
**סיבה**: ה-AI מחזיר markdown במקום JSON נקי
**פתרון**:
1. עדכן את ה-System Prompt ב-AI Agent
2. הוסף בהתחלה: "🚨 **החזר רק JSON נקי, ללא markdown!**"
3. השתמש ב-Code Node אחרי ה-AI Agent לנקות את התשובה:

```javascript
let output = $input.item.json.output;

// Remove markdown code blocks
if (typeof output === 'string') {
  output = output.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  output = JSON.parse(output);
}

return {
  json: output
};
```

### בעיה 3: אין תשובה בכלל
**סיבה**: n8n לא מגיב או יש שגיאה
**פתרון**:
1. בדוק ב-n8n Executions אם יש שגיאות
2. ודא שה-webhook פעיל
3. בדוק שיש חיבור אינטרנט

### בעיה 4: "מצטער, לא הבנתי את התשובה"
**סיבה**: התשובה לא מכילה `message` או `output`
**פתרון**:
1. בדוק בקונסול מה הערך של `🤖 AI Response`
2. ודא שהאובייקט מכיל שדה `message`
3. אם יש שדה אחר (למשל `text`), עדכן את `marketplace.html`:

```javascript
let messageToShow = '';
if (botResponse.message) {
    messageToShow = botResponse.message;
} else if (botResponse.output) {
    messageToShow = botResponse.output;
} else if (botResponse.text) {  // <-- הוסף את זה
    messageToShow = botResponse.text;
}
```

---

## 🛠️ בדיקה ידנית של n8n

### שלב 1: בדוק את ה-webhook
פתח בדפדפן:
```
https://n8n-service-how4.onrender.com/webhook/jhfuhgufkhlkuho8erhf757754jhldkbsjkbmreketpg
```

אמור לקבל: `{ "error": "Method not allowed" }` (זה OK - זה אומר שה-webhook פעיל)

### שלב 2: שלח בקשה ידנית
פתח את הקונסול ב-`marketplace.html` והרץ:

```javascript
fetch('https://n8n-service-how4.onrender.com/webhook/jhfuhgufkhlkuho8erhf757754jhldkbsjkbmreketpg', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_message: "חפש לי שוקולד",
    page_type: "marketplace",
    available_pages: [
      {
        title: "שוקולד יניב",
        description: "חנות שוקולד",
        pageType: "store",
        pageId: "שוקולד_יניב_1760122549721_html"
      }
    ]
  })
})
.then(r => r.json())
.then(data => console.log('Test Response:', data));
```

### שלב 3: בדוק את התשובה
אמור לראות בקונסול:
```javascript
Test Response: {
  message: "🍫 מצאתי! 'שוקולד יניב' נראה מושלם!",
  action: "scroll_to_page",
  page_id: "שוקולד_יניב_1760122549721_html"
}
```

---

## 📞 עזרה נוספת

אם עדיין יש בעיה:
1. העתק את כל התוכן מהקונסול
2. העתק את התשובה מ-n8n Executions
3. שלח לי את שני הדברים

---

**עודכן:** 2025-01-14  
**גרסה:** 1.1


