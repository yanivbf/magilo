# ✅ תיקון שגיאות עריכה - סופי

## הבעיות שתוקנו

### 1. שגיאת 500 בעריכת טקסט ❌ → ✅
**שגיאה:**
```
POST http://localhost:5173/api/update-page 500 (Internal Server Error)
```

**סיבה:** ה-API לא תמך ב-documentId (כמו `pd1l2pfpyi2u6xzrzk1dg2dt`), רק במזהה מספרי.

**פתרון:**
עדכנו את `strapi.js` לתמוך בשני סוגי המזהים:

```javascript
// new-app/src/lib/server/strapi.js

export async function getPageById(id) {
	try {
		// Try direct ID first
		const response = await strapi.get(`/pages/${id}`, {
			populate: '*'
		});
		return response.data;
	} catch (error) {
		// If failed, try searching by documentId
		console.log('🔍 Direct ID failed, trying documentId search:', id);
		const response = await strapi.get('/pages', {
			'filters[documentId][$eq]': id,
			populate: '*'
		});
		return response.data?.[0] || null;
	}
}

export async function updatePage(id, data) {
	try {
		// Try direct ID first
		return await strapi.put(`/pages/${id}`, data);
	} catch (error) {
		// If failed, get the page by documentId first
		console.log('🔍 Direct update failed, trying documentId lookup:', id);
		const page = await getPageById(id);
		if (!page) {
			throw new Error('Page not found');
		}
		// Use the numeric ID
		const numericId = page.id;
		console.log('✅ Found numeric ID:', numericId);
		return await strapi.put(`/pages/${numericId}`, data);
	}
}
```

### 2. שגיאת 404 בהעלאת תמונות גלריה ❌ → ✅
**שגיאה:**
```
POST http://localhost:5173/api/upload-section-image 404 (Not Found)
```

**סיבה:** המקטעים לא בהכרח יש להם ID, והחיפוש לפי ID נכשל.

**פתרון:**
עדכנו את `/api/upload-section-image` לחפש גם לפי סוג המקטע:

```javascript
// new-app/src/routes/api/upload-section-image/+server.js

sections = sections.map((section, idx) => {
	// Match by ID or by type if no sectionId provided
	const matchById = sectionId && (section.id === parseInt(String(sectionId)) || section.id === sectionId);
	const matchByType = !sectionId && section.type === 'gallery';
	
	if (matchById || matchByType) {
		console.log('📦 Found section at index', idx, ':', section.type);
		sectionFound = true;
		
		if (section.type === 'gallery' && section.data) {
			let images = section.data.images || [];
			
			if (action === 'add') {
				images.push(imageUrl);
			} else if (imageIndex !== null) {
				const index = parseInt(String(imageIndex));
				images[index] = imageUrl;
			}
			
			section.data.images = images;
		}
	}
	return section;
});
```

### 3. שגיאת 404 במחיקת תמונות גלריה ❌ → ✅
**שגיאה:** אותה בעיה כמו בהעלאה

**פתרון:** אותו תיקון ב-`/api/delete-section-image`

### 4. שגיאת 404 בהעלאת תמונות מוצרים ❌ → ✅
**שגיאה:**
```
POST http://localhost:5173/api/upload-product-image 404 (Not Found)
```

**סיבה:** אותה בעיה - documentId vs numeric ID

**פתרון:** התיקון ב-`strapi.js` פותר גם את זה כי `/api/upload-product-image` משתמש באותן פונקציות.

## מה עובד עכשיו

### ✅ עריכת טקסט
- לחיצה על כותרת → עריכה → שמירה אוטומטית
- לחיצה על תיאור → עריכה → שמירה אוטומטית
- לחיצה על טלפון/אימייל/כתובת → עריכה → שמירה אוטומטית

### ✅ עריכת תמונות גלריה
- לחיצה על תמונה → החלפה
- לחיצה על + → הוספת תמונה
- לחיצה על X → מחיקת תמונה

### ✅ עריכת תמונות מוצרים
- לחיצה על תמונת מוצר → החלפה

## איך לבדוק

### 1. הפעל את השרתים
```bash
# Terminal 1 - Strapi
cd strapi-backend
npm run develop

# Terminal 2 - SvelteKit
cd new-app
npm run dev
```

### 2. צור דף חדש
1. לך ל-http://localhost:5173/page-creator
2. בחר תבנית "חנות מקוונת"
3. מלא פרטים
4. לחץ "צור דף"

### 3. בדוק עריכת טקסט
1. לחץ על הכותרת
2. ערוך את הטקסט
3. לחץ מחוץ לשדה
4. אמור לראות: "✅ נשמר בהצלחה"
5. רענן את הדף → השינוי אמור להישאר

### 4. בדוק עריכת גלריה
1. גלול לגלריה
2. רחף על תמונה → תראה 3 כפתורים
3. לחץ על התמונה → בחר תמונה חדשה
4. אמור לראות: "✅ התמונה הוחלפה בהצלחה"
5. לחץ על + → הוסף תמונה חדשה
6. לחץ על X → מחק תמונה

### 5. בדוק עריכת מוצרים
1. גלול למוצרים
2. רחף על תמונת מוצר
3. לחץ על התמונה → בחר תמונה חדשה
4. אמור לראות: "✅ התמונה הוחלפה בהצלחה"

## קבצים שעודכנו

### 1. `new-app/src/lib/server/strapi.js`
- ✅ `getPageById()` - תומך ב-documentId וב-numeric ID
- ✅ `updatePage()` - תומך ב-documentId וב-numeric ID

### 2. `new-app/src/routes/api/upload-section-image/+server.js`
- ✅ חיפוש מקטע לפי ID או לפי סוג
- ✅ הודעות שגיאה טובות יותר

### 3. `new-app/src/routes/api/delete-section-image/+server.js`
- ✅ חיפוש מקטע לפי ID או לפי סוג
- ✅ הודעות שגיאה טובות יותר

### 4. `new-app/src/routes/api/update-page/+server.js`
- ✅ לוגים טובים יותר לדיבאג

## מה נותר לעשות

### עדיין לא עובד:
- ⏳ עריכת שם מוצר
- ⏳ עריכת מחיר מוצר
- ⏳ עריכת תיאור מוצר
- ⏳ הוספת מוצר חדש
- ⏳ מחיקת מוצר
- ⏳ עריכת המלצות
- ⏳ עריכת FAQ
- ⏳ עריכת About

### הצעדים הבאים:
1. הוסף EditableText לשדות המוצר
2. צור API endpoint להוספת/מחיקת מוצרים
3. הוסף עריכה ל-Testimonials
4. הוסף עריכה ל-FAQ
5. הוסף עריכה ל-About

## טיפים לפיתוח

### איך לדבג שגיאות
1. פתח את ה-Console בדפדפן (F12)
2. חפש שגיאות אדומות
3. בדוק את הלוגים בטרמינל של SvelteKit
4. בדוק את הלוגים בטרמינל של Strapi

### איך לבדוק מה נשלח ל-API
```javascript
// בקומפוננט
console.log('📤 Sending to API:', { pageId, field, value });
```

### איך לבדוק מה חוזר מ-API
```javascript
// בקומפוננט
const response = await fetch('/api/update-page', { ... });
const result = await response.json();
console.log('📥 Response from API:', result);
```

---

**תאריך:** 4 דצמבר 2025  
**סטטוס:** ✅ תוקן!  
**הערות:** כל הבעיות הבסיסיות תוקנו. המערכת עובדת!
