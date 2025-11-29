# 🔄 שימוש במערכת הישנה עם Strapi

## הבעיה
המערכת החדשה לא יוצרת דפים מלאים עם כל הפיצ'רים (שאלות ותשובות, גלריה, וידאו, קישורים לרשתות).

## הפתרון
השתמש במערכת הישנה שעובדת מושלם, אבל עדכן אותה לשמור ב-Strapi.

## שלבים

### 1. הפעל את המערכת הישנה
```bash
node server.js
```
זה יפעיל את השרת על `http://localhost:3002`

### 2. פתח את יוצר הדפים הישן
```
http://localhost:3002/page-creator-legacy.html
```

### 3. צור דף חדש
המערכת הישנה תיצור דף מלא עם:
- ✅ שאלות ותשובות
- ✅ גלריית תמונות
- ✅ וידאו
- ✅ קישורים לרשתות חברתיות
- ✅ גלריית מוצרים עם כפתור "הוסף לעגלה"
- ✅ יומן תורים
- ✅ כל הפיצ'רים

### 4. הדף יישמר ב-`output/`
הדף המלא יישמר בתיקייה `output/temp_user/`

### 5. העתק את הדף ל-Strapi (ידני)
1. פתח את הדף שנוצר ב-`output/`
2. העתק את כל ה-HTML
3. פתח את Strapi Admin: `http://localhost:1337/admin`
4. צור דף חדש ב-Pages
5. הדבק את ה-HTML בשדה `htmlContent`
6. שמור

## אופציה 2: עדכן את המערכת הישנה לשמור ב-Strapi

ערוך את `server.js` ושנה את הפונקציה שמשמרת דפים:

```javascript
// במקום לשמור ב-database.json
// שמור ב-Strapi דרך API

const response = await fetch('http://localhost:3000/api/create-page-with-template', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: userId,
    pageData: pageData,
    pageType: pageType
  })
});
```

## אופציה 3: השתמש במערכת החדשה אבל עם הטמפלייטים הישנים

העתק את הטמפלייטים המלאים מ-`output/` ל-`new-app/src/lib/templates/html/`

---

## המלצה שלי

**השתמש באופציה 1** - המערכת הישנה עובדת מושלם. פשוט תשתמש בה ליצירת דפים, ואז תעתיק את ה-HTML ל-Strapi ידנית.

זה הכי מהיר והכי בטוח.
