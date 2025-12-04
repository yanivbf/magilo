# Design Document - השלמת זהות מלאה בין המערכות

## Overview

מסמך זה מתאר את העיצוב הטכני להשלמת העברה מלאה של כל התכונות מהמערכת הישנה למערכת החדשה. המטרה היא ליצור זהות מלאה (1:1 parity) בין המערכות, כך שכל פונקציונליות שהייתה במערכת הישנה תהיה זמינה במערכת החדשה עם אותה מכניקה בדיוק.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SvelteKit Frontend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Page Creator │  │  Dashboard   │  │   Manage     │      │
│  │  Components  │  │  Components  │  │  Components  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SvelteKit API Routes                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Appointments │  │  Analytics   │  │Subscriptions │      │
│  │   Endpoints  │  │  Endpoints   │  │  Endpoints   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Strapi CMS                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Appointments │  │  Analytics   │  │Subscriptions │      │
│  │ Content Type │  │ Content Type │  │ Content Type │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    └───────────────┘
```

### Component Structure

```
new-app/
├── src/
│   ├── routes/
│   │   ├── api/
│   │   │   ├── appointments/
│   │   │   │   ├── +server.js (POST - create appointment)
│   │   │   │   ├── [pageId]/+server.js (GET - list appointments)
│   │   │   │   └── [appointmentId]/
│   │   │   │       └── status/+server.js (PUT - update status)
│   │   │   ├── analytics/
│   │   │   │   ├── +server.js (GET - global analytics)
│   │   │   │   ├── page/[pageId]/+server.js (GET - page analytics)
│   │   │   │   └── track/+server.js (POST - track event)
│   │   │   ├── subscription/
│   │   │   │   ├── activate/+server.js (POST - activate)
│   │   │   │   ├── deactivate/+server.js (POST - deactivate)
│   │   │   │   └── check/[pageId]/+server.js (GET - check status)
│   │   │   └── services/
│   │   │       └── [pageId]/+server.js (PUT - update services)
│   │   └── page-creator/
│   │       └── +page.svelte (updated with new templates)
│   └── lib/
│       ├── components/
│       │   ├── AnalyticsDashboard.svelte (NEW)
│       │   ├── SubscriptionManager.svelte (NEW)
│       │   └── AppointmentBookingForm.svelte (NEW)
│       └── templates/
│           ├── restaurant.js (NEW)
│           └── workshop.js (NEW)
```

## Components and Interfaces

### 1. Client Appointment Booking

#### API Endpoint: POST /api/appointments

**Request:**
```typescript
interface AppointmentRequest {
  pageId: string;
  customerName: string;
  customerPhone: string;
  date: string; // ISO 8601 format
  time: string; // HH:MM format
  service: string;
  notes?: string;
}
```

**Response:**
```typescript
interface AppointmentResponse {
  id: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  appointmentDate: string;
  appointmentTime: string;
  customerName: string;
  customerPhone: string;
  service: string;
  notes: string;
}
```

#### Component: AppointmentBookingForm.svelte

```svelte
<script>
  let formData = $state({
    customerName: '',
    customerPhone: '',
    date: '',
    time: '',
    service: '',
    notes: ''
  });
  
  async function submitAppointment() {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, pageId })
    });
    
    if (response.ok) {
      // Show success message
    }
  }
