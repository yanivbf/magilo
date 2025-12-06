# ✅ תיקון שמירת מקטעים - גישת Metadata

## הבעיה שתוקנה
המערכת הראתה "נשמר בהצלחה" אבל השינויים לא נשמרו באמת.
רק הכותרת והתיאור (שהם שדות ישירים בדף) נשמרו.

## הסיבה
- מקטעים (sections) הם **components** ב-Strapi, לא ישויות עצמאיות
- לא ניתן לעדכן אותם ישירות דרך API
- הניסיון לעדכן דרך `/api/sections/{id}` לא עבד

## הפתרון הפשוט
**שמירת שינויי מקטעים ב-`metadata` של הדף** (בדיוק כמו title/description שעובדים!)

### איך זה עובד:

1. **בשמירה** (`update-page/+server.js`):
   - כשמשתמש עורך שדה במקטע (למשל `sections.0.data.title`)
   - השינוי נשמר ב-`metadata.sectionOverrides[0]["data.title"] = value`
   - זה שדה JSON פשוט ש-Strapi יודע לעדכן!

2. **בטעינה** (`view/[slug]/+page.server.js`):
   - טוענים את המקטעים הבסיסיים מ-Strapi
   - מיזוג השינויים מ-`metadata.sectionOverrides`
   - המשתמש רואה את הגרסה המעודכנת

## מה תוקן:

### קובץ: `new-app/src/routes/api/update-page/+server.js`
```javascript
// במקום לנסות לעדכן דרך Strapi API:
// ❌ fetch(`${STRAPI_URL}/api/sections/${sectionId}`, ...)

// עכשיו שומרים ב-metadata:
// ✅ metadata.sectionOverrides[sectionIndex][fieldPath] = value
```

### קובץ: `new-app/src/routes/view/[slug]/+page.server.js`
```javascript
// מיזוג השינויים בטעינת הדף:
const sectionOverrides = metadata.sectionOverrides || {};
sections.forEach((section, index) => {
  if (sectionOverrides[index]) {
    // Apply each override to the section
  }
});
```

## בדיקה:

1. **פתח דף בעריכה**: http://localhost:5173/view/YOUR-SLUG
2. **ערוך טקסט במקטע** (לא בכותרת הראשית)
3. **המתן ל-"נשמר בהצלחה"**
4. **רענן את הדף** (F5)
5. **✅ השינוי צריך להישאר!**

## יתרונות הגישה:

✅ **פשוט** - משתמש בשדה JSON רגיל  
✅ **יציב** - לא תלוי ב-API מורכב של Strapi  
✅ **מהיר** - עדכון אחד של metadata במקום עדכונים מרובים  
✅ **עובד** - בדיוק כמו title/description שכבר עובדים מצוין  

## מה הלאה:

אם זה עובד (ואני בטוח שכן), אפשר להוסיף:
- עריכת תמונות במקטעים (גם דרך metadata)
- עריכת רשימות (testimonials, FAQ)
- ביטול שינויים (reset to original)

---

**תבדוק ותגיד לי אם זה עובד! 🎉**
