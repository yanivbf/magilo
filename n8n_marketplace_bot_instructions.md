# 🤖 הנחיות לבוט מרקטפלייס - n8n

## 📋 מטרה
בוט AI חכם שעוזר למשתמשים למצוא דפים רלוונטיים במרקטפלייס AutoPage.

---

## 📥 קלט (Input)

הבוט מקבל:
```json
{
  "user_message": "חפש לי ספר בנתניה",
  "page_type": "marketplace",
  "available_pages": [
    {
      "title": "שוקולד יניב",
      "description": "חנות שוקולד מעולה",
      "pageType": "store",
      "userId": "xxx",
      "pageId": "שוקולד_יניב_1760122549721_html"
    }
  ],
  "context": "מרקטפלייס - חיפוש דפים"
}
```

---

## 🎯 פלט (Output)

הבוט **חייב** להחזיר JSON נקי בפורמט הבא:

### אם נמצא דף רלוונטי:
```json
{
  "message": "מצאתי עבורך! 🎯 'שוקולד יניב' - חנות שוקולד מעולה. גולל למטה לראות את הדף!",
  "action": "scroll_to_page",
  "page_id": "שוקולד_יניב_1760122549721_html",
  "user_id": "xxx"
}
```

### אם לא נמצא דף מתאים:
```json
{
  "message": "😕 מצטער, לא מצאתי דף מתאים לחיפוש שלך. נסה לחפש משהו אחר או עיין בקטגוריות השונות.",
  "action": "none"
}
```

### אם רוצה לסנן לפי קטגוריה:
```json
{
  "message": "מצאתי כמה חנויות! 🛍️ מסנן עבורך...",
  "action": "filter_category",
  "category": "store"
}
```

---

## 🧠 לוגיקת החיפוש

1. **ניתוח הבקשה**: הבן מה המשתמש מחפש (סוג עסק, מיקום, מוצר)
2. **התאמה**: חפש ב-`title` וב-`description` של כל דף
3. **דירוג**: בחר את הדף הכי רלוונטי
4. **תגובה**: כתוב הודעה ידידותית וחמה

---

## 📝 דוגמאות

### דוגמה 1: חיפוש מוצר
**קלט**: "חפש לי שוקולד"
**פלט**:
```json
{
  "message": "🍫 מצאתי! 'שוקולד יניב' - מקום מושלם לשוקולד איכותי. גולל למטה!",
  "action": "scroll_to_page",
  "page_id": "שוקולד_יניב_1760122549721_html"
}
```

### דוגמה 2: חיפוש לפי עיר
**קלט**: "ספר בנתניה"
**פלט**:
```json
{
  "message": "מצטער 😔 כרגע אין לי ספרים בנתניה. רוצה לראות חנויות אחרות?",
  "action": "none"
}
```

### דוגמה 3: חיפוש כללי
**קלט**: "מה יש?"
**פלט**:
```json
{
  "message": "יש לי המון דפים מעניינים! 🎉 יש לנו חנויות, שירותים, קורסים ועוד. על מה אתה חושב?",
  "action": "none"
}
```

---

## ⚠️ כללים חשובים

1. **JSON בלבד**: אין markdown, אין טקסט מחוץ ל-JSON
2. **עברית תקינה**: כתוב בעברית ברורה וידידותית
3. **אמוג'י**: השתמש באמוג'י כדי להפוך את התגובה לחמה יותר
4. **קצר וממוקד**: תגובות של 1-2 משפטים
5. **תמיד עזור**: גם אם לא מצאת, הצע אלטרנטיבה

---

## 🛠️ הגדרות n8n

### Code Node (לפני AI Agent)
```javascript
// Extract input
const userMessage = $input.item.json.user_message || '';
const pageType = $input.item.json.page_type || 'marketplace';
const availablePages = $input.item.json.available_pages || [];
const context = $input.item.json.context || '';

// Format pages list for AI
let pagesText = '';
if (availablePages.length > 0) {
  pagesText = availablePages.map((page, index) => 
    `${index + 1}. ${page.title} (${page.pageType}) - ${page.description || 'אין תיאור'} [ID: ${page.pageId}]`
  ).join('\n');
} else {
  pagesText = 'אין דפים זמינים כרגע.';
}

return {
  json: {
    user_message: userMessage,
    page_type: pageType,
    available_pages_text: pagesText,
    available_pages_array: availablePages,
    context: context
  }
};
```

### AI Agent System Prompt
```
אתה עוזר חיפוש חכם במרקטפלייס של AutoPage.

תפקידך: לעזור למשתמשים למצוא את הדף המתאים ביותר לצרכיהם.

דפים זמינים:
{{ $json.available_pages_text }}

שאלת המשתמש: {{ $json.user_message }}

הנחיות:
1. נתח את שאלת המשתמש והבן מה הוא מחפש
2. חפש את הדף הכי רלוונטי מתוך הרשימה
3. 🚨 **חשוב מאוד**: החזר **רק** את האובייקט JSON הבא, ללא טקסט נוסף, ללא markdown, ללא הסבר!

אם נמצא דף מתאים - החזר בדיוק כך:
{
  "message": "🍫 מצאתי! 'שם הדף' נראה מושלם עבורך!",
  "action": "scroll_to_page",
  "page_id": "המזהה_המדויק_מהרשימה_html"
}

אם לא נמצא - החזר בדיוק כך:
{
  "message": "😕 מצטער, לא מצאתי דף מתאים. נסה לחפש משהו אחר!",
  "action": "none"
}

דוגמה מלאה:
קלט: "חפש לי שוקולד"
פלט (רק זה!):
{
  "message": "🍫 מצאתי! 'שוקולד יניב' נראה מושלם!",
  "action": "scroll_to_page",
  "page_id": "שוקולד_יניב_1760122549721_html"
}

⚠️ אל תכתוב ```json ואל תכתוב שום טקסט נוסף - רק את האובייקט!
```

---

### ⚙️ הגדרת n8n - Respond to Webhook Node

**חשוב!** ב-node של "Respond to Webhook":
- **Respond With**: JSON
- **Response Body**: `{{ $json }}`
- **NOT**: `{{ $json.output }}` או משהו אחר

זה יוודא שהתשובה תהיה JSON נקי ישירות ללא עטיפה נוספת.

---

## ✅ בדיקה

לאחר הגדרת n8n:
1. פתח את `http://localhost:3002/marketplace.html`
2. לחץ על הבועה 🤖
3. נסה: "חפש לי שוקולד"
4. וודא שהדף מודגש וגולל

---

**נוצר עבור AutoPage Marketplace Bot** 🚀