</script>
```

### 2. Analytics System

#### API Endpoints

**GET /api/analytics** - Global Analytics
```typescript
interface GlobalAnalytics {
  totalPages: number;
  totalViews: number;
  totalLeads: number;
  totalSales: number;
  totalRevenue: number;
}
```

**GET /api/analytics/page/[pageId]** - Page-Specific Analytics
```typescript
interface PageAnalytics {
  pageId: string;
  views: number;
  leads: number;
  sales: number;
  revenue: number;
  viewsByDate: Array<{ date: string; count: number }>;
  leadsBySource: Array<{ source: string; count: number }>;
}
```

**POST /api/analytics/track** - Track Event
```typescript
interface TrackEventRequest {
  pageId: string;
  eventType: 'view' | 'lead' | 'sale';
  data?: {
    source?: string;
    amount?: number;
    [key: string]: any;
  };
}
```

#### Component: AnalyticsDashboard.svelte

```svelte
<script>
  import { onMount } from 'svelte';
  
  let stats = $state({
    views: 0,
    leads: 0,
    sales: 0,
    revenue: 0
  });
  
  let chartData = $state([]);
  
  onMount(async () => {
    const response = await fetch(`/api/analytics/page/${pageId}`);
    const data = await response.json();
    stats = data;
    chartData = data.viewsByDate;
  });
</script>

<div class="analytics-grid">
  <div class="stat-card">
    <h3>צפיות</h3>
    <p class="stat-value">{stats.views}</p>
  </div>
  
  <div class="stat-card">
    <h3>לידים</h3>
    <p class="stat-value">{stats.leads}</p>
  </div>
  
  <div class="stat-card">
    <h3>מכירות</h3>
    <p class="stat-value">{stats.sales}</p>
  </div>
  
  <div class="stat-card">
    <h3>הכנסות</h3>
    <p class="stat-value">₪{stats.revenue}</p>
  </div>
</div>

<div class="chart-container">
  <!-- Chart component here -->
</div>
```

### 3. Subscription Management

#### API Endpoints

**POST /api/subscription/activate**
```typescript
interface ActivateSubscriptionRequest {
  userId: string;
  pageId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  duration: number; // months
}

interface SubscriptionResponse {
  id: number;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  plan: string;
  autoRenew: boolean;
}
```

**POST /api/subscription/deactivate**
```typescript
interface DeactivateSubscriptionRequest {
  subscriptionId: number;
}
```

**GET /api/subscription/check/[pageId]**
```typescript
interface SubscriptionCheckResponse {
  active: boolean;
  subscription?: SubscriptionResponse;
}
```

#### Component: SubscriptionManager.svelte

```svelte
<script>
  let subscription = $state(null);
  let loading = $state(false);
  
  async function activateSubscription(plan, duration) {
    loading = true;
    const response = await fetch('/api/subscription/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, pageId, plan, duration })
    });
    
    if (response.ok) {
      subscription = await response.json();
    }
    loading = false;
  }
  
  async function deactivateSubscription() {
    loading = true;
    await fetch('/api/subscription/deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: subscription.id })
    });
    subscription = null;
    loading = false;
  }
</script>
```

### 4. Restaurant Template

#### Template Definition: restaurant.js

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

#### HTML Template: restaurant.html

```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    body {
      font-family: 'Rubik', sans-serif;
      direction: rtl;
      margin: 0;
      padding: 0;
      background: {{backgroundColor}};
    }
    .header {
      background: {{primaryColor}};
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .menu-category {
      margin: 2rem 0;
      padding: 1rem;
    }
    .menu-item {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }
    .menu-item-image {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
    }
    .price {
      font-weight: bold;
      color: {{accentColor}};
    }
    .dietary-icons {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="header">
    {{#if logo}}
    <img src="{{logo}}" alt="{{title}}" class="logo">
    {{/if}}
    <h1>{{title}}</h1>
    <p>{{description}}</p>
    <p>📞 {{phone}} | 📍 {{address}}, {{city}}</p>
  </div>
  
  <div class="container">
    {{#each categories}}
    <div class="menu-category">
      <h2>{{categoryName}}</h2>
      {{#each items}}
      <div class="menu-item">
        <div class="item-details">
          <h3>{{itemName}}</h3>
          <p>{{description}}</p>
          <div class="dietary-icons">
            {{#if isVegan}}<span>🌱 טבעוני</span>{{/if}}
            {{#if isGlutenFree}}<span>🌾 ללא גלוטן</span>{{/if}}
          </div>
        </div>
        {{#if image}}
        <img src="{{image}}" alt="{{itemName}}" class="menu-item-image">
        {{/if}}
        <div class="price">₪{{price}}</div>
      </div>
      {{/each}}
    </div>
    {{/each}}
  </div>
  
  <div class="hours-section">
    <h2>שעות פתיחה</h2>
    <ul>
      <li>ראשון: {{sunday}}</li>
      <li>שני: {{monday}}</li>
      <li>שלישי: {{tuesday}}</li>
      <li>רביעי: {{wednesday}}</li>
      <li>חמישי: {{thursday}}</li>
      <li>שישי: {{friday}}</li>
      <li>שבת: {{saturday}}</li>
    </ul>
  </div>
  
  {{#if hasDelivery}}
  <div class="delivery-section">
    <h2>משלוחים</h2>
    <p>עלות משלוח: ₪{{deliveryFee}}</p>
    <p>הזמנה מינימלית: ₪{{minOrder}}</p>
    <p>אזורי משלוח: {{deliveryAreas}}</p>
  </div>
  {{/if}}
</body>
</html>
```

### 5. Workshop Template

#### Template Definition: workshop.js

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
        { 
          name: 'platform', 
          label: 'פלטפורמה', 
          type: 'select', 
          options: ['Zoom', 'Google Meet', 'Microsoft Teams', 'פיזית'] 
        },
        { name: 'location', label: 'מיקום / קישור', type: 'text' },
        { name: 'maxParticipants', label: 'מספר משתתפים מקסימלי', type: 'number' }
      ]
    },
    {
      id: 'pricing',
      title: 'תמחור',
      fields: [
        { name: 'price', label: 'מחיר', type: 'number', required: true },
        { 
          name: 'currency', 
          label: 'מטבע', 
          type: 'select', 
          options: ['₪', '$', '€'], 
          default: '₪' 
        },
        { name: 'earlyBirdPrice', label: 'מחיר מוקדם', type: 'number' },
        { name: 'earlyBirdDeadline', label: 'תאריך אחרון למחיר מוקדם', type: 'date' }
      ]
    },
    {
      id: 'content',
      title: 'תוכן הסדנה',
      fields: [
        { 
          name: 'topics', 
          label: 'נושאים', 
          type: 'textarea', 
          placeholder: 'נושא 1\nנושא 2\nנושא 3' 
        },
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

## Data Models

### Strapi Content Types

#### 1. Appointment

```json
{
  "kind": "collectionType",
  "collectionName": "appointments",
  "info": {
    "singularName": "appointment",
    "pluralName": "appointments",
    "displayName": "Appointment"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "page": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::page.page"
    },
    "customerName": {
      "type": "string",
      "required": true
    },
    "customerPhone": {
      "type": "string",
      "required": true
    },
    "appointmentDate": {
      "type": "date",
      "required": true
    },
    "appointmentTime": {
      "type": "time",
      "required": true
    },
    "service": {
      "type": "string",
      "required": true
    },
    "notes": {
      "type": "text"
    },
    "status": {
      "type": "enumeration",
      "enum": ["pending", "confirmed", "cancelled", "completed"],
      "default": "pending"
    }
  }
}
```

#### 2. Analytic

```json
{
  "kind": "collectionType",
  "collectionName": "analytics",
  "info": {
    "singularName": "analytic",
    "pluralName": "analytics",
    "displayName": "Analytic"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "page": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::page.page"
    },
    "eventType": {
      "type": "enumeration",
      "enum": ["view", "lead", "sale"],
      "required": true
    },
    "eventData": {
      "type": "json"
    },
    "timestamp": {
      "type": "datetime",
      "required": true
    },
    "source": {
      "type": "string"
    },
    "amount": {
      "type": "decimal"
    }
  }
}
```

#### 3. Subscription

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

## Error Handling

### Error Response Format

All API endpoints will return errors in a consistent format:

```typescript
interface ErrorResponse {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}
```

### Common Error Scenarios

1. **Validation Errors (400)**
   - Missing required fields
   - Invalid data format
   - Business logic violations

2. **Authentication Errors (401)**
   - Missing authentication token
   - Invalid or expired token

3. **Authorization Errors (403)**
   - User doesn't own the resource
   - Insufficient permissions

4. **Not Found Errors (404)**
   - Resource doesn't exist
   - Invalid ID

5. **Server Errors (500)**
   - Database connection issues
   - Unexpected exceptions

## Testing Strategy

### Unit Tests

1. **API Endpoint Tests**
   - Test each endpoint with valid data
   - Test validation logic
   - Test error handling
   - Test authentication/authorization

2. **Component Tests**
   - Test form submissions
   - Test data display
   - Test user interactions
   - Test error states

### Integration Tests

1. **End-to-End Flows**
   - Create appointment → View in management interface
   - Track analytics event → View in dashboard
   - Activate subscription → Check page status

2. **Data Flow Tests**
   - Frontend → API → Strapi → Database
   - Verify data consistency
   - Test concurrent operations

### Manual Testing Checklist

- [ ] Create appointment from client page
- [ ] View appointments in management interface
- [ ] Update appointment status
- [ ] View analytics dashboard
- [ ] Track different event types
- [ ] Activate subscription
- [ ] Deactivate subscription
- [ ] Check subscription status
- [ ] Create restaurant page
- [ ] Create workshop page
- [ ] Update services dynamically
- [ ] Generate quick HTML page

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1)

1. Create Strapi content types
2. Implement API endpoints
3. Add basic error handling

### Phase 2: Components & Templates (Week 2)

1. Build Svelte components
2. Create restaurant template
3. Create workshop template
4. Update template selector

### Phase 3: Integration & Testing (Week 3)

1. Integrate components with APIs
2. Write unit tests
3. Perform integration testing
4. Fix bugs and issues

### Phase 4: Polish & Documentation (Week 4)

1. Add loading states
2. Improve error messages
3. Write user documentation
4. Deploy to production

## Performance Considerations

1. **Caching**
   - Cache analytics data for 5 minutes
   - Cache subscription status for 1 minute
   - Use SvelteKit's built-in caching

2. **Database Optimization**
   - Add indexes on frequently queried fields
   - Use pagination for large datasets
   - Optimize Strapi queries with populate

3. **Frontend Optimization**
   - Lazy load components
   - Use Svelte's reactive statements efficiently
   - Minimize bundle size

## Security Considerations

1. **Authentication**
   - Verify user authentication on all protected endpoints
   - Use Supabase JWT tokens

2. **Authorization**
   - Verify user owns the resource before allowing modifications
   - Implement role-based access control

3. **Input Validation**
   - Validate all user inputs on both client and server
   - Sanitize HTML content
   - Prevent SQL injection through Strapi ORM

4. **Rate Limiting**
   - Implement rate limiting on API endpoints
   - Prevent abuse and DoS attacks

## Deployment

### Environment Variables

```env
# Strapi
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-api-token

# Supabase
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
PUBLIC_APP_URL=http://localhost:5173
```

### Deployment Steps

1. Build Strapi backend
2. Run database migrations
3. Build SvelteKit frontend
4. Deploy to hosting platform
5. Configure environment variables
6. Test production deployment

## Monitoring & Maintenance

1. **Logging**
   - Log all API requests
   - Log errors with stack traces
   - Use structured logging

2. **Monitoring**
   - Monitor API response times
   - Track error rates
   - Monitor database performance

3. **Alerts**
   - Alert on high error rates
   - Alert on slow response times
   - Alert on database issues

## Conclusion

This design provides a comprehensive plan for achieving complete feature parity between the legacy Express system and the new SvelteKit + Strapi system. By following this design, we ensure that no functionality is lost during the migration and that the new system maintains the same mechanics as the old one while benefiting from modern architecture and improved maintainability.
