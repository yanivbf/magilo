# 📋 רשימת בדיקה - Google OAuth

## מה עשינו (הושלם ✅):

- [x] עדכנו את Client ID החדש בקוד
- [x] עדכנו את `.env`
- [x] עדכנו את `auth.js`
- [x] השרתים רצים

---

## מה אתה צריך לעשות (תסמן ✅):

### בדיקה 1: Google Console
- [ ] פתחתי את https://console.cloud.google.com/apis/credentials
- [ ] מצאתי את Client ID: `965923411238...`
- [ ] לחצתי עליו לעריכה

### בדיקה 2: JavaScript Origins
- [ ] הוספתי: `http://localhost:5173`
- [ ] לא הוספתי שום דבר ב-Redirect URIs
- [ ] לחצתי "SAVE"

### בדיקה 3: המתנה
- [ ] חיכיתי 1-2 דקות
- [ ] סגרתי את הדפדפן
- [ ] פתחתי מחדש

### בדיקה 4: בדיקת התחברות
- [ ] פתחתי: http://localhost:5173/login
- [ ] לחצתי "התחבר עם Google"
- [ ] בחרתי חשבון Google
- [ ] זה עבד! 🎉

---

## אם זה לא עובד:

### שגיאה: "origin_mismatch"
**פתרון:** ודא שהוספת בדיוק: `http://localhost:5173`

### שגיאה: "popup_closed_by_user"
**פתרון:** זה בסדר, פשוט נסה שוב

### שגיאה: "access_denied"
**פתרון:** בחר חשבון Google אחר או אשר את ההרשאות

### שגיאה: 500 Internal Server Error
**פתרון:** בדוק ש-Strapi רץ על http://localhost:1337

---

## בדיקה מהירה - השרתים רצים?

**Strapi Backend:**
```
http://localhost:1337/admin
```
אמור להראות את דף הניהול של Strapi

**SvelteKit Frontend:**
```
http://localhost:5173
```
אמור להראות את דף הבית

---

## אם השרתים לא רצים:

**הפעל אותם:**
```cmd
start-all.cmd
```

או ידנית:

**Terminal 1 - Strapi:**
```cmd
cd strapi-backend
npm run develop
```

**Terminal 2 - SvelteKit:**
```cmd
cd new-app
npm run dev
```

---

## סיכום:

**מה צריך להיות ב-Google Console:**

```
Authorized JavaScript origins:
✅ http://localhost:5173

Authorized redirect URIs:
(ריק - אל תוסיף כלום!)
```

---

**אחרי שזה עובד, תגיד לי "עובד!" ונמשיך! 🚀**

