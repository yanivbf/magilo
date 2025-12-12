# 🔧 הוסף פורט 5175 ל-Google OAuth

## 🎯 הבעיה
השרת רץ על פורט 5175 אבל Google OAuth מוגדר רק לפורט 5174.

## ✅ הפתרון

### 1. כנס ל-Google Cloud Console
```
https://console.cloud.google.com/
```

### 2. בחר את הפרויקט שלך
- AutoPage או הפרויקט הרלוונטי

### 3. עבור ל-APIs & Services > Credentials

### 4. לחץ על OAuth 2.0 Client ID שלך

### 5. הוסף את הכתובות החדשות:

**Authorized JavaScript origins:**
```
http://localhost:5175
```

**Authorized redirect URIs:**
```
http://localhost:5175/api/auth/google/callback
```

### 6. שמור את השינויים

## 🚀 אחרי השינוי
- Google OAuth יעבוד גם על פורט 5175
- המערכת תעבוד ללא בעיות
- ההתחברות תפעל כרגיל

## 📋 רשימת פורטים מאושרים (אחרי התיקון):
- ✅ http://localhost:5173
- ✅ http://localhost:5174  
- ✅ http://localhost:5175 (חדש!)

**זה יפתור את בעיית ההתחברות לגוגל!** 🎉