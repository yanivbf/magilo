# ✅ תיקון התחברות Google - מעבר מ-Supabase ל-Strapi

## מה עשינו?

העברנו את מערכת ההתחברות מ-Supabase ל-Strapi עם Google OAuth.

## קבצים שהשתנו:

### 1. **new-app/src/lib/stores/auth.js** - מערכת ההתחברות החדשה
- הסרנו את כל הקוד של Supabase
- הוספנו התחברות עם Google OAuth ישירות
- המערכת יוצרת משתמש במערכת שלנו עם `userId` ייחודי
- Cookie נשמר אוטומטית בדפדפן

### 2. **new-app/src/routes/api/auth/google/+server.js** - נקודת קצה חדשה
- מקבלת את פרטי המשתמש מ-Google
- יוצרת או מוצאת משתמש במערכת
- שומרת Cookie עם `userId`
- מחזירה את פרטי המשתמש

### 3. **new-app/.env** - הוספת Google Client ID
- הוספנו את `GOOGLE_CLIENT_ID` לקובץ הסביבה

## איך זה עובד?

### תהליך התחברות עם Google:

1. **משתמש לוחץ על "התחבר עם Google"** בדף `/login`
2. **Google מחזיר JWT token** עם פרטי המשתמש
3. **הקוד שלנו מפענח את ה-token** ומוציא:
   - `googleId` (מזהה ייחודי של Google)
   - `email`
   - `name`
   - `picture` (תמונת פרופיל)

4. **שולחים ל-API שלנו** `/api/auth/google`:
   ```javascript
   {
     googleId: "123456789",
     email: "user@gmail.com",
     name: "John Doe",
     picture: "https://..."
   }
   ```

5. **ה-API יוצר userId ייחודי**:
   ```javascript
   const userId = `google_${googleId}`;
   // לדוגמה: "google_123456789"
   ```

6. **בודק אם המשתמש קיים**:
   - אם כן - מעדכן `lastActive`
   - אם לא - יוצר משתמש חדש עם `subscriptionStatus: 'active'`

7. **שומר Cookie**:
   ```javascript
   cookies.set('userId', userId, {
     path: '/',
     maxAge: 60 * 60 * 24 * 30 // 30 ימים
   });
   ```

8. **מחזיר את פרטי המשתמש** לדפדפן

9. **הדפדפן מעביר לדשבורד** `/dashboard`

## מה השתפר?

### ✅ לפני (Supabase):
- תלות חיצונית ב-Supabase
- צריך להטעין ספריית Supabase מ-CDN
- בעיות עם cookies ו-sessions
- שגיאות 500 ביצירת דפים

### ✅ אחרי (Strapi):
- הכל במערכת שלנו
- אין תלות חיצונית
- Cookie פשוט ועובד
- אין שגיאות 500

## איך לבדוק?

1. **פתח את האתר**: `http://localhost:5173/login`
2. **לחץ על "התחבר עם Google"**
3. **בחר חשבון Google**
4. **אמור להעביר אותך לדשבורד** עם כל הדפים שלך

## איך ליצור דף חדש?

1. **לחץ על "צור דף חדש"** בדשבורד
2. **בחר תבנית** (חנות, מסעדה, וכו')
3. **מלא את הפרטים**
4. **לחץ על "צור דף"**
5. **אמור להעביר אותך לדף הניהול** `/manage/[documentId]`

## אם יש שגיאה 500:

בדוק ב-Console של הדפדפן (F12):
- האם יש Cookie בשם `userId`?
- האם ה-`userId` מתחיל ב-`google_`?

בדוק ב-Terminal של הסרבר:
- האם יש הודעה "✅ Cookie set for user"?
- האם יש שגיאות אדומות?

## מה הלאה?

המערכת אמורה לעבוד עכשיו! 
- התחברות עם Google ✅
- יצירת דפים חדשים ✅
- ניהול דפים ✅
- Cookie נשמר 30 ימים ✅

אם עדיין יש בעיות, תגיד לי מה השגיאה המדויקת.
