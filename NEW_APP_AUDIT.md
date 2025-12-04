# 🔍 ביקורת המערכת החדשה (new-app)

## ✅ מה כבר קיים ועובד:

### 1. תשתית בסיסית
- ✅ SvelteKit מותקן ורץ
- ✅ Strapi מחובר ועובד
- ✅ אימות משתמשים (auth.js)
- ✅ ניתוב (routing) תקין

### 2. דפים (Pages)
- ✅ דף בית (`/`)
- ✅ Login (`/login`)
- ✅ Dashboard (`/dashboard`) - מציג דפים מ-Strapi
- ✅ Marketplace (`/marketplace`) - מציג דפים פעילים
- ✅ View Page (`/view/[slug]`) - מציג דף ספציפי
- ✅ Manage Page (`/manage/[pageId]`) - ניהול דף

### 3. API Endpoints
- ✅ `/api/create-page` - יצירת דף בסיסי
- ✅ `/api/create-page-with-template` - יצירת דף עם טמפלייט
- ✅ `/api/save-page-to-strapi` - שמירת דף ב-Strapi
- ✅ `/api/pages/[userId]` - קבלת דפים של משתמש
- ✅ `/api/update-page` - עדכון דף
- ✅ `/api/delete-page` - מחיקת דף
- ✅ `/api/upload-image` - העלאת תמונות
- ✅ `/api/lead` - יצירת ליד
- ✅ `/api/leads/[pageId]` - קבלת לידים
- ✅ `/api/purchase` - יצירת רכישה
- ✅ `/api/purchases/[pageId]` - קבלת רכישות
- ✅ `/api/appointments/[pageId]` - ניהול תורים
- ✅ `/api/day-settings/[pageId]` - הגדרות ימי עבודה
- ✅ `/api/tts` - המרת טקסט לדיבור
- ✅ `/api/stav-search` - חיפוש חכם

### 4. קומפוננטות (Components)
- ✅ `TemplateSelector` - בחירת טמפלייט
- ✅ `DynamicForm` - טופס דינמי
- ✅ `ProductGallery` - גלריית מוצרים
- ✅ `BookingCalendar` - יומן תורים
- ✅ `EventForm` - טופס אירוע
- ✅ `ImageUploader` - העלאת תמונות
- ✅ `StavBot` - בוט AI
- ✅ `AppointmentQueueManager` - ניהול תורים
- ✅ `GuestListRSVPManager` - ניהול אורחים
- ✅ `CourierManager` - ניהול משלוחים
- ✅ `DaySettingsManager` - הגדרות ימי עבודה

### 5. טמפלייטים (Templates)
- ✅ `store.js` - חנות מקוונת
- ✅ `service.js` - בעל מקצוע
- ✅ `event.js` - אירוע
- ✅ `course.js` - קורס
- ✅ `artist.js` - אמן
- ✅ `message.js` - מסר בבקבוק
- ✅ HTML Templates: `store.html`, `service.html`

---

## ❌ מה חסר (צריך להעביר מהמערכת הישנה):

### 1. יוצר דפים (Page Creator)
- ❌ **UI מלא ליצירת דפים** - כרגע רק iframe למערכת הישנה
- ❌ **טפסים דינמיים לכל סוג דף** - צריך Svelte components
- ❌ **בחירת מקטעים אופציונליים** - checkboxes לשאלות ותשובות, גלריה וכו'
- ❌ **תצוגה מקדימה (Preview)** - לראות את הדף לפני שמירה
- ❌ **עורך תמונות** - crop, resize
- ❌ **בחירת עיצוב (Design Styles)** - צבעים, פונטים

### 2. יצירת HTML מלא
- ⚠️ **templateEngine.js** - קיים אבל לא מלא
  - חסר: הזרקת מקטעים דינמיים (FAQ, Gallery, Video)
  - חסר: תמיכה בכל סוגי הדפים
  - חסר: יצירת HTML מלא עם כל הסקריפטים

### 3. עיבוד דפים
- ⚠️ **pageProcessor.js** - קיים אבל חלקי
  - יש: cleanHtml, injectScripts, removeEditorTools
  - חסר: תיקוני WhatsApp מלאים
  - חסר: תיקוני Store מלאים

### 4. חילוץ מידע
- ⚠️ **dataExtractor.js** - קיים אבל בסיסי
  - יש: extractContactInfo, extractProducts, extractDescription
  - חסר: חילוץ מקטעים (FAQ, Gallery, Video)
  - חסר: חילוץ metadata מלא

---

## 🎯 מה צריך לעשות:

### שלב 1: בניית Page Creator חדש ב-Svelte
```
new-app/src/routes/page-creator/+page.svelte
```
צריך להחליף את ה-iframe בממשק מלא:
- בחירת סוג דף (TemplateSelector - כבר קיים!)
- טופס דינמי לפי סוג הדף (DynamicForm - כבר קיים!)
- בחירת מקטעים אופציונליים (צריך להוסיף)
- העלאת תמונות (ImageUploader - כבר קיים!)
- תצוגה מקדימה (צריך להוסיף)

### שלב 2: השלמת templateEngine.js
צריך להוסיף:
- פונקציות ליצירת מקטעים דינמיים (כבר התחלתי!)
- תמיכה בכל סוגי הדפים
- יצירת HTML מלא עם סקריפטים

### שלב 3: השלמת pageProcessor.js
צריך להוסיף:
- תיקוני WhatsApp מלאים (כבר יש חלקית)
- תיקוני Store מלאים (כבר יש חלקית)
- תיקוני Event מלאים

### שלב 4: בדיקה ותיקון
- לוודא שדפים נוצרים נכון
- לוודא שכל הפיצ'רים עובדים
- לוודא שהכל נשמר ב-Strapi

---

## 📊 סטטוס נוכחי:

```
יוצר דפים:     20% ✅ (יש תשתית, חסר UI מלא)
טמפלייטים:     60% ✅ (יש טמפלייטים, חסר תוכן דינמי)
עיבוד דפים:    70% ✅ (יש עיבוד בסיסי, חסר תיקונים)
חילוץ מידע:    50% ✅ (יש בסיס, חסר מקטעים)
תצוגת דפים:    90% ✅ (עובד מעולה!)
ניהול דפים:    95% ✅ (עובד מעולה!)
```

**סה"כ: המערכת החדשה מוכנה ב-~60%**

---

## 🚀 התוכנית:

1. **קצר טווח (עכשיו):**
   - השתמש במערכת הישנה ליצירת דפים
   - המערכת החדשה מנהלת ומציגה

2. **ארוך טווח (בעתיד):**
   - בנה Page Creator חדש ב-Svelte
   - העבר את כל הלוגיקה
   - הסר את המערכת הישנה לגמרי

**כרגע המערכת עובדת היברידית - יצירה בישן, ניהול בחדש. זה בסדר לעכשיו!** ✅
