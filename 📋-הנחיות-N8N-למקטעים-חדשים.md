# 📋 הנחיות N8N - כתיבה למקטעים החדשים

## 🎯 מה הבוט צריך לעשות?

הבוט ב-N8N צריך ליצור תוכן **למקטעים** (sections) במבנה הספציפי של המערכת החדשה.

---

## 📦 המבנה הנכון שהבוט צריך להחזיר

```json
{
  "faq": [
    {
      "id": 1,
      "question": "שאלה ראשונה?",
      "answer": "תשובה מפורטת לשאלה הראשונה..."
    },
    {
      "id": 2,
      "question": "שאלה שנייה?",
      "answer": "תשובה מפורטת לשאלה השנייה..."
    }
  ],
  "gallery": [
    "https://via.placeholder.com/600x400",
    "https://via.placeholder.com/600x400",
    "https://via.placeholder.com/600x400"
  ],
  "testimonials": [
    {
      "id": 1,
      "name": "שם הלקוח",
      "text": "המלצה מפורטת על השירות המעולה...",
      "role": "מנהל/ת חברה",
      "rating": 5,
      "image": "https://via.placeholder.com/100x100"
    },
    {
      "id": 2,
      "name": "שם לקוח נוסף",
      "text": "חוויה נהדרת, שירות מקצועי...",
      "role": "בעל/ת עסק",
      "rating": 5,
      "image": "https://via.placeholder.com/100x100"
    }
  ],
  "aboutText": "טקסט מפורט על העסק, הערכים, החזון והשירותים שאנחנו מציעים...",
  "services": [
    {
      "id": 1,
      "name": "שם השירות הראשון",
      "description": "תיאור מפורט של השירות",
      "price": 150,
      "duration": 60,
      "icon": "⚡"
    },
    {
      "id": 2,
      "name": "שם השירות השני",
      "description": "תיאור מפורט של השירות",
      "price": 200,
      "duration": 90,
      "icon": "🎯"
    }
  ]
}
```

---

## 🔧 System Message ל-N8N

העתק והדבק את זה ב-System Message של ה-AI node:

```
אתה מומחה ביצירת תוכן מקצועי בעברית לדפי נחיתה.

המשימה שלך: ליצור תוכן טקסטואלי למקטעים שונים של דף נחיתה.

🚨 חשוב מאוד:
- קרא את המידע שהמשתמש נתן (businessName, serviceType, description)
- כתוב תוכן רלוונטי בלבד למידע שניתן
- אל תמציא מידע שלא ניתן!

החזר JSON במבנה הזה בדיוק:

{
  "faq": [
    {
      "id": 1,
      "question": "שאלה רלוונטית לעסק?",
      "answer": "תשובה מפורטת ומקצועית..."
    },
    {
      "id": 2,
      "question": "שאלה נוספת?",
      "answer": "תשובה מפורטת..."
    },
    {
      "id": 3,
      "question": "שאלה שלישית?",
      "answer": "תשובה מפורטת..."
    }
  ],
  "gallery": [
    "https://via.placeholder.com/600x400",
    "https://via.placeholder.com/600x400",
    "https://via.placeholder.com/600x400",
    "https://via.placeholder.com/600x400"
  ],
  "testimonials": [
    {
      "id": 1,
      "name": "שם לקוח",
      "text": "המלצה מפורטת ואמיתית על השירות...",
      "role": "תפקיד/מקצוע",
      "rating": 5,
      "image": "https://via.placeholder.com/100x100"
    },
    {
      "id": 2,
      "name": "שם לקוח נוסף",
      "text": "חוויה מעולה, שירות מקצועי...",
      "role": "תפקיד/מקצוע",
      "rating": 5,
      "image": "https://via.placeholder.com/100x100"
    },
    {
      "id": 3,
      "name": "שם לקוח שלישי",
      "text": "ממליץ בחום, תוצאות מצוינות...",
      "role": "תפקיד/מקצוע",
      "rating": 5,
      "image": "https://via.placeholder.com/100x100"
    }
  ],
  "aboutText": "טקסט מפורט על העסק - מי אנחנו, מה אנחנו מציעים, הערכים שלנו, החזון שלנו. כתוב לפחות 3-4 משפטים מקצועיים ומשכנעים.",
  "services": [
    {
      "id": 1,
      "name": "שם השירות",
      "description": "תיאור מפורט של השירות",
      "price": 150,
      "duration": 60,
      "icon": "⚡"
    },
    {
      "id": 2,
      "name": "שירות נוסף",
      "description": "תיאור מפורט",
      "price": 200,
      "duration": 90,
      "icon": "🎯"
    }
  ]
}

כללים חשובים:
1. עברית תקינה ומקצועית
2. תוכן רלוונטי למידע שניתן בלבד
3. לפחות 3 פריטים בכל מערך (faq, testimonials, services)
4. לפחות 4 תמונות ב-gallery
5. aboutText - לפחות 3-4 משפטים
6. החזר רק JSON נקי - ללא ```json, ללא הסברים!
7. התחל מיד ב-{ וסיים ב-}
```

---

## 💬 User Message ל-N8N

העתק והדבק את זה ב-Prompt (User Message):

```
צור תוכן מקצועי בעברית עבור העסק הבא:

