# ✅ תיקון שגיאת "Invalid key documentId"

## הבעיה שתוקנה
כשניסית לערוך טקסט או להעלות תמונות במקטעים, קיבלת שגיאה:
```
Failed to update page - Invalid key documentId
```

## הסיבה
הפונקציה `updatePage()` ב-`strapi.js` הייתה שולחת את ה-`documentId` בתוך ה-payload של הבקשה:
```javascript
PUT /api/pages/o11gac1xczph38bebj10p2ju
Body: { data: { documentId: "o11gac1xczph38bebj10p2ju", sections: [...] } }
```

Strapi v5 דוחה את זה כי `documentId` הוא מזהה ולא שדה שאפשר לעדכן.

## התיקון
עכשיו הפונקציה מסירה את `documentId` ו-`id` מה-payload לפני השליחה:
```javascript
const { documentId, id: numericId, ...cleanData } = data;
const result = await strapi.put(`/pages/${id}`, cleanData);
```

## מה עובד עכשיו
✅ עריכת כותרת ראשית (Hero title) - עבד גם לפני  
✅ עריכת תיאור (Hero description) - עבד גם לפני  
✅ העלאת תמונת רקע (Header image) - עבד גם לפני  
✅ **עריכת טקסט במקטעים** - תוקן עכשיו!  
✅ **העלאת תמונות במקטע אודות** - תוקן עכשיו!  
✅ **העלאת תמונות במקטע מוצרים** - תוקן עכשיו!  
✅ כפתור "שמור לדשבורד" - עבד גם לפני

## איך לבדוק
1. לך לדף שלך: http://localhost:5173/view/brit-olam-1
2. נסה לערוך טקסט במקטע מוצרים או אודות
3. נסה להעלות תמונה במקטע אודות
4. אמור לראות "✅ נשמר! מרענן..." ללא שגיאות

## הקובץ שתוקן
- `new-app/src/lib/server/strapi.js` - פונקציה `updatePage()`

התיקון פשוט ויעיל - מסיר שדות שלא צריך לשלוח ל-Strapi.
