# 📋 תכנון מערכת התבניות - AutoPage

## 🎯 מטרה
יצירת 6 תבניות HTML מוכנות שמקבלות נתונים מטפסים ומייצרות דפים מושלמים תוך שניות.

---

## 🏗️ ארכיטקטורה

### זרימת עבודה:
```
משתמש ממלא טופס
        ↓
page-creator.html בוחר תבנית לפי pageType
        ↓
התבנית נטענת + מילוי placeholders
        ↓
HTML מושלם (פונקציונלי + יפה)
        ↓
שמירה + יצירת metadata
        ↓
Dashboard מציג כפתור ממשק נכון
```

---

## 📚 התבניות

### 1️⃣ **appointment-template.html** (נותן שירות + יומן)

**Placeholders מהטופס:**
- `{{BUSINESS_NAME}}` - שם העסק
- `{{BUSINESS_DESCRIPTION}}` - תיאור קצר
- `{{PHONE}}` - טלפון
- `{{EMAIL}}` - אימייל
- `{{ADDRESS}}` - כתובת
- `{{WORKING_DAYS}}` - JSON: [0,1,2,3,4,5] (ימי עבודה)
- `{{WORKING_HOURS}}` - JSON: {start: "09:00", end: "17:00"}
- `{{BREAKS}}` - JSON: [{start: "13:00", end: "14:00"}]
- `{{SERVICES}}` - JSON: [{name, duration, price}]
- `{{THEME_COLOR}}` - צבע ראשי
- `{{USER_ID}}` - מזהה משתמש
- `{{PAGE_ID}}` - מזהה דף

**Placeholders לבוט (עתידי):**
- `{{AI_ABOUT}}` - תיאור מפורט על העסק
- `{{AI_WHY_US}}` - למה לבחור בנו
- `{{AI_TEAM}}` - הצוות שלנו
- `{{AI_TESTIMONIALS}}` - המלצות לקוחות
- `{{AI_FAQ}}` - שאלות נפוצות

**ממשק ניהול:** `appointments-admin.html` (תצוגת יומן + מועדון לקוחות)

**JavaScript מובנה:**
- יומן אינטראקטיבי
- בחירת תאריכים
- API calls ל-/api/appointments
- הרשמה לתור + WhatsApp

---

### 2️⃣ **store-template.html** (חנות מקוונת)

**Placeholders מהטופס:**
- `{{STORE_NAME}}` - שם החנות
- `{{STORE_DESCRIPTION}}` - תיאור החנות
- `{{PHONE}}` - טלפון
- `{{EMAIL}}` - אימייל
- `{{PRODUCTS}}` - JSON: [{name, price, image, description}]
- `{{SHIPPING_INFO}}` - מידע משלוחים
- `{{PAYMENT_METHODS}}` - אמצעי תשלום
- `{{THEME_COLOR}}` - צבע עיצוב
- `{{USER_ID}}`, `{{PAGE_ID}}`

**Placeholders לבוט:**
- `{{AI_ABOUT_STORE}}` - על החנות
- `{{AI_PRODUCT_DESCRIPTIONS}}` - תיאורי מוצרים
- `{{AI_WHY_BUY}}` - למה לקנות כאן
- `{{AI_RETURN_POLICY}}` - מדיניות החזרות

**ממשק ניהול:** `store-admin.html` (קופה + מלאי + הזמנות)

**JavaScript מובנה:**
- עגלת קניות
- מערכת תשלום
- API calls ל-/api/purchases
- ניהול מלאי

---

### 3️⃣ **event-template.html** (אירוע/הזמנה)

**Placeholders מהטופס:**
- `{{EVENT_NAME}}` - שם האירוע
- `{{EVENT_DATE}}` - תאריך ושעה
- `{{EVENT_LOCATION}}` - מיקום
- `{{EVENT_DESCRIPTION}}` - תיאור האירוע
- `{{HOST_NAME}}` - שם המארח
- `{{PHONE}}`, `{{EMAIL}}`
- `{{MAX_GUESTS}}` - מספר מוזמנים מקסימלי
- `{{TICKET_PRICE}}` - מחיר כרטיס (אם יש)
- `{{DRESS_CODE}}` - קוד לבוש
- `{{THEME_COLOR}}`
- `{{USER_ID}}`, `{{PAGE_ID}}`