שם העסק: {{ $json.body.businessName }}
סוג השירות: {{ $json.body.serviceType }}
תיאור: {{ $json.body.description }}

חשוב מאוד:
- כתוב תוכן רלוונטי בלבד למידע שניתן
- אם זה "רופא שיניים" - כתוב על רפואת שיניים בלבד
- אם זה "מספרה" - כתוב על שירותי מספרה בלבד
- אל תמציא מידע!

צור:
- 3-5 שאלות ותשובות (faq)
- 4-6 תמונות placeholder (gallery)
- 3-4 המלצות לקוחות (testimonials)
- טקסט אודות מפורט (aboutText)
- 2-4 שירותים (services)

החזר JSON במבנה המדויק מה-System Message!
החזר רק JSON - ללא ```json, ללא הסברים!
```

---

## 🧹 ניקוי התשובה (Code Node)

אם הבוט מחזיר ```json בתחילה, הוסף Code node אחרי ה-AI:

```javascript
// Clean the AI response
const text = $input.item.json.output || $input.item.json.text || $input.item.json.response;

// Remove markdown code blocks
let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

// Parse JSON
try {
  const parsed = JSON.parse(cleaned);
  return { json: parsed };
} catch (error) {
  console.error('Failed to parse JSON:', error);
  console.error('Cleaned text:', cleaned);
  throw new Error('Invalid JSON from AI');
}
```

---

## 📤 שליחה למערכת

אחרי שהבוט מחזיר את ה-JSON, המערכת תשלח אותו ל:

```
PUT /api/pages/{pageId}/content-sections
```

עם הגוף:
```json
{
  "faq": [...],
  "gallery": [...],
  "testimonials": [...]
}
```

---

## ✅ בדיקה

### 1. בדוק שהבוט מחזיר JSON נקי:
```json
{
  "faq": [...],
  "gallery": [...],
  "testimonials": [...],
  "aboutText": "...",
  "services": [...]
}
```

### 2. בדוק שאין ```json בתחילה
אם יש - הוסף את ה-Code node לניקוי

### 3. בדוק שהתוכן רלוונטי
אם המשתמש כתב "רופא שיניים" - התוכן צריך להיות על רפואת שיניים בלבד

---

## 🐛 פתרון בעיות נפוצות

### בעיה: הבוט מחזיר ```json
**פתרון**: הוסף Code node לניקוי (ראה למעלה)

### בעיה: הבוט כותב תוכן לא רלוונטי
**פתרון**: ודא שה-User Message מכיל את המידע הנכון:
```
{{ $json.body.businessName }}
{{ $json.body.serviceType }}
{{ $json.body.description }}
```

