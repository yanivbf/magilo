# 🎭 מדריך: דמות סתיו המדברת

## מה חדש?

הוספתי **דמות מרחפת מונפשת** של סתיו שמדברת בצ'אט! 

### ✨ תכונות:

1. **דמות מרחפת** - סתיו מרחפת מעל חלון הצ'אט
2. **אנימציית דיבור** - הפה נפתח ונסגר בזמן דיבור
3. **גלי קול** - עיגולים מתפשטים סביב הדמות בזמן דיבור
4. **אינדיקטור חשיבה** - שלוש נקודות מהבהבות כשסתיו חושבת
5. **אנימציית ריחוף** - הדמות "רוקדת" באוויר
6. **הצ'אט נשאר כמו שהוא** - שום דבר לא השתנה בצ'אט עצמו

---

## 🎨 איך זה עובד?

### אוטומטית:
- **כשסתיו מדברת** - הדמות מתחילה לדבר (פה נפתח, גלי קול)
- **כשהדיבור נגמר** - הדמות נעצרת אוטומטית
- **כשהצ'אט סגור** - הדמות מתחבאת

### מיקום:
- **מחשב**: מעל הצ'אט בצד ימין
- **מובייל**: מעל הצ'אט במרכז

---

## 📸 איך להוסיף תמונה של סתיו?

אם יש לך תמונה של סתיו, תוכל להחליף את הדמות המונפשת בתמונה שלך!

### שלב 1: שמור את התמונה
שמור את התמונה בתיקייה `public/` עם השם `stav-avatar.png` (או `jpg`)

### שלב 2: הפעל את הקוד הבא
פתח את `public/marketplace.html` וחפש את השורה:

```javascript
// Example: Set custom image (if provided by user)
// window.stavAvatarController.setAvatarImage('/path/to/stav-image.png');
```

הסר את `//` בתחילת השורה ושנה את הנתיב:

```javascript
// Set custom image for Stav avatar
window.stavAvatarController.setAvatarImage('/stav-avatar.png');
```

**זהו!** עכשיו התמונה שלך תופיע במקום הדמות המונפשת.

---

## 🎯 דוגמאות לשימוש

### להסתיר את הדמות:
```javascript
window.stavAvatarController.hide();
```

### להראות את הדמות:
```javascript
window.stavAvatarController.show();
```

### להתחיל דיבור ידני:
```javascript
window.stavAvatarController.startSpeaking();
```

### להפסיק דיבור ידני:
```javascript
window.stavAvatarController.stopSpeaking();
```

### להראות אינדיקטור "חושבת":
```javascript
window.stavAvatarController.startThinking();
```

### להפסיק אינדיקטור "חושבת":
```javascript
window.stavAvatarController.stopThinking();
```

---

## 🔧 התאמה אישית

### לשנות גודל:
פתח `public/marketplace.html` וחפש את:
```css
.stav-avatar {
    width: 120px;
    height: 120px;
}
```

שנה ל:
```css
.stav-avatar {
    width: 150px;  /* גודל יותר גדול */
    height: 150px;
}
```

### לשנות מיקום:
```css
.stav-avatar-container {
    bottom: 480px;  /* מרחק מלמטה */
    right: 24px;    /* מרחק מימין */
}
```

### לשנות צבעים:
```css
.stav-avatar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

## 📱 תאימות

- ✅ Chrome / Edge
- ✅ Firefox
- ✅ Safari
- ✅ מובייל (iOS + Android)

---

## 🚀 איך להתחיל?

1. **הפעל את השרת**: `npm start`
2. **פתח את הדף**: `http://localhost:3000/marketplace`
3. **פתח את הצ'אט** - לחץ על הבועה של סתיו
4. **תדבר עם סתיו** - השתמש במיקרופון או כתוב
5. **תראה את הדמות מדברת!** 🎉

---

## 🎁 בונוס: אם יש לך תמונה של סתיו

שלח לי את התמונה ואני אעזור לך להוסיף אותה!

הדמות תופיע עם התמונה שלך ותדבר בדיוק כמו הדמות המונפשת.

---

**נהנה? תשאיר לי 5 כוכבים!** ⭐⭐⭐⭐⭐









