# 🔧 תיקון Google OAuth מהיר

## 🎯 הבעיה
Google OAuth לא עובד כי חסר Client Secret ויש בעיות בהגדרות.

## ✅ פתרון מהיר - התחברות זמנית

בואו ניצור התחברות זמנית שתעבוד בלי Google OAuth:

### 1. עדכן את דף ההתחברות

```javascript
// במקום Google OAuth, נשתמש בהתחברות זמנית
function loginTemporary() {
    const userId = 'temp_user_' + Date.now();
    
    // שמור ב-localStorage
    localStorage.setItem('userId', userId);
    
    // שמור ב-cookie
    document.cookie = `userId=${userId}; path=/; max-age=${60*60*24*30}`;
    
    // הפנה לדשבורד
    window.location.href = '/dashboard';
}
```

### 2. או תקן את Google OAuth

אם אתה רוצה לתקן את Google OAuth:

1. **לך ל-Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **בחר את הפרויקט שלך**

3. **עבור ל-APIs & Services > Credentials**

4. **לחץ על OAuth 2.0 Client ID שלך**

5. **העתק את Client Secret**

6. **הוסף אותו ל-.env:**
   ```
   GOOGLE_CLIENT_SECRET=your-actual-secret-here
   ```

7. **וודא שהכתובות נכונות:**
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173/api/auth/google`

## 🚀 מה לעשות עכשיו:

1. **פתח את:** `http://localhost:5173/login`
2. **השתמש בהתחברות זמנית** או תקן את Google OAuth
3. **בדוק שיצירת דפים עובדת**

## 📋 הערות:
- ההתחברות הזמנית תעבוד לבדיקות
- Google OAuth יעבוד אחרי שתוסיף את ה-Client Secret
- כל הפונקציות האחרות יעבדו כרגיל