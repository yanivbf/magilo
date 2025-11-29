# 📋 רשימת תכונות חסרות - TODO

## 🔴 קריטי - חובה להשלים

### 1. יצירת תור מהלקוח (Client Appointment Booking)

**במערכת הישנה:**
```javascript
POST /api/appointments
Body: {
  userId, pageId, customerName, customerPhone,
  date, time, service, notes
}
```

**צריך להוסיף:**
```
new-app/src/routes/api/appointments/+server.js
```

**קוד לדוגמה:**
```javascript
export async function POST({ request }) {
  const body = await request.json();
  const { pageId, customerName, customerPhone, date, time, service, notes } = body;
  
  // Create appointment in Strapi
  const response = await fetch(`${STRAPI_URL}/api/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_TOKEN}`
    },
    body: JSON.stringify({
      data: {
        page: pageId,
        customerName,
        customerPhone,
        appointmentDate: date,
        appointmentTime: time,
        service,
        notes,
        status: 'pending'
      }
    })
  });
  
  return json(await response.json());
}
```

---

### 2. מערכת אנליטיקה (Analytics System)

**במערכת הישנה:**
- `GET /api/analytics` - אנליטיקה כללית
- `GET /api/analytics/user/:userId` - אנליטיקה למשתמש
- `GET /api/analytics/page/:pageName` - אנליטיקה לדף
- `GET /api/analytics/:storeId` - אנליטיקה לחנות

**צריך להוסיף:**

#### 2.1 Strapi Content Type
```
strapi-backend/src/api/analytic/content-types/analytic/schema.json
```

כבר קיים! צריך רק להוסיף endpoints.

#### 2.2 API Endpoints

**קובץ 1:** `new-app/src/routes/api/analytics/+server.js`
```javascript
// אנליטיקה כללית
export async function GET() {
  const response = await fetch(`${STRAPI_URL}/api/analytics?populate=*`, {
    headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
  });
  
  const data = await response.json();
  
  // חשב סטטיסטיקות
  const stats = {
    totalPages: data.data.length,
    totalViews: data.data.reduce((sum, a) => sum + (a.attributes.views || 0), 0),
    totalLeads: data.data.reduce((sum, a) => sum + (a.attributes.leads || 0), 0),
    totalSales: data.data.reduce((sum, a) => sum + (a.attributes.sales || 0), 0)
  };
  
  return json(stats);
}
```

**קובץ 2:** `new-app/src/routes/api/analytics/page/[pageId]/+server.js`
```javascript
// אנליטיקה לדף ספציפי
export async function GET({ params }) {
  const { pageId } = params;
  
  const response = await fetch(
    `${STRAPI_URL}/api/analytics?filters[page][id][$eq]=${pageId}&populate=*`,
    { headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` } }
  );
  
  return json(await response.json());
}
```

**קובץ 3:** `new-app/src/routes/api/analytics/track/+server.js`
```javascript
// רישום אירוע אנליטיקה
export async function POST({ request }) {
  const { pageId, eventType, data } = await request.json();
  
  // עדכן או צור רשומת אנליטיקה
  const response = await fetch(`${STRAPI_URL}/api/analytics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_TOKEN}`
    },
    body: JSON.stringify({
      data: {
        page: pageId,
        eventType,
        eventData: data,
        timestamp: new Date().toISOString()
      }
    })
  });
  
  return json(await response.json());
}
```

#### 2.3 קומפוננטת אנליטיקה

**קובץ:** `new-app/src/lib/components/AnalyticsDashboard.svelte`
```svelte
<script>
  import { onMount } from 'svelte';
  
  let stats = $state({
    views: 0,
    leads: 0,
    sales: 0,
    revenue: 0
  });
  
  onMount(async () => {
    const response = await fetch('/api/analytics/page/' + pageId);
    const data = await response.json();
    stats = data;
  });
</script>

