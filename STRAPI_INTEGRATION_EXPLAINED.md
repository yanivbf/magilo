# 🔄 איך המערכת מתקשרת לסטראפי

## 📊 ארכיטקטורת המערכת

```
┌─────────────────────────────────────────────────────────────┐
│                    המשתמש (דפדפן)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         יוצר דפים ישן (localhost:3002)                      │
│         page-creator-legacy.html                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ POST /api/save-page
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         שרת Express הישן (server.js)                        │
│         Port 3002                                           │
│                                                             │
│  1. שומר דף ב-output/ (מקומי)                              │
│  2. שולח את הדף ל-SvelteKit ↓                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ POST http://localhost:3000/api/save-page-to-strapi
                            ▼
┌─────────────────────────────────────────────────────────────┐
│    SvelteKit Server (new-app)                               │
│    Port 3000                                                │
│                                                             │
│    API: /api/save-page-to-strapi/+server.js                │
│                                                             │
│    1. מקבל HTML מלא                                         │
│    2. מעבד את ה-HTML (ניקוי)                                │
│    3. מחלץ מידע (טלפון, אימייל, מוצרים)                    │
│    4. יוצר slug ייחודי                                      │
│    5. שולח ל-Strapi ↓                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ POST http://localhost:1337/api/pages
                            │ (דרך strapi.js)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Strapi Backend                                      │
│         Port 1337                                           │
│                                                             │
│    Database: SQLite / PostgreSQL                           │
│                                                             │
│    שומר:                                                    │
│    - Pages (דפים)                                           │
│    - Users (משתמשים)                                        │
│    - Purchases (רכישות)                                     │
│    - Leads (לידים)                                          │
│    - Appointments (תורים)                                   │
│    - Analytics (סטטיסטיקות)                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ GET /api/pages
                            ▼
┌─────────────────────────────────────────────────────────────┐
│    SvelteKit Pages (תצוגה)                                 │
│                                                             │
│    - Dashboard: מציג דפים מ-Strapi                          │
│    - Marketplace: מציג דפים פעילים                         │
│    - View: מציג דף ספציפי                                  │
│    - Manage: ניהול רכישות/לידים/תורים                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 הזרימה המפורטת

### 1️⃣ יצירת דף (Page Creation)

```javascript
// המשתמש ממלא טופס ב-page-creator-legacy.html
// ולוחץ "יצירת דף"

// 📍 page-creator-legacy.html שולח:
fetch('/api/save-page', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'temp_user',
    fileName: 'my-page.html',
    content: '<html>...</html>', // HTML מלא
    pageType: 'serviceProvider',
    pageName: 'העסק שלי'
  })
})
```

### 2️⃣ שמירה מקומית (Local Save)

```javascript
// 📍 server.js (שורה 1845-2180)
app.post('/api/save-page', async (req, res) => {
  // 1. שומר את הדף ב-output/temp_user/my-page.html
  await fs.writeFile(pagePath, content, 'utf8');
  
  // 2. שומר metadata
  await fs.writeJSON(metadataPath, metadata);
  
  // 3. 🔥 שולח ל-Strapi!
  const strapiResponse = await fetch('http://localhost:3000/api/save-page-to-strapi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      fileName,
      content,      // ה-HTML המלא
      pageType,
      pageName
    })
  });
});
```

### 3️⃣ עיבוד ושמירה ב-Strapi

```javascript
// 📍 new-app/src/routes/api/save-page-to-strapi/+server.js
export async function POST({ request }) {
  const { userId, fileName, content, pageType, pageName } = await request.json();
  
  // 1. עיבוד HTML
  const processedHtml = processPage(content, pageType);
  
  // 2. חילוץ מידע
  const contactInfo = extractContactInfo(processedHtml);
  const products = extractProducts(processedHtml);
  const description = extractDescription(processedHtml);
  
  // 3. יצירת slug
  const slug = generateSlug(title, userId);
  
  // 4. 🔥 שמירה ב-Strapi!
  const pageResult = await createPage({
    title,
    slug,
    htmlContent: processedHtml,
    pageType,
    phone: contactInfo.phone,
    email: contactInfo.email,
    products,
    description,
    isActive: true,
    userId
  });
  
  return json({
    success: true,
    pageId: pageResult.id,
    slug,
    pageUrl: `/view/${slug}`
  });
}
```

### 4️⃣ תקשורת עם Strapi

```javascript
// 📍 new-app/src/lib/server/strapi.js
export async function createPage(pageData) {
  // שליחת בקשה ל-Strapi API
  const response = await fetch('http://localhost:1337/api/pages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_API_TOKEN}` // טוקן אימות
    },
    body: JSON.stringify({
      data: {
        title: pageData.title,
        slug: pageData.slug,
        htmlContent: pageData.htmlContent,
        pageType: pageData.pageType,
        phone: pageData.phone,
        email: pageData.email,
        products: pageData.products,
        description: pageData.description,
        isActive: pageData.isActive,
        user: pageData.userId
      }
    })
  });
  
  const result = await response.json();
  return result.data; // מחזיר את הדף שנשמר
}
```

### 5️⃣ קריאת דפים מ-Strapi

```javascript
// 📍 new-app/src/routes/dashboard/+page.server.js
export async function load() {
  // קריאה מ-Strapi
  const pages = await getPagesByUser(userId);
  
  return {
    pages // מחזיר לדף ה-Svelte
  };
}

// 📍 new-app/src/lib/server/strapi.js
export async function getPagesByUser(userId) {
  const response = await fetch(`http://localhost:1337/api/pages?filters[user][id][$eq]=${userId}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`
    }
  });
  
  const result = await response.json();
  return result.data;
}
```

---

## 🔐 אימות (Authentication)

הקשר עם Strapi מאומת באמצעות API Token:

```javascript
// 📍 new-app/.env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-secret-token-here
```

הטוקן נוצר ב-Strapi Admin:
1. פתח `http://localhost:1337/admin`
2. Settings → API Tokens
3. Create new API Token
4. העתק את הטוקן ל-`.env`

---

## 📦 מבנה הנתונים ב-Strapi

### Page Schema
```json
{
  "title": "string",
  "slug": "string (unique)",
  "htmlContent": "text (long)",
  "pageType": "string",
  "description": "text",
  "phone": "string",
  "email": "string",
  "city": "string",
  "address": "string",
  "products": "json",
  "metadata": "json",
  "isActive": "boolean",
  "user": "relation (many-to-one)",
  "purchases": "relation (one-to-many)",
  "leads": "relation (one-to-many)",
  "analytics": "relation (one-to-one)"
}
```

---

## 🎯 סיכום

**הזרימה המלאה:**

1. משתמש יוצר דף ב-`localhost:3002/page-creator-legacy.html`
2. הדף נשמר מקומית ב-`output/`
3. `server.js` שולח את הדף ל-`localhost:3000/api/save-page-to-strapi`
4. SvelteKit מעבד את הדף ושולח ל-`localhost:1337/api/pages`
5. Strapi שומר את הדף במסד הנתונים
6. Dashboard ב-`localhost:3000/dashboard` קורא מ-Strapi ומציג את הדפים

**כל זה קורה אוטומטית!** 🚀

המשתמש רק צריך ליצור דף, והמערכת דואגת לשאר.
