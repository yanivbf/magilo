# 🎯 ALL FORMS - 100% RAW VISUAL PORT PLAN

## Status: Store Form ✅ COMPLETE | Others → IN PROGRESS

### Completed: Store Form ✅

**What was ported:**
- Blue info box with exact styling
- Green features box inside
- Product count dropdown with white container
- Exact CSS classes from legacy

---

## Service Provider Form - TO PORT

### Source: `page-creator.html` lines 7550-7700

### Exact Legacy Structure to Port:

#### 1. **Purple Info Box**
```html
<div class="bg-purple-50 p-4 rounded-lg border-2 border-purple-200 mb-4">
    <h4 class="font-semibold text-purple-900 mb-2">📅 מערכת קביעת תורים חכמה</h4>
    <p class="text-sm text-purple-700">
        <strong>מה כולל:</strong> יומן תורים אוטומטי, טופס קביעת תור עם שעות פנויות בלבד...
    </p>
</div>
```

#### 2. **Enable Checkbox**
```html
<div class="flex items-center">
    <input type="checkbox" name="enableAppointmentBooking" 
           class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600">
    <label class="ms-2 block text-sm text-gray-900">הפעל מערכת קביעת תורים</label>
</div>
```

#### 3. **Work Hours Grid**
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label class="block text-sm font-medium text-gray-700">⏰ שעת התחלת עבודה</label>
        <input type="time" value="09:00" 
               class="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm">
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700">⏰ שעת סיום עבודה</label>
        <input type="time" value="17:00" 
               class="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm">
    </div>
</div>
```

#### 4. **Work Days Checkboxes**
```html
<div class="grid grid-cols-2 md:grid-cols-4 gap-2">
    <label class="flex items-center">
        <input type="checkbox" name="workDays" value="sunday" checked class="mr-2">
        <span class="text-sm">ראשון</span>
    </label>
    <!-- ... 6 more days -->
</div>
```

#### 5. **Blue Special Hours Box**
```html
<div class="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mt-4">
    <h4 class="font-semibold text-blue-900 mb-3">🕐 שעות מיוחדות לימים ספציפיים</h4>
    <p class="text-xs text-blue-700 mb-3">הגדר שעות עבודה שונות לימים מסוימים...</p>
    <!-- Dynamic special hours items -->
</div>
```

#### 6. **Orange Breaks Box**
```html
<div class="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
    <h4 class="font-semibold text-orange-900 mb-3">☕ הפסקות קבועות</h4>
    <p class="text-xs text-orange-700 mb-3">הגדר הפסקות שחוזרות על עצמן...</p>
    <!-- Dynamic break items -->
</div>
```

#### 7. **Green Services Box**
```html
<div class="bg-green-50 p-4 rounded-lg border-2 border-green-200 mt-4">
    <h4 class="font-semibold text-green-900 mb-3">🔧 ניהול שירותים</h4>
    <p class="text-xs text-green-700 mb-3">הוסף את השירותים שלך עם משך זמן ומחיר...</p>
    <!-- Dynamic service items -->
</div>
```

---

## Event Form - TO PORT

### Source: `page-creator.html` (search for event section)

### Key Elements:
- Event date/time picker
- Location field
- Guest list management toggle
- RSVP settings
- Event type selection

---

## Artist/Portfolio Form - TO PORT

### Source: `page-creator.html` (search for artist section)

### Key Elements:
- Portfolio gallery
- Social media links
- Bio/About section
- Contact form toggle

---

## Course Form - TO PORT

### Source: `page-creator.html` lines 7360-7450

### Key Elements:
- Course name/description
- Video URL (YouTube)
- Price field
- Multiple courses support
- Add/remove course buttons

---

## Implementation Strategy

### Phase 1: Update Templates (service.js, event.js, etc.)
Add `infoBox` structure to each template:
```javascript
infoBox: {
    title: '...',
    description: '...',
    features: [...]
}
```

### Phase 2: Update DynamicForm.svelte
Add conditional rendering for each form type:
```svelte
{#if template.id === 'serviceProvider'}
    <!-- Render service-specific fields with exact legacy HTML -->
{:else if template.id === 'event'}
    <!-- Render event-specific fields with exact legacy HTML -->
{/if}
```

### Phase 3: Test Visual Fidelity
- [ ] Store form matches legacy ✅
- [ ] Service form matches legacy
- [ ] Event form matches legacy
- [ ] Artist form matches legacy
- [ ] Course form matches legacy

---

## Color Reference (Exact Legacy)

**Purple (Service):**
- Background: `bg-purple-50` (#F5F3FF)
- Border: `border-purple-200` (#E9D5FF)
- Text: `text-purple-900` (#581C87), `text-purple-700` (#7E22CE)

**Blue (Special Hours):**
- Background: `bg-blue-50` (#EFF6FF)
- Border: `border-blue-200` (#BFDBFE)
- Text: `text-blue-900` (#1E3A8A), `text-blue-700` (#1D4ED8)

**Orange (Breaks):**
- Background: `bg-orange-50` (#FFF7ED)
- Border: `border-orange-200` (#FED7AA)
- Text: `text-orange-900` (#7C2D12), `text-orange-700` (#C2410C)

**Green (Services/Features):**
- Background: `bg-green-50` (#F0FDF4)
- Border: `border-green-200` (#BBF7D0)
- Text: `text-green-900` (#14532D), `text-green-700` (#15803D)

---

## Priority Order

1. ✅ **Store Form** - COMPLETE
2. 🔄 **Service Form** - HIGH PRIORITY (most complex)
3. 🔄 **Event Form** - HIGH PRIORITY (needed for Guest List Manager)
4. 🔄 **Course Form** - MEDIUM PRIORITY
5. 🔄 **Artist/Portfolio Form** - MEDIUM PRIORITY

---

## After Forms Complete

→ **Build Guest List Manager** with exact legacy fidelity from `event-guests.html`

---

**User Requirement**: "I want my system exactly as it was. Every form and its specific look, all of it."
**Status**: Store ✅ | Service 🔄 | Event 🔄 | Course 🔄 | Artist 🔄
