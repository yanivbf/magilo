# 🔧 תיקון Google OAuth - פורט URGENT

## 🚨 הבעיה
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

## 🎯 הפתרון

### שלב 1: זהה את הפורט הנוכחי
הפורט הנוכחי שלך הוא: **5173** (או אחר)

### שלב 2: פתח Google Console
1. לך ל: https://console.developers.google.com/apis/credentials
2. בחר את הפרויקט שלך
3. לחץ על Google OAuth Client ID

### שלב 3: הוסף את הכתובות החדשות

#### Authorized JavaScript origins:
```
http://localhost:5173
http://127.0.0.1:5173
```

#### Authorized redirect URIs:
```
http://localhost:5173/api/auth/google
http://127.0.0.1:5173/api/auth/google
```

### שלב 4: שמור ובדוק

## 🔄 אלטרנטיבה - החזר לפורט 3000
אם אתה רוצה לחזור לפורט 3000 (שכבר מוגדר):

```bash
# עצור את השרת הנוכחי
# הפעל מחדש עם פורט 3000
npm run dev -- --port 3000
```

## ✅ בדיקה
אחרי התיקון, בדוק:
1. פתח את הדף
2. לחץ על "התחבר עם Google"
3. אמור לעבוד בלי שגיאות

## 🎯 פורטים נוכחיים מוגדרים ב-Google:
- http://localhost:3000
- http://localhost:5173
- http://localhost:5174
- http://localhost:5175

אם אתה משתמש בפורט אחר, הוסף אותו!