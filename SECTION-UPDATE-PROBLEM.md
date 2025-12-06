# 🔴 הבעיה: Strapi v5 לא מעדכן sections!

## מה קורה

1. ✅ הקוד שולח את כל מערך ה-sections ל-Strapi
2. ✅ Strapi מחזיר "success"
3. ❌ אבל השינוי לא נשמר!

## למה?

ב-Strapi v5, כשאתה שולח `PUT /api/pages/{id}` עם `sections: [...]`, Strapi **מחליף** את כל המערך במקום לעדכן מקטע ספציפי.

הבעיה היא שה-sections הם **components** ב-Strapi, ולעדכן אותם צריך גישה אחרת.

## הפתרון

יש 2 אפשרויות:

### אפשרות 1: עדכן רק את המקטע הספציפי
במקום לשלוח את כל המערך, שלח רק את המקטע שהשתנה:
```javascript
PUT /api/sections/{sectionId}
{
  "data": {
    "title": "כותרת חדשה"
  }
}
```

### אפשרות 2: שלח את כל המערך אבל עם connect
```javascript
PUT /api/pages/{pageId}
{
  "sections": {
    "connect": [
      { "id": 976, "position": { "start": true } },
      { "id": 977, "position": { "after": 976 } }
    ]
  }
}
```

## מה אני ממליץ

**אפשרות 1** - פשוט יותר ועובד טוב יותר.

צריך ליצור API endpoint חדש:
`PUT /api/sections/{sectionId}` שמעדכן רק מקטע אחד.
