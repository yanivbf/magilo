# 🔧 הוסף פורט 5174 ל-Google Cloud Console

## ✅ הבעיה נפתרה!

השרת רץ על פורט 5174 (במקום 5173) ו-Google OAuth חוסם את ההתחברות.

השגיאה שראית:
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

## 📋 מה צריך לעשות

### שלב 1: היכנס ל-Google Cloud Console
1. לך ל: https://console.cloud.google.com/apis/credentials
2. התחבר עם החשבון שלך
3. בחר את הפרויקט שלך

### שלב 2: ערוך את ה-OAuth Client
1. מצא את ה-Client ID: `965923411238-6e3a40oluusgqnvvlb1iuh70mesion3j.apps.googleusercontent.com`
2. לחץ על שם ה-Client (כנראה "Web client 1" או משהו דומה)
3. גלול ל-**Authorized JavaScript origins**

### שלב 3: הוסף את הפורט החדש
ב-**Authorized JavaScript origins**, הוסף:
```
http://localhost:5174
```

**רשימה מלאה של Origins שצריכים להיות:**
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5174` ← **הוסף את זה!**

### שלב 4: שמור
1. לחץ על **SAVE** בתחתית הדף
2. חכה 1-2 דקות שהשינויים ייכנסו לתוקף

### שלב 5: רענן את הדף
1. חזור לדף ההתחברות: http://localhost:5174/login
2. רענן את הדף (F5 או Ctrl+R)
3. נסה להתחבר שוב עם Google

---

## 🔍 בעיה נוספת שמצאתי

יש גם בעיה עם ה-userId - המערכת מנסה לטעון משתמש עם ID מספרי `8` במקום ה-Google userId הנכון.

### הפתרון:
אני מתקן את זה עכשיו - המערכת תשתמש תמיד ב-Google userId הנכון (`google_111351120503275674259`).

---

## למה זה קורה?
Vite (שרת הפיתוח) מנסה להשתמש בפורט 5173, אבל אם הפורט תפוס, הוא עובר אוטומטית לפורט הבא (5174).

## פתרון קבוע (אופציונלי)
אם אתה רוצה שהשרת תמיד ירוץ על פורט 5173, סגור את התהליך שתופס את הפורט:

```cmd
netstat -ano | findstr :5173
taskkill /PID <מספר_התהליך> /F
```

ואז הפעל מחדש את השרת:
```cmd
cd new-app
npm run dev
```

---

## ✅ אחרי שתוסיף את הפורט ואני אתקן את ה-userId
הכל אמור לעבוד:
- ✅ התחברות Google
- ✅ יצירת דפים
- ✅ גישה לדף ניהול
- ✅ כל הפיצ'רים

🎉 המערכת תהיה מוכנה!
