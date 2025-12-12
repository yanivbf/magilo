# 🔧 תיקון Google OAuth - פורט 5173

## הבעיה
- השרת רץ על פורט 5173 אבל Google OAuth מוגדר לפורט 3000
- יש שגיאות CORS ו-CSP בקונסול
- לא ניתן להתחבר עם Google

## הפתרון

### 1. עדכנתי את קובץ .env:
```
PUBLIC_SITE_URL=http://localhost:5173
```

### 2. צריך לעדכן ב-Google Console:

**היכנס ל-Google Cloud Console:**
1. לך ל: https://console.cloud.google.com/
2. בחר את הפרויקט שלך
3. לך ל-APIs & Services > Credentials
4. מצא את ה-OAuth 2.0 Client ID
5. לחץ עליו לעריכה

**עדכן את ה-Authorized JavaScript origins:**
- הוסף: `http://localhost:5173`
- הסר: `http://localhost:3000` (אם קיים)

**עדכן את ה-Authorized redirect URIs:**
- הוסף: `http://localhost:5173/auth/callback`
- הוסף: `http://localhost:5173`

### 3. אחרי העדכון ב-Google Console:

1. **רענן את הדפדפן** (Ctrl+F5)
2. **נקה Cache** (F12 > Application > Storage > Clear site data)
3. **נסה להתחבר שוב**

## בדיקה מהירה:
1. פתח: http://localhost:5173/login
2. לחץ על "התחבר עם Google"
3. אמור לעבוד ללא שגיאות CORS

## אם עדיין לא עובד:
- וודא שהשרת רץ על פורט 5173
- בדוק שהגדרות Google Console נשמרו
- נסה במצב פרטי (Incognito)

המערכת אמורה לעבוד אחרי העדכון ב-Google Console!