# 🔧 הגדרת Google OAuth - מדריך מלא

## הבעיה:
Google מחזיר שגיאה: `origin_mismatch :400`

זה אומר ש-`localhost:5173` לא רשום כדומיין מורשה ב-Google Cloud Console.

---

## הפתרון - 5 שלבים פשוטים:

### שלב 1: פתח את Google Cloud Console

**לחץ על הקישור הזה:**
```
https://console.cloud.google.com/apis/credentials
```

או:
1. לך ל: `https://console.cloud.google.com`
2. לחץ על **APIs & Services** בתפריט השמאלי
3. לחץ על **Credentials**

---

### שלב 2: מצא את ה-OAuth Client ID שלך

חפש את ה-Client ID הזה:
```
965923411238-6e3a40oluusgqnvvlb1iuh70mesion3j.apps.googleusercontent.com
```

**איך למצוא:**
1. בדף Credentials, תראה רשימה של OAuth 2.0 Client IDs
2. חפש את זה שמתחיל ב-`965923411238`
3. **לחץ על שם ה-Client ID** (לא על האייקון!)

---

### שלב 3: הוסף Authorized JavaScript origins

בדף העריכה, גלול ל-**Authorized JavaScript origins**

**לחץ על "ADD URI"** והוסף את הכתובות האלה (אחת אחת):

```
http://localhost:5173
```

```
http://localhost:3000
```

```
http://localhost:5000
```

```
http://127.0.0.1:5173
```

**חשוב:** אל תשכח את `http://` בהתחלה!

---

### שלב 4: הוסף Authorized redirect URIs (אופציונלי)

אם יש סעיף **Authorized redirect URIs**, הוסף גם:

```
http://localhost:5173/login
```

```
http://localhost:5173/dashboard
```

**אבל זה לא חובה!** Google Identity Services לא צריך redirect URIs.

---

### שלב 5: שמור!

1. **לחץ על "SAVE"** בתחתית הדף
2. **חכה 1-2 דקות** (Google צריך לעדכן את ההגדרות)
3. **סגור את הדפדפן ופתח מחדש** (כדי לנקות cache)

---

## עכשיו נסה שוב!

1. **פתח את האתר:**
   ```
   http://localhost:5173/login
   ```

2. **לחץ על "התחבר עם Google"**

3. **בחר חשבון Google**

4. **אמור לעבוד!** ✅

---

## אם עדיין לא עובד:

### בדיקה 1: ודא שהכתובת נכונה

בדוק ב-Console (F12) מה הכתובת שGoogle מנסה לאשר:

```
origin_mismatch: http://localhost:5173
```

אם זה `http://localhost:5173` - הוסף את זה בדיוק!
אם זה `http://127.0.0.1:5173` - הוסף גם את זה!

### בדיקה 2: נקה Cache

1. **לחץ Ctrl+Shift+Delete**
2. **בחר "Cached images and files"**
3. **לחץ "Clear data"**
4. **נסה שוב**

### בדיקה 3: חכה 5 דקות

לפעמים Google לוקח זמן לעדכן את ההגדרות.
שתה קפה וחזור ☕

---

## תמונות להמחשה:

### איך זה אמור להיראות:

**Authorized JavaScript origins:**
```
✅ http://localhost:5173
✅ http://localhost:3000
✅ http://127.0.0.1:5173
```

**Authorized redirect URIs:** (אופציונלי)
```
✅ http://localhost:5173/login
✅ http://localhost:5173/dashboard
```

---

## אם אין לך גישה ל-Google Cloud Console:

אם אתה לא הבעלים של הפרויקט ב-Google Cloud:

1. **צור OAuth Client ID חדש:**
   - לך ל: https://console.cloud.google.com/apis/credentials
   - לחץ **"+ CREATE CREDENTIALS"**
   - בחר **"OAuth client ID"**
   - בחר **"Web application"**
   - הוסף את הכתובות מלמעלה
   - העתק את ה-Client ID החדש

2. **עדכן את הקוד:**
   - פתח: `new-app/src/lib/stores/auth.js`
   - החלף את `GOOGLE_CLIENT_ID` עם ה-ID החדש

---

## סיכום:

**מה צריך להוסיף ב-Google Console:**

1. ✅ `http://localhost:5173` ב-Authorized JavaScript origins
2. ✅ `http://localhost:3000` ב-Authorized JavaScript origins  
3. ✅ `http://127.0.0.1:5173` ב-Authorized JavaScript origins
4. ✅ שמור
5. ✅ חכה 1-2 דקות
6. ✅ נסה שוב!

**זה הכל!** 🎉

---

## אחרי שזה עובד:

תגיד לי "עובד!" ונמשיך הלאה! 🚀
