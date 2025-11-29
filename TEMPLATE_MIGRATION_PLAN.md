# 🎨 תוכנית העברת תבניות HTML למערכת החדשה

## הבעיה
המערכת החדשה יוצרת רק HTML בסיסי, לא אתרים מעוצבים מלאים כמו במערכת הישנה.

## הפתרון
להעתיק את התבניות HTML מהמערכת הישנה למערכת החדשה ולהשתמש בהן.

## שלב 1: העתקת תבניות
```
page-creator/templates/online-store-template.html
→ new-app/src/lib/templates/html/store.html

page-creator/templates/service-provider-template.html  
→ new-app/src/lib/templates/html/service.html
```

## שלב 2: יצירת מנגנון Template Engine
צריך פונקציה שמחליפה placeholders:
- `{{BUSINESS_NAME}}` → שם העסק
- `{{META_DESCRIPTION}}` → תיאור
- `{{PHONE}}` → טלפון
- וכו'

## שלב 3: שימוש בתבניות ב-API
ב-`create-page-with-template/+server.js`:
1. טען את התבנית המתאימה (store/service/event)
2. החלף את ה-placeholders בנתונים אמיתיים
3. שמור את ה-HTML המלא ב-Strapi

## יתרונות
✅ אתרים מעוצבים מלאים
✅ תאימות מלאה למערכת הישנה
✅ שימוש ב-Strapi לאחסון
✅ הטפסים של SvelteKit עובדים

## זמן ביצוע
~2-3 שעות עבודה
