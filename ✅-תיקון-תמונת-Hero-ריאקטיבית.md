# ✅ תיקון תמונת Hero - גישה ריאקטיבית

## הבעיה
תמונות שהועלו למקטע ה-Hero לא הוצגו בדפים חדשים. התמונה נשמרה ב-Strapi אבל לא הופיעה בממשק.

## הסיבה השורשית
שינוי ישיר של `data.page.metadata.headerImage` לא הפעיל את הריאקטיביות של Svelte 5, במיוחד עם תחביר `$props()` החדש.

## הפתרון המיושם

### 1. מצב ריאקטיבי ייעודי
```javascript
// Create a reactive state for hero image to ensure UI updates
let heroImage = $state(data.page.metadata?.headerImage || null);
```

### 2. עדכון ה-HTML
```svelte
<section 
    class="hero-section hero section-hero" 
    class:has-custom-image={heroImage}
    id="hero"
    style={heroImage ? `--hero-bg-image: url('${heroImage}');` : ''}
>
```

### 3. עדכון פונקציית ההעלאה
```javascript
// CRITICAL: Update reactive state to trigger UI update
heroImage = url;

// Use requestAnimationFrame to ensure Svelte has updated the DOM
requestAnimationFrame(() => {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.setProperty('--hero-bg-image', `url('${url}')`);
        heroSection.classList.add('has-custom-image');
    }
});
```

### 4. עדכון פונקציית המחיקה
```javascript
// CRITICAL: Update reactive state to trigger UI update
heroImage = null;

requestAnimationFrame(() => {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.removeProperty('--hero-bg-image');
        heroSection.classList.remove('has-custom-image');
    }
});
```

### 5. שיפור ה-onMount
```javascript
if (heroImage) {
    requestAnimationFrame(() => {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.setProperty('--hero-bg-image', `url('${heroImage}')`);
            heroSection.classList.add('has-custom-image');
        }
    });
}
```

## שיפורים נוספים

### לוגים מפורטים
הוספנו console.log מקיפים כדי לעקוב אחר:
- מציאת התמונה ב-metadata
- מציאת אלמנט ה-hero בDOM
- הגדרת משתנה ה-CSS
- הוספת ה-class
- הרקע המחושב

### requestAnimationFrame
שימוש ב-`requestAnimationFrame` מבטיח ש:
1. Svelte סיימה לעדכן את ה-DOM
2. העדכונים הישירים של ה-DOM קורים בזמן הנכון
3. אין race conditions בין Svelte לבין עדכוני DOM ידניים

## איך זה עובד

### זרימת העבודה
1. **טעינת דף**: `heroImage` מאותחל מ-`data.page.metadata?.headerImage`
2. **onMount**: מחכה ל-DOM להיות מוכן ומיישם את התמונה
3. **העלאת תמונה**:
   - שומר ב-Strapi
   - מעדכן את `data.page.metadata`
   - **מעדכן את `heroImage`** (מפעיל ריאקטיביות!)
   - Svelte מעדכן את ה-HTML (style + class)
   - `requestAnimationFrame` מוודא שה-DOM מעודכן
4. **מחיקת תמונה**: אותו תהליך עם `heroImage = null`

### למה זה עובד
- `$state()` יוצר משתנה ריאקטיבי שSvelte עוקב אחריו
- כל שינוי ב-`heroImage` מפעיל עדכון אוטומטי של ה-UI
- ה-binding ב-HTML (`class:has-custom-image={heroImage}` ו-`style={...}`) מגיב מיידית
- `requestAnimationFrame` מסנכרן בין Svelte לבין עדכוני DOM ישירים

## בדיקה

### בדוק שהתמונה מוצגת:
1. צור דף חדש
2. העלה תמונה למקטע ה-Hero
3. בדוק ב-console:
   - `✅ CSS variable set to: url('...')`
   - `✅ Classes: hero-section hero section-hero has-custom-image`
   - `✅ Computed background: url('...') ...`
4. רענן את הדף - התמונה צריכה להישאר

### בדוק שהתמונה נשמרת:
```bash
node test-hero-image.html
```

## קבצים ששונו
- `new-app/src/routes/view/[slug]/+page.svelte`

## תוצאה
✅ תמונות Hero מוצגות מיידית לאחר העלאה
✅ תמונות נשמרות ונטענות בדפים קיימים
✅ הכפתור משתנה בין "העלה תמונה" ל"החלף תמונה"
✅ ריאקטיביות מלאה עם Svelte 5
