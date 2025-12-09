# 🚨 שגיאת Failed to Fetch

## השגיאה

```
TypeError: Failed to fetch
```

## מה זה אומר

הבקשה **בכלל לא מגיעה לשרת**. זו בעיית רשת/חיבור, לא שגיאה בקוד.

## סיבות אפשריות

### 1. השרת לא רץ ❌
**בדוק:** האם השרת SvelteKit רץ בפורט 5174?

**איך לבדוק:**
```cmd
netstat -ano | findstr 5174
```

**איך לתקן:**
```cmd
cd new-app
npm run dev
```

---

### 2. Strapi לא רץ ❌
**בדוק:** האם Strapi רץ בפורט 1337?

**איך לבדוק:**
```cmd
netstat -ano | findstr 1337
```

**איך לתקן:**
```cmd
cd strapi-backend
npm run develop
```

---

### 3. בעיית CORS 🔒
אם השרתים רצים אבל עדיין יש שגיאה, זו בעיית CORS.

**איך לבדוק:**
פתח F12 → Console, חפש שגיאות CORS.

---

### 4. URL לא נכון 🔗
הבקשה נשלחת ל-URL שגוי.

**בדוק בקוד:**
```javascript
const response = await fetch('/api/purchase', {  // ← זה נכון?
```

---

## 🎯 מה לעשות עכשיו

### שלב 1: בדוק שהשרתים רצים

**טרמינל 1 - SvelteKit:**
```cmd
cd new-app
npm run dev
```
אמור לראות: `Local: http://localhost:5174/`

**טרמינל 2 - Strapi:**
```cmd
cd strapi-backend
npm run develop
```
אמור לראות: `Server started on http://localhost:1337`

---

### שלב 2: נסה שוב

אחרי ששני השרתים רצים, נסה לשלוח הזמנה שוב.

---

### שלב 3: אם עדיין לא עובד

פתח F12 → Network Tab:
1. נסה לשלוח הזמנה
2. חפש את הבקשה `/api/purchase`
3. לחץ עליה
4. צפה ב-Headers ו-Response
5. העתק את כל המידע ושלח לי

---

## ✅ תיקון ממשק הניהול

ממשק הניהול כבר תוקן! הבעיה הייתה בתנאי שבדק את הפונקציה במקום לקרוא לה.

**עכשיו צריך רק לתקן את בעיית ההזמנה - ורוב הסיכויים שזה פשוט ששרת אחד לא רץ!**