**Placeholders לבוט:**
- `{{AI_EVENT_STORY}}` - סיפור האירוע
- `{{AI_SCHEDULE}}` - לוח זמנים
- `{{AI_WHY_COME}}` - למה להגיע
- `{{AI_PARKING_INFO}}` - מידע חניה

**ממשק ניהול:** `rsvp-admin.html` (רשימת מוזמנים + אישורים)

**JavaScript מובנה:**
- טופס הרשמה
- אישור הגעה
- WhatsApp אישור
- מונה משתתפים

---

### 4️⃣ **course-template.html** (קורסים דיגיטליים)

**Placeholders מהטופס:**
- `{{COURSE_NAME}}` - שם הקורס
- `{{COURSE_DESCRIPTION}}` - תיאור
- `{{INSTRUCTOR_NAME}}` - שם המרצה
- `{{COURSE_PRICE}}` - מחיר
- `{{COURSE_DURATION}}` - משך הקורס
- `{{LESSONS}}` - JSON: [{title, video, duration, description}]
- `{{PHONE}}`, `{{EMAIL}}`
- `{{THEME_COLOR}}`
- `{{USER_ID}}`, `{{PAGE_ID}}`

**Placeholders לבוט:**
- `{{AI_COURSE_BENEFITS}}` - מה תלמדו
- `{{AI_WHO_FOR}}` - למי מתאים
- `{{AI_INSTRUCTOR_BIO}}` - על המרצה
- `{{AI_TESTIMONIALS}}` - המלצות תלמידים

**ממשק ניהול:** `course-admin.html` (תלמידים + רכישות + תוכן)

**JavaScript מובנה:**
- נגן וידאו
- מערכת תשלום
- נעילת תוכן
- מעקב התקדמות

---

### 5️⃣ **service-template.html** (נותן שירות ללא יומן)

**Placeholders מהטופס:**
- `{{BUSINESS_NAME}}` - שם העסק
- `{{BUSINESS_DESCRIPTION}}` - תיאור
- `{{SERVICES_LIST}}` - רשימת שירותים
- `{{PORTFOLIO}}` - JSON: [{image, title, description}]
- `{{PHONE}}`, `{{EMAIL}}`, `{{ADDRESS}}`
- `{{SOCIAL_MEDIA}}` - JSON: {facebook, instagram, ...}
- `{{THEME_COLOR}}`
- `{{USER_ID}}`, `{{PAGE_ID}}`

**Placeholders לבוט:**
- `{{AI_ABOUT}}` - אודות העסק
- `{{AI_SERVICES_DETAIL}}` - פירוט שירותים
- `{{AI_PROJECTS}}` - פרויקטים שביצענו
- `{{AI_WHY_CHOOSE}}` - למה לבחור בנו

**ממשק ניהול:** `leads-admin.html` (פניות + לידים)

**JavaScript מובנה:**
- טופס יצירת קשר
- גלריה אינטראקטיבית
- API calls ל-/api/leads
- WhatsApp ישיר

---

### 6️⃣ **landing-template.html** (דף נחיתה כללי)

**Placeholders מהטופס:**
- `{{PAGE_TITLE}}` - כותרת הדף
- `{{HEADLINE}}` - כותרת ראשית
- `{{SUBHEADLINE}}` - כותרת משנה
- `{{CTA_TEXT}}` - טקסט קריאה לפעולה
- `{{CTA_LINK}}` - קישור
- `{{PHONE}}`, `{{EMAIL}}`
- `{{FEATURES}}` - JSON: [{icon, title, description}]
- `{{THEME_COLOR}}`
- `{{USER_ID}}`, `{{PAGE_ID}}`

**Placeholders לבוט:**
- `{{AI_HERO_TEXT}}` - טקסט hero
- `{{AI_BENEFITS}}` - יתרונות
- `{{AI_HOW_IT_WORKS}}` - איך זה עובד
- `{{AI_SOCIAL_PROOF}}` - הוכחות חברתיות

**ממשק ניהול:** `leads-admin.html` (פניות)

