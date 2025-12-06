# ✅ התחברות זמנית עד תיקון Google OAuth

## הבעיה
ההתחברות עם Google לא עובדת ב-localhost כי:
- Google Client ID לא מוגדר נכון ל-localhost
- צריך להוסיף את localhost ל-Authorized origins ב-Google Console

## הפתרון הזמני

### דף `/set-user` - יצירת משתמש מהירה
עכשיו אפשר ליצור משתמש חדש בקלות:

1. **לך ל-`http://localhost:5173/set-user`**
2. **לחץ על "🎲 אקראי"** - יצור UUID, שם ואימייל אוטומטית
3. **לחץ על "✅ צור משתמש והתחבר"**
4. **המערכת תיצור משתמש ב-Strapi** ותעביר אותך לדשבורד

### מה קורה מאחורי הקלעים?

1. **API Endpoint חדש**: `/api/user/create-or-find`
   - מחפש משתמש לפי UUID
   - אם לא קיים - יוצר חדש
   - מחזיר את ה-ID המספרי של Strapi

2. **יצירת משתמש ב-Strapi**:
   ```javascript
   {
       name: "משתמש 123",
       email: "user123@autopage.local",
       userId: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
       wallet: 0,
       subscriptionStatus: "inactive"
   }
   ```

3. **שמירת Cookie**:
   - `userId=xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
   - תקף ל-365 ימים

4. **הפניה לדשבורד**:
   - `/dashboard?userId=xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

## איך להשתמש?

### אופציה 1: יצירה אוטומטית (מומלץ)
1. לך ל-`/set-user`
2. לחץ "🎲 אקראי"
3. לחץ "✅ צור משתמש והתחבר"

### אופציה 2: הזנה ידנית
1. לך ל-`/set-user`
2. הזן שם, אימייל ו-UUID
3. לחץ "✅ צור משתמש והתחבר"

### אופציה 3: Google OAuth (כשיתוקן)
1. לך ל-`/login`
2. לחץ על כפתור Google
3. התחבר עם חשבון Google

## קבצים חדשים

### `new-app/src/routes/api/user/create-or-find/+server.js`
```javascript
// מחפש או יוצר משתמש ב-Strapi
export async function POST({ request }) {
    const { userId, email, name } = await request.json();
    
    // חיפוש לפי UUID
    const searchResponse = await fetch(
        `${STRAPI_URL}/api/users?filters[userId][$eq]=${userId}`,
        ...
    );
    
    // אם לא נמצא - צור חדש
    if (!found) {
        const createResponse = await fetch(
            `${STRAPI_URL}/api/users`,
            {
                method: 'POST',
                body: JSON.stringify({
                    data: {
                        name, email, userId,
                        wallet: 0,
                        subscriptionStatus: 'inactive'
                    }
                })
            }
        );
    }
    
    return json({ strapiUserId });
}
```

### `new-app/src/routes/set-user/+page.svelte` (עודכן)
- הוסף שדות שם ואימייל
- הוסף כפתור "🎲 אקראי"
- קורא ל-API endpoint
- מעביר לדשבורד אחרי הצלחה

## תיקון Google OAuth (לעתיד)

כדי לתקן את ההתחברות עם Google:

1. **לך ל-Google Cloud Console**
2. **בחר את הפרויקט**
3. **APIs & Services > Credentials**
4. **ערוך את OAuth 2.0 Client ID**
5. **הוסף ל-Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://localhost:3000`
6. **הוסף ל-Authorized redirect URIs**:
   - `http://localhost:5173/login`
   - `http://localhost:3000/login`
7. **שמור**

## סטטוס: ✅ פתרון זמני עובד

עכשיו אפשר ליצור משתמשים ולהתחבר בקלות עד שנתקן את Google OAuth.
