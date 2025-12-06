# 🚨 תיקון דשבורד - פעולות מיידיות

## 🎯 הבעיות

1. ❌ כתוב "ללא שם" במקום שם הדף
2. ❌ כפתור "צפה" נותן שגיאת 404
3. ❌ כפתור "הפעל מנוי Premium" לא מוצג
4. ❌ כשמפעילים מנוי הסטטוס לא משתנה

## ⚡ פתרון מהיר - 3 פקודות

### 1️⃣ תקן את הכותרות החסרות

```bash
node check-and-fix-pages.js
```

הסקריפט יבדוק את כל הדפים ויתקן כותרות חסרות אוטומטית.

### 2️⃣ הפעל מנוי למשתמש

```bash
node activate-subscription.js 36c0bd16-5a25-45a3-8735-8b5913ccc9c9
```

**החלף את ה-ID** עם ה-userId שלך מה-URL של הדשבורד.

### 3️⃣ רענן את הדשבורד

לחץ F5 בדפדפן או פתח מחדש:
```
http://localhost:5173/dashboard?userId=36c0bd16-5a25-45a3-8735-8b5913ccc9c9
```

## ✅ מה אמור לקרות

אחרי הפקודות האלה:

1. ✅ **הכותרת תופיע** - במקום "ללא שם" תראה "חנות מקוונת" או סוג הדף
2. ✅ **כפתור "צפה" יעבוד** - יפתח את הדף בטאב חדש
3. ✅ **סטטוס המנוי ישתנה** - תראה "⭐ Premium" בראש הדף
4. ✅ **כפתור "הפעל מנוי" ייעלם** - במקומו תראה "מנוי פעיל - נותרו X ימים"

## 🔍 בדיקה

פתח את ה-Console (F12) ובדוק שאתה רואה:

```
📊 Dashboard data: {
  pagesCount: 3,
  subscriptionStatus: "active",  ← צריך להיות "active"
  userId: "36c0bd16-5a25-45a3-8735-8b5913ccc9c9"
}

📄 First page details: {
  title: "חנות מקוונת",  ← צריך להיות שם אמיתי
  slug: "hnvt-mqvvnt",    ← צריך להיות slug
  pageType: "store",
  id: 1,
  documentId: "abc123"
}
```

## 🐛 אם עדיין לא עובד

### בעיה: הכותרת עדיין "ללא שם"

**פתרון**: הדף נוצר בלי כותרת. צריך לערוך אותו:
1. לחץ על כפתור "ערוך"
2. הוסף כותרת
3. שמור

### בעיה: כפתור "צפה" עדיין נותן 404

**פתרון**: ה-slug חסר. בדוק ב-Console מה הערך של `slug`.
אם הוא `undefined`, צריך ליצור slug ידנית ב-Strapi.

### בעיה: סטטוס המנוי לא השתנה

**פתרון**: בדוק שה-userId נכון:
```bash
# הצג את כל המשתמשים
curl http://localhost:1337/api/users \
  -H "Authorization: Bearer 8ba3301bbe92b271829befae8c0c268dbe65efa2bd66517f9309d2e3127c36eca41e91db5a53deb48e8d8aaf095d700bbc4dd1ab32ad509705723f052241d1f0a352eb020cb675aa2e4d733d4bb48855d206eafed5d1196975ad06365767082044a7b5d955e5e3b43398e13aabee36a89e70392a390ef5b96bb4deff6ca43c6a"
```

## 📝 קבצים שנוצרו

1. ✅ `check-and-fix-pages.js` - תיקון כותרות
2. ✅ `activate-subscription.js` - הפעלת מנוי
3. ✅ `new-app/src/routes/api/subscription/activate-user/+server.js` - API להפעלת מנוי
4. ✅ `new-app/src/routes/dashboard/+page.svelte` - דשבורד עם דיבאג

## 🎯 סיכום

הרץ את 2 הפקודות האלה ורענן את הדשבורד:

```bash
node check-and-fix-pages.js
node activate-subscription.js 36c0bd16-5a25-45a3-8735-8b5913ccc9c9
```

אחרי זה הכל אמור לעבוד! 🎉
