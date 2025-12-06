# בדיקה ותיקון בעיית הבעלות

## הבעיה
אתה רואה `Is owner: false` בקונסול למרות שאתה מחובר ויצרת את הדף.

## הסיבה
יש אי-התאמה בין ה-userId בעוגייה (cookie) לבין ה-createdByUserId שנשמר בדף.

## פתרון מהיר - 3 שלבים:

### שלב 1: בדוק את ה-userId שלך
1. פתח את הדף שיצרת
2. פתח את הקונסול (F12)
3. הקלד:
```javascript
document.cookie
```
4. חפש `userId=XXXXX` והעתק את הערך

### שלב 2: הרץ את סקריפט התיקון
```bash
node fix-ownership.js
```

הסקריפט יעדכן את כל הדפים עם ה-userId הנכון.

### שלב 3: רענן את הדף
לחץ F5 או Ctrl+R

---

## אם זה לא עובד - פתרון חלופי:

### אופציה 1: צור דף חדש
1. לך ל-Dashboard
2. לחץ "צור דף חדש"
3. הדף החדש יווצר עם הבעלות הנכונה

### אופציה 2: התחבר מחדש
1. לך ל-`/login`
2. התחבר שוב
3. צור דף חדש

---

## איך לבדוק שזה עובד?
1. פתח את הדף שיצרת
2. פתח קונסול (F12)
3. אמור לראות: `👤 Is owner: true`
4. אמור לראות:
   - כפתור "החלף רקע" בצד שמאל של תמונת הרקע
   - סמלי מצלמה על כל התמונות בגלריה
   - סרגל עריכה עם 3 כפתורים למעלה

---

## למה זה קורה?
כשיצרת דפים לפני התיקון, הם לא נשמרו עם `createdByUserId` ב-metadata.
עכשיו הקוד מחפש את זה כדי לדעת מי הבעלים של הדף.

הסקריפט `fix-ownership.js` מוסיף את זה לכל הדפים הישנים.
