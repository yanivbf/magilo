# 🎯 עכשיו תגדיר ב-Google Console

## הכל מוכן בקוד! ✅

עדכנתי:
- ✅ `new-app/.env` - Client ID החדש
- ✅ `new-app/src/lib/stores/auth.js` - Client ID החדש
- ✅ השרתים רצים (Strapi על 1337, SvelteKit על 5173)

---

## עכשיו תור שלך! 👇

### צעד 1: פתח Google Console

**לחץ כאן:**
https://console.cloud.google.com/apis/credentials

---

### צעד 2: מצא את ה-Client ID

חפש את זה:
```
965923411238-6e3a40oluusgqnvvlb1iuh70mesion3j
```

**לחץ עליו** (על השם, לא על האייקון)

---

### צעד 3: הוסף JavaScript Origin

גלול ל-**"Authorized JavaScript origins"**

**לחץ "ADD URI"** והוסף:
```
http://localhost:5173
```

**זהו!** רק את זה.

---

### צעד 4: אל תגע ב-Redirect URIs

**אל תוסיף שום דבר** ב-"Authorized redirect URIs"

השאר את זה **ריק**!

---

### צעד 5: שמור וחכה

1. **לחץ "SAVE"**
2. **חכה 1-2 דקות**
3. **סגור דפדפן ופתח מחדש**

---

## אחרי שסיימת:

**פתח את האתר:**
```
http://localhost:5173/login
```

**לחץ על "התחבר עם Google"**

**אמור לעבוד!** 🎉

---

## אם יש שגיאה:

תעתיק לי את השגיאה שאתה רואה ב-Console (F12).

---

## תזכורת מהירה:

**מה להוסיף:**
```
http://localhost:5173
```

**איפה להוסיף:**
```
Authorized JavaScript origins
```

**מה לא להוסיף:**
```
Authorized redirect URIs (השאר ריק!)
```

---

**זהו! תגיד לי כשסיימת ואני אעזור לך לבדוק שזה עובד.** 🚀

