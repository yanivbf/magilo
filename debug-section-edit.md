# 🔍 בדיקת עריכת מקטעים

## מה לבדוק

1. פתח את הדף שלך: `http://localhost:5173/view/[הסלאג-שלך]`
2. פתח את ה-Console (F12)
3. לחץ על טקסט במקטע "אודות"
4. ערוך את הטקסט
5. לחץ מחוץ לשדה

## מה אמור לקרות

בקונסול תראה:
```
💾 Saving field: "sections.0.data.title"
💾 Value: הטקסט החדש
📄 Page ID (documentId): fatwpc2p7xxnl9x9sm7nfv8r
📦 Request body: {"pageId":"...","field":"sections.0.data.title","value":"..."}
📡 Response status: 200
✅ Saved successfully: {success: true, pageId: "...", updated: "sections.0.data.title"}
```

## אם הדף מתרענן

אם הדף מתרענן אוטומטית, זה אומר שיש איפשהו קוד שעושה `window.location.reload()` או `window.location.href = ...`

## איפה לחפש

בדוק אם יש שגיאות בקונסול שגורמות לדף להיטען מחדש.

## מה עשיתי

תיקנתי את הקוד כך שהוא **שומר** את שדה ה-`id` המספרי במקטעים (Strapi צריך אותו כדי לזהות איזה מקטע לעדכן).

הקוד עכשיו:
- ✅ מסיר רק את `documentId` (Strapi לא מקבל אותו)
- ✅ שומר את `id` המספרי (Strapi צריך אותו!)

## בדיקה נוספת

אם השמירה עובדת אבל הדף מתרענן, אפשר לבדוק ישירות ב-Strapi:

1. פתח: `http://localhost:1337/admin`
2. לך ל-Content Manager > Pages
3. פתח את הדף שלך
4. בדוק אם השינוי נשמר במקטע

אם השינוי נשמר ב-Strapi אבל לא נשאר אחרי רענון, זה אומר שיש בעיה בטעינת הדף מ-Strapi.
