# 🔧 תיקון בעיית UTF-8 ב-N8N

## הבעיה:
העברית מוצגת כסימני שאלה:
- "א�לי" במקום "אולי"
- "נ�ספים" במקום "נוספים"  
- "יכ�לה" במקום "יכולה"

## הפתרון:

### צעד 1: ב-N8N Workflow
1. פתח את ה-Workflow
2. לחץ על **Settings** (גלגל השיניים למעלה)
3. לחץ על **Execution** tab
4. תחת **Save execution progress**, תוודא שזה מופעל
5. תחת **Timezone**, תבחר **Asia/Jerusalem**

### צעד 2: AI Agent Node
1. לחץ על ה-**AI Agent** node
2. לחץ על **Options** (שלושת הנקודות)
3. הוסף parameter חדש:
   - **Name:** `response_format`
   - **Value:** `{ "type": "text", "encoding": "utf-8" }`

### צעד 3: HTTP Response Node (אם יש)
1. אם יש לך HTTP Response node בסוף
2. הוסף Header:
   - **Name:** `Content-Type`
   - **Value:** `application/json; charset=utf-8`

### צעד 4: בדיקה
1. שמור את ה-Workflow
2. הפעל test
3. שלח: "מה המצב?"
4. התשובה צריכה להיות: "הכל בסדר, תודה" (לא "ת�דה")

## אם זה עדיין לא עובד:

### אופציה A: השתמש ב-Code Node
הוסף Code Node לפני ה-Response:

```javascript
// Clean response text and ensure UTF-8
const response = $input.first().json;
const cleanResponse = {
  ...response,
  output: response.output || response.text || ''
};

// Ensure UTF-8 encoding
const utf8Text = Buffer.from(cleanResponse.output, 'utf-8').toString('utf-8');
cleanResponse.output = utf8Text;

return cleanResponse;
```

### אופציה B: השתמש בקובץ האנגלי
אם בעיית UTF-8 לא נפתרת, השתמש ב:
- `N8N-QUICK-RULES.txt` (אנגלית)
במקום:
- `N8N-SIMPLE-HEBREW.txt` (עברית)

## ✅ בדיקה סופית:
```
User: "מה שלומך?"
Bot: "הכל בסדר, תודה. איך אני יכולה לעזור?"
      ↑ לא "ת�דה" ❌
```

