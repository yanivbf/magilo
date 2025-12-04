# 🔧 תיקון זמני - הגדרת User ID

## הבעיה

אין סרגל עריכה כי המערכת לא יודעת מי המשתמש המחובר.

## הפתרון הזמני

פתח את הקונסול בדפדפן (F12) והרץ:

```javascript
// הגדר userId זמני
document.cookie = "userId=temp_user; path=/; max-age=31536000";

// רענן את הדף
location.reload();
```

עכשיו סרגל העריכה אמור להופיע!

## הפתרון הקבוע

צריך ליצור מערכת login אמיתית. יש 2 אופציות:

### אופציה 1: Login פשוט (מהיר)

צור דף `/login` שמבקש username ושומר אותו ב-cookie.

### אופציה 2: Google OAuth (מקצועי)

יש לך כבר spec ל-Google OAuth ב-`.kiro/specs/google-oauth-strapi/`

## איך לבדוק אם זה עובד

1. פתח דף שיצרת
2. פתח Developer Tools (F12)
3. לך ל-Application → Cookies
4. בדוק אם יש `userId` cookie
5. אם כן - סרגל העריכה אמור להופיע

## איך לבדוק מי הבעלים של דף

כל דף נשמר עם `userId` ב-Strapi. אם ה-`userId` שלך תואם ל-`userId` של הדף, אתה הבעלים.

## Debug

אם עדיין לא עובד, בדוק:

```javascript
// בקונסול:
console.log('Cookie:', document.cookie);
console.log('Page data:', window.location.href);
```

ותראה לי מה מודפס.

