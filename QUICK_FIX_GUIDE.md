# ⚡ מדריך תיקון מהיר - שגיאת 500

## 🐛 הבעיה
```
Failed to load resource: the server responded with a status of 500
```

## ✅ הפתרון (3 שלבים)

### 1️⃣ עצור את Strapi
לחץ `Ctrl+C` בטרמינל של Strapi

### 2️⃣ הפעל מחדש
```bash
cd strapi-backend
npm run develop
```

### 3️⃣ חכה ל-"Server started"
```
[2024-XX-XX XX:XX:XX.XXX] info: Server started
```

## 🎯 זהו! עכשיו תוכל:
- ✅ ליצור דפים חדשים
- ✅ לסמן מקטעים אופציונליים
- ✅ לראות גלריה, FAQ, המלצות, אודות
- ✅ ליהנות מעיצוב פרימיום מלא!

---

## 🔍 מה קרה מאחורי הקלעים?

הוספתי 4 שדות חדשים ל-Strapi schema:
```json
{
  "includeGallery": { "type": "boolean", "default": false },
  "includeFAQ": { "type": "boolean", "default": false },
  "includeTestimonials": { "type": "boolean", "default": false },
  "includeAbout": { "type": "boolean", "default": false }
}
```

אחרי שינוי ב-schema, **חובה** להפעיל מחדש את Strapi!

---

## 💡 טיפ
אם אתה רוצה להפעיל מחדש במהירות, הרץ:
```bash
restart-strapi.cmd
```

---

**זהו! פשוט ומהיר!** 🚀