<div class="analytics-dashboard">
  <div class="stat-card">
    <h3>צפיות</h3>
    <p>{stats.views}</p>
  </div>
  
  <div class="stat-card">
    <h3>לידים</h3>
    <p>{stats.leads}</p>
  </div>
  
  <div class="stat-card">
    <h3>מכירות</h3>
    <p>{stats.sales}</p>
  </div>
  
  <div class="stat-card">
    <h3>הכנסות</h3>
    <p>₪{stats.revenue}</p>
  </div>
</div>
```

---

### 3. מערכת מנויים (Subscription System)

**במערכת הישנה:**
- `POST /api/subscription/activate` - הפעלת מנוי
- `POST /api/subscription/deactivate` - ביטול מנוי

**צריך להוסיף:**

#### 3.1 Strapi Content Type

**קובץ:** `strapi-backend/src/api/subscription/content-types/subscription/schema.json`
```json
{
  "kind": "collectionType",
  "collectionName": "subscriptions",
  "info": {
    "singularName": "subscription",
    "pluralName": "subscriptions",
    "displayName": "Subscription"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "user": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::user.user"
    },
    "page": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::page.page"
    },
    "status": {
      "type": "enumeration",
      "enum": ["active", "inactive", "expired", "cancelled"],
      "default": "inactive"
    },
    "startDate": {
      "type": "datetime"
    },
    "endDate": {
      "type": "datetime"
    },
    "plan": {
      "type": "enumeration",
      "enum": ["basic", "premium", "enterprise"],
      "default": "basic"
    },
    "price": {
      "type": "decimal"
    },
    "autoRenew": {
      "type": "boolean",
      "default": false
    }
  }
}
```

#### 3.2 API Endpoints

**קובץ 1:** `new-app/src/routes/api/subscription/activate/+server.js`
```javascript
export async function POST({ request }) {
  const { userId, pageId, plan, duration } = await request.json();
  
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + duration);
  
  const response = await fetch(`${STRAPI_URL}/api/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_TOKEN}`
    },
    body: JSON.stringify({
      data: {
        user: userId,
        page: pageId,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
        plan,
        autoRenew: false
      }
    })
  });
  
  // עדכן את הדף לפעיל
  await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_TOKEN}`
    },
    body: JSON.stringify({
      data: { isActive: true }
    })
  });
  
  return json(await response.json());
}
```

**קובץ 2:** `new-app/src/routes/api/subscription/deactivate/+server.js`
```javascript
export async function POST({ request }) {
  const { subscriptionId } = await request.json();
  
  const response = await fetch(`${STRAPI_URL}/api/subscriptions/${subscriptionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_TOKEN}`
    },
    body: JSON.stringify({
      data: {
        status: 'cancelled',
        endDate: new Date().toISOString()
      }
    })
  });
  
  return json(await response.json());
}
```