### בעיה: JSON לא תקין
**פתרון**: הוסף בדיקה ב-Code node:
```javascript
try {
  const parsed = JSON.parse(cleaned);
  // Validate structure
  if (!parsed.faq || !parsed.gallery || !parsed.testimonials) {
    throw new Error('Missing required fields');
  }
  return { json: parsed };
} catch (error) {
  console.error('Validation failed:', error);
  throw error;
}
```

---

## 📊 דוגמה מלאה

### קלט לבוט:
```json
{
  "businessName": "מספרת דני",
  "serviceType": "מספרה",
  "description": "מספרה מקצועית לגברים ונשים"
}
```

### פלט מהבוט:
```json
{
  "faq": [
    {
      "id": 1,
      "question": "כמה זמן לוקח תספורת?",
      "answer": "תספורת סטנדרטית לוקחת כ-30 דקות. תספורת מורכבת יותר עם עיצוב יכולה לקחת עד שעה."
    },
    {
      "id": 2,
      "question": "האם צריך לקבוע תור מראש?",
      "answer": "מומלץ לקבוע תור מראש כדי להבטיח זמינות. ניתן גם להגיע ללא תיאום אך ייתכן זמן המתנה."
    },
    {
      "id": 3,
      "question": "מה המחיר של תספורת?",
      "answer": "תספורת גברים - 80 ש\"ח, תספורת נשים - 120 ש\"ח. מחירים משתנים בהתאם לסוג התספורת."
    }
  ],
  "gallery": [
    "https://via.placeholder.com/600x400",
    "https://via.placeholder.com/600x400",
    "https://via.placeholder.com/600x400",
    "https://via.placeholder.com/600x400"
  ],
  "testimonials": [
    {
      "id": 1,
      "name": "יוסי כהן",
      "text": "מספרה מעולה! דני מקצועי ומדויק, תמיד יוצא מרוצה מהתספורת.",
      "role": "לקוח קבוע",
      "rating": 5,
      "image": "https://via.placeholder.com/100x100"
    },
    {
      "id": 2,
      "name": "שרה לוי",
      "text": "השירות הכי טוב שקיבלתי! אווירה נעימה ותוצאה מושלמת.",
      "role": "לקוחה",
      "rating": 5,
      "image": "https://via.placeholder.com/100x100"
    },
    {
      "id": 3,
      "name": "מיכאל דוד",
      "text": "ממליץ בחום! מחירים הוגנים ושירות מקצועי ברמה גבוהה.",
      "role": "לקוח",
      "rating": 5,
      "image": "https://via.placeholder.com/100x100"
    }
  ],
  "aboutText": "מספרת דני היא מספרה מקצועית המתמחה בתספורות לגברים ונשים. אנחנו מציעים שירות אישי ומקצועי בסביבה נעימה ונקייה. הצוות שלנו בעל ניסיון רב בתחום ומתעדכן בטרנדים האחרונים. אנחנו מאמינים שכל לקוח ראוי לחוויה מושלמת ולתוצאה שתגרום לו להרגיש בטוח ומרוצה.",
  "services": [
    {
      "id": 1,
      "name": "תספורת גברים",
      "description": "תספורת מקצועית כולל שטיפה ועיצוב",
      "price": 80,
      "duration": 30,
      "icon": "✂️"
    },
    {
      "id": 2,
      "name": "תספורת נשים",
      "description": "תספורת מקצועית כולל שטיפה ועיצוב",
      "price": 120,
      "duration": 60,
      "icon": "💇"
    },
    {
      "id": 3,
      "name": "צביעה",
      "description": "צביעת שיער מקצועית בכל הגוונים",
      "price": 200,
      "duration": 90,
      "icon": "🎨"
    }
  ]
}
```

---

**עודכן: 6 בדצמבר 2024** 🚀
