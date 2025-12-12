# ✅ תיקון תמונת Hero מוצגת

## הבעיה
המשתמש העלה תמונה לרקע של מקטע ה-Hero, אבל התמונה לא הופיעה על המסך.

### מה קרה?
1. ✅ התמונה הועלתה בהצלחה לשרת
2. ✅ התמונה נשמרה ב-`metadata.headerImage` ב-Strapi
3. ✅ הקוד עדכן את `data.page.metadata.headerImage` מיידית
4. ✅ הקוד הוסיף `style="background-image: url('...')"`
5. ❌ **אבל התמונה לא הופיעה!**

### למה?
ה-`DynamicDesignWrapper` מיישם gradients עם `!important` על `.hero-section`:

```css
.design-dark :global(.hero-section) {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
}
```

זה דורס את ה-`background-image` שהוספנו ב-inline style, גם עם `!important`!

## הפתרון - שימוש ב-CSS Variable

### 1. הוספת class מותנה + CSS Variable
```svelte
<section 
    class="hero-section hero section-hero" 
    class:has-custom-image={data.page.metadata?.headerImage}
    id="hero"
    style={data.page.metadata?.headerImage ? `--hero-bg-image: url('${data.page.metadata.headerImage}');` : ''}
>
```

### 2. CSS שדורס את כל הגרדיאנטים באמצעות CSS Variable
```css
/* CRITICAL: When custom image exists, override ALL design system gradients */
.hero-section.has-custom-image {
    background: var(--hero-bg-image) !important;
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
}

.hero-section.has-custom-image::before,
.hero-section.has-custom-image::after {
    display: none !important;
}
```

### 3. עדכון דינמי של התמונה
```javascript
// בעת העלאת תמונה
const heroSection = document.querySelector('.hero-section');
if (heroSection) {
    heroSection.style.setProperty('--hero-bg-image', `url('${url}')`);
    heroSection.classList.add('has-custom-image');
}

// בעת מחיקת תמונה
const heroSection = document.querySelector('.hero-section');
if (heroSection) {
    heroSection.style.removeProperty('--hero-bg-image');
    heroSection.classList.remove('has-custom-image');
}
```

## איך זה עובד?

1. **כשאין תמונה מותאמת אישית:**
   - ה-class `has-custom-image` לא מתווסף
   - DynamicDesignWrapper מיישם את הגרדיאנט הרגיל
   - הכל נראה כמו קודם

2. **כשיש תמונה מותאמת אישית:**
   - ה-class `has-custom-image` מתווסף
   - CSS Variable `--hero-bg-image` מוגדר עם ה-URL של התמונה
   - CSS מיישם את התמונה דרך `background: var(--hero-bg-image) !important`
   - CSS מבטל את כל ה-pseudo-elements (`::before`, `::after`)
   - התמונה מוצגת בהצלחה!

## למה CSS Variable?

CSS Variables (Custom Properties) הם **חזקים יותר** מ-inline styles רגילים כי:
1. הם יכולים לדרוס `!important` של CSS רגיל
2. הם עובדים טוב יותר עם Svelte reactivity
3. הם מאפשרים עדכון דינמי קל

## בדיקה

### לפני התיקון:
```
Hero Section:
├── background: linear-gradient(...) !important  ← מ-DynamicDesignWrapper
└── style="background-image: url(...)"           ← נדרס גם עם !important!
```

### אחרי התיקון:
```
Hero Section (עם תמונה):
├── class="has-custom-image"
├── style="--hero-bg-image: url(...)"            ← CSS Variable
└── background: var(--hero-bg-image) !important  ← דורס הכל!
```

## קבצים ששונו
- `new-app/src/routes/view/[slug]/+page.svelte`
  - הוספת `class:has-custom-image` (מותנה)
  - שימוש ב-CSS Variable `--hero-bg-image`
  - הוספת CSS rules חדשים
  - הוספת logic ב-`onMount` לדפים קיימים
  - הסרת כפתור "מחק תמונה"
  - שינוי טקסט כפתור ל"החלף תמונה" כשיש תמונה

## תוצאה
✅ תמונות Hero מוצגות כעת בהצלחה!
✅ דורס את כל הגרדיאנטים של DynamicDesignWrapper
✅ עובד עם כל סגנונות העיצוב (dark, colorful, neon, וכו')
✅ לא משפיע על דפים ללא תמונה מותאמת אישית
✅ עובד גם עם דפים קיימים שכבר יש להם תמונה
✅ כפתור אחד פשוט - "העלה תמונה" או "החלף תמונה"