**קובץ 3:** `new-app/src/routes/api/subscription/check/[pageId]/+server.js`
```javascript
export async function GET({ params }) {
  const { pageId } = params;
  
  const response = await fetch(
    `${STRAPI_URL}/api/subscriptions?filters[page][id][$eq]=${pageId}&filters[status][$eq]=active&populate=*`,
    { headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` } }
  );
  
  const data = await response.json();
  const hasActiveSubscription = data.data.length > 0;
  
  return json({ active: hasActiveSubscription });
}
```

---

## 🟡 בינוני - רצוי להשלים

### 4. תבנית מסעדה (Restaurant Template)

**קובץ:** `new-app/src/lib/templates/restaurant.js`
```javascript
export const restaurantTemplate = {
  id: 'restaurant',
  name: 'מסעדה / בית קפה',
  icon: '🍽️',
  description: 'תפריט דיגיטלי עם קטגוריות, מנות, ומחירים',
  
  sections: [
    {
      id: 'basic',
      title: 'פרטים בסיסיים',
      fields: [
        { name: 'title', label: 'שם המסעדה', type: 'text', required: true },
        { name: 'description', label: 'תיאור', type: 'textarea', required: true },
        { name: 'logo', label: 'לוגו', type: 'image' },
        { name: 'phone', label: 'טלפון', type: 'tel', required: true },
        { name: 'address', label: 'כתובת', type: 'text', required: true },
        { name: 'city', label: 'עיר', type: 'text', required: true }
      ]
    },
    {
      id: 'menu',
      title: 'תפריט',
      fields: [
        {
          name: 'categories',
          label: 'קטגוריות',
          type: 'repeater',
          fields: [
            { name: 'categoryName', label: 'שם קטגוריה', type: 'text' },
            {
              name: 'items',
              label: 'מנות',
              type: 'repeater',
              fields: [
                { name: 'itemName', label: 'שם המנה', type: 'text' },
                { name: 'description', label: 'תיאור', type: 'textarea' },
                { name: 'price', label: 'מחיר', type: 'number' },
                { name: 'image', label: 'תמונה', type: 'image' },
                { name: 'isVegan', label: 'טבעוני', type: 'checkbox' },
                { name: 'isGlutenFree', label: 'ללא גלוטן', type: 'checkbox' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'hours',
      title: 'שעות פתיחה',
      fields: [
        { name: 'sunday', label: 'ראשון', type: 'text' },
        { name: 'monday', label: 'שני', type: 'text' },
        { name: 'tuesday', label: 'שלישי', type: 'text' },
        { name: 'wednesday', label: 'רביעי', type: 'text' },
        { name: 'thursday', label: 'חמישי', type: 'text' },
        { name: 'friday', label: 'שישי', type: 'text' },
        { name: 'saturday', label: 'שבת', type: 'text' }
      ]
    },
    {
      id: 'delivery',
      title: 'משלוחים',
      fields: [
        { name: 'hasDelivery', label: 'יש משלוחים', type: 'checkbox' },
        { name: 'deliveryFee', label: 'עלות משלוח', type: 'number' },
        { name: 'minOrder', label: 'הזמנה מינימלית', type: 'number' },
        { name: 'deliveryAreas', label: 'אזורי משלוח', type: 'textarea' }
      ]
    }
  ],
  
  designStyles: [
    { id: 'classic', name: 'קלאסי', colors: ['#8B4513', '#D2691E', '#F4A460'] },
    { id: 'modern', name: 'מודרני', colors: ['#2C3E50', '#E74C3C', '#ECF0F1'] },
    { id: 'elegant', name: 'אלגנטי', colors: ['#1C1C1C', '#D4AF37', '#FFFFFF'] }
  ]
};
```

**הוסף ל:** `new-app/src/lib/templates/index.js`
```javascript
import { restaurantTemplate } from './restaurant.js';

export const templates = {
  store: storeTemplate,
  service: serviceTemplate,
  event: eventTemplate,
  course: courseTemplate,
  artist: artistTemplate,
  message: messageTemplate,
  restaurant: restaurantTemplate  // ← הוסף
};
```

---

### 5. תבנית סדנה (Workshop Template)

**קובץ:** `new-app/src/lib/templates/workshop.js`
```javascript
export const workshopTemplate = {
  id: 'workshop',
  name: 'סדנה / וובינר',
  icon: '🎓',
  description: 'סדנה חיה או וובינר עם הרשמה',
  
  sections: [
    {
      id: 'basic',
      title: 'פרטים בסיסיים',
      fields: [
        { name: 'title', label: 'שם הסדנה', type: 'text', required: true },
        { name: 'description', label: 'תיאור', type: 'textarea', required: true },
        { name: 'instructor', label: 'שם המדריך', type: 'text', required: true },
        { name: 'instructorBio', label: 'אודות המדריך', type: 'textarea' },
        { name: 'image', label: 'תמונה ראשית', type: 'image' }
      ]
    },
    {
      id: 'details',
      title: 'פרטי הסדנה',
      fields: [
        { name: 'date', label: 'תאריך', type: 'date', required: true },
        { name: 'time', label: 'שעה', type: 'time', required: true },
        { name: 'duration', label: 'משך (דקות)', type: 'number', required: true },
        { name: 'platform', label: 'פלטפורמה', type: 'select', options: ['Zoom', 'Google Meet', 'Microsoft Teams', 'פיזית'] },
        { name: 'location', label: 'מיקום / קישור', type: 'text' },
        { name: 'maxParticipants', label: 'מספר משתתפים מקסימלי', type: 'number' }
      ]
    },
    {
      id: 'pricing',
      title: 'תמחור',
      fields: [
        { name: 'price', label: 'מחיר', type: 'number', required: true },
        { name: 'currency', label: 'מטבע', type: 'select', options: ['₪', '$', '€'], default: '₪' },
        { name: 'earlyBirdPrice', label: 'מחיר מוקדם', type: 'number' },
        { name: 'earlyBirdDeadline', label: 'תאריך אחרון למחיר מוקדם', type: 'date' }
      ]
    },
    {
      id: 'content',
      title: 'תוכן הסדנה',
      fields: [
        { name: 'topics', label: 'נושאים', type: 'textarea', placeholder: 'נושא 1\nנושא 2\nנושא 3' },
        { name: 'requirements', label: 'דרישות מוקדמות', type: 'textarea' },
        { name: 'materials', label: 'חומרים נדרשים', type: 'textarea' }
      ]
    }
  ],
  
  designStyles: [
    { id: 'professional', name: 'מקצועי', colors: ['#2C3E50', '#3498DB', '#ECF0F1'] },
    { id: 'creative', name: 'יצירתי', colors: ['#9B59B6', '#E74C3C', '#F39C12'] },
    { id: 'minimal', name: 'מינימלי', colors: ['#34495E', '#95A5A6', '#FFFFFF'] }
  ]
};
```

---

### 6. עדכון שירותים (Update Services)

**קובץ:** `new-app/src/routes/api/services/[pageId]/+server.js`
```javascript
export async function PUT({ params, request }) {
  const { pageId } = params;
  const { services } = await request.json();
  
  // עדכן את הדף עם רשימת שירותים חדשה
  const response = await fetch(`${STRAPI_URL}/api/pages/${pageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_TOKEN}`
    },
    body: JSON.stringify({
      data: {
        services: services
      }
    })
  });
  
  return json(await response.json());
}
```

---

## 🟢 נמוך - אופציונלי

### 7. יצירת HTML מהיר (Quick HTML Generation)

**קובץ:** `new-app/src/routes/api/generate-html/+server.js`
```javascript
export async function POST({ request }) {
  const { prompt } = await request.json();
  
  // כאן אפשר להשתמש ב-AI API (OpenAI, Claude, etc.)
  // לצורך הדוגמה, נחזיר תבנית בסיסית
  
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${prompt}</title>
  <style>
    body {
      font-family: 'Rubik', sans-serif;
      direction: rtl;
      text-align: center;
      padding: 2rem;
    }
    h1 { color: #667eea; }
  </style>
</head>
<body>
  <h1>${prompt}</h1>
  <p>זהו דף שנוצר אוטומטית</p>
</body>
</html>
  `;
  
  return json({ html });
}
```

---

## 📝 סדר ביצוע מומלץ

### שלב 1 - קריטי (השבוע)
1. ✅ יצירת תור מהלקוח - `POST /api/appointments`
2. ✅ בדיקת מנוי - `GET /api/subscription/check/[pageId]`

### שלב 2 - חשוב (השבועיים הבאים)
3. ✅ מערכת אנליטיקה בסיסית
4. ✅ הפעלת/ביטול מנוי
5. ✅ תבנית מסעדה

### שלב 3 - רצוי (החודש הבא)
6. ✅ תבנית סדנה
7. ✅ עדכון שירותים
8. ✅ אנליטיקה מתקדמת

### שלב 4 - אופציונלי (עתיד)
9. ✅ יצירת HTML מהיר
10. ✅ תכונות נוספות

---

## 🎯 סיכום

**סה"כ תכונות חסרות:** 10
- **קריטי:** 3 (תורים, אנליטיקה, מנויים)
- **בינוני:** 3 (מסעדה, סדנה, שירותים)
- **נמוך:** 4 (HTML מהיר, וכו')

**זמן משוער להשלמה:**
- קריטי: 2-3 ימי עבודה
- בינוני: 3-4 ימי עבודה
- נמוך: 2-3 ימי עבודה

**סה"כ:** 7-10 ימי עבודה להשלמת כל התכונות החסרות.
