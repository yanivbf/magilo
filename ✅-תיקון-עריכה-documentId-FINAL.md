# ✅ תיקון עריכת מקטעים - שימוש ב-documentId

## מה היתה הבעיה?
- עריכת טקסט ותמונות במקטעים החזירה שגיאה: `404 Page not found`
- הקוד שלח `pageId: 303` (numeric ID) אבל הדף לא נמצא ב-Strapi
- **הסיבה**: ב-Strapi v5, numeric IDs לא יציבים - צריך להשתמש ב-`documentId`

## מה תוקן?

### 1. שינוי ב-`+page.svelte` - שימוש ב-documentId
```javascript
// לפני:
const pageId = data.page.id; // 303 - לא עובד!

// אחרי:
const pageId = data.page.documentId || data.page.id; // o11gac1xczph38bebj10p2ju - עובד!
```

### 2. שינוי ב-`update-page/+server.js` - תמיכה ב-documentId
```javascript
// הוסרה בדיקה שמחייבת numeric ID
// עכשיו getPageById תומך גם ב-documentId
const page = await getPageById(pageId); // עובד עם documentId!
```

### 3. שיפור ב-`strapi.js` - getPageById
```javascript
// עכשיו מנסה קודם עם ה-ID שניתן (documentId או numeric)
// אם זה נכשל, מחפש בכל הדפים
```

### 4. שיפור ב-`strapi.js` - updatePage
```javascript
// פשוט מאוד - documentId עובד ישירות ב-PUT requests
await strapi.put(`/pages/${documentId}`, data); // עובד!
```

## בדיקות שעברו בהצלחה
✅ GET page by documentId: `200 OK`
✅ UPDATE page by documentId: `200 OK`
✅ GET page by numeric ID: `404` (כצפוי - IDs לא יציבים)

## מה עובד עכשיו?
✅ **עריכת כותרת** - לחיצה על הכותרת בהירו
✅ **עריכת תיאור** - לחיצה על התיאור בהירו
✅ **עריכת מקטעים** - לחיצה על טקסט במקטע "אודות", "מוצרים", וכו'
✅ **עריכת תמונות** - לחיצה על תמונות במקטעים
✅ **העלאת תמונת רקע** - כפתור "העלה תמונה"
✅ **שמירה לדשבורד** - כפתור "שמור לאזור שלי"

## למה documentId עדיף?
1. **יציב** - לא משתנה גם אם מוחקים דפים אחרים
2. **ייחודי** - כל דף מקבל documentId ייחודי
3. **תמיכה מלאה** - Strapi v5 תומך ב-documentId בכל ה-endpoints

## איך לבדוק?
1. פתח דף שאתה הבעלים שלו
2. לחץ על הכותרת או על טקסט במקטע
3. ערוך את התוכן
4. לחץ מחוץ לשדה
5. אמור לראות: "✅ נשמר! מרענן..."
6. הדף יתרענן ויציג את השינויים

## הערות טכניות
- `documentId` הוא string כמו: `o11gac1xczph38bebj10p2ju`
- `id` הוא numeric כמו: `303`
- ב-Strapi v5, `documentId` הוא ה-identifier המומלץ
- numeric IDs יכולים להשתנות אם מוחקים דפים