**JavaScript מובנה:**
- טופס לידים
- Smooth scroll
- אנימציות
- API calls ל-/api/leads

---

## 🎨 עיצוב משותף

### כל התבניות יכללו:
1. **Header נעול (sticky)**
   - לוגו/שם עסק
   - ניווט
   - טלפון
   - CTA button

2. **Hero Section**
   - רקע מרשים
   - כותרת גדולה
   - תת-כותרת
   - CTA ראשי

3. **About Section**
   - תיאור העסק/שירות
   - תמונה
   - פרטי קשר

4. **Main Content**
   - תלוי בסוג הדף (יומן/מוצרים/שיעורים/וכו')

5. **Social Proof**
   - המלצות
   - ספירות (לקוחות, שנות ניסיון)
   - לוגואים

6. **Contact/CTA Section**
   - טופס או כפתור ראשי
   - פרטי קשר

7. **Footer**
   - פרטי קשר
   - רשתות חברתיות
   - זכויות יוצרים

### CSS משותף:
- משתנים לצבעים
- Responsive (Mobile-first)
- אנימציות חלקות
- פונטים מ-Google Fonts
- Tailwind או CSS טהור

---

## 🔧 מבנה טכני

### כל תבנית תכלול:

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="page-type" content="{{PAGE_TYPE}}">
    <title>{{PAGE_TITLE}}</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/..." rel="stylesheet">
    
    <style>
        /* CSS מלא */
    </style>
</head>
<body>
    <!-- HTML Structure -->
    
    <script>
        // Configuration from metadata
        const USER_ID = '{{USER_ID}}';
        const PAGE_ID = '{{PAGE_ID}}';
        const CONFIG = {{CONFIG_JSON}};
        
        // JavaScript functionality
    </script>
</body>
</html>
```

---

## 📊 מיפוי ממשקי ניהול

| pageType | תבנית | ממשק ניהול |
|----------|-------|------------|
| serviceProvider + appointments | appointment-template.html | appointments-admin.html |
| serviceProvider (no appointments) | service-template.html | leads-admin.html |
| onlineStore | store-template.html | store-admin.html |
| event | event-template.html | rsvp-admin.html |
| onlineCourse | course-template.html | course-admin.html |
| landing | landing-template.html | leads-admin.html |

---

## ✅ לוח זמנים

### שבוע 1:
- [ ] תכנון + מסמך זה
- [ ] appointment-template.html (2 ימים)
- [ ] בדיקות + תיקונים

### שבוע 2:
- [ ] store-template.html (1.5 יום)
- [ ] event-template.html (1.5 יום)
- [ ] בדיקות

### שבוע 3:
- [ ] course-template.html (1.5 יום)
- [ ] service-template.html (1 יום)
- [ ] landing-template.html (1 יום)
- [ ] בדיקות

### שבוע 4:
- [ ] אינטגרציה ב-page-creator.html
- [ ] בדיקות מקיפות
- [ ] תיעוד למפתחים
- [ ] הכנה לשילוב N8N

---

## 🚀 Phase 2 - שילוב N8N (עתידי)

### זרימה:
```
1. משתמש ממלא טופס
2. page-creator שולח ל-N8N:
   - התבנית הבסיסית (עם placeholders)
   - כל הנתונים מהטופס
3. N8N שולח ל-ChatGPT:
   - "כתוב תיאור יפה על מספרה בשם X..."
4. ChatGPT מחזיר תוכן
5. N8N ממלא את ה-AI placeholders
6. N8N מחזיר HTML מושלם
7. page-creator שומר ומציג
```

---

## 📝 הערות חשובות

1. **כל התבניות עצמאיות** - לא תלויות ב-N8N, עובדות תמיד
2. **Placeholders ברורים** - קל למלא ידנית או אוטומטית
3. **Fallback** - אם N8N נכשל, התבנית הבסיסית עובדת
4. **ממשקי ניהול נשארים** - אין שינוי בלוגיקה הקיימת
5. **נקודת שחזור** - commit a698304 תמיד זמין

---

**📅 תאריך יצירה:** 17/11/2025  
**🔄 עדכון אחרון:** 17/11/2025  
**✍️ נוצר על ידי:** Claude (עם יניב)

