# Deep Feature Migration Plan

## Critical Features to Migrate

### 1. Authentication & User Management ✅ IN PROGRESS
**Location:** `new-app/src/lib/stores/auth.js` + `/login` route

**Features:**
- ✅ Supabase client initialization
- ✅ Google Sign-In integration
- ✅ Email/Password authentication
- ✅ Password reset
- ✅ User session management
- ⏳ Login page UI
- ⏳ User dashboard

**Legacy Source:** `public/index.html` (lines 1680-2100)

### 2. User Dashboard
**Location:** `new-app/src/routes/dashboard/+page.svelte`

**Features:**
- Display user's created pages
- Show user profile (name, avatar, email)
- Quick actions (create new page, view marketplace)
- Admin panel (for admin users)
- Project management (edit, delete, view pages)

**Legacy Source:** `public/index.html` (dashboard-view section)

### 3. Page Creator / Editor
**Location:** `new-app/src/routes/page-creator/+page.svelte`

**Features:**
- Template selection (Store, Event, Service Provider, Restaurant, Course, Workshop)
- Dynamic form fields based on page type
- Design style selection
- Image upload functionality
- HTML generation
- Preview functionality
- Save to Strapi

**Legacy Source:** `page-creator/index.html`

**Sub-components needed:**
- Template selector
- Dynamic form generator
- Image uploader
- HTML preview
- Design style picker

### 4. Page Templates System
**Location:** `new-app/src/lib/templates/`

**Templates to migrate:**
- Online Store (with cart functionality)
- Event Page
- Service Provider
- Restaurant Menu
- Course/Workshop
- Generic Landing Page

**Legacy Source:** `page-creator/templates/page-templates.js`

### 5. Form Logic for Each Page Type
**Dynamic fields per type:**
- Store: Products, cart, checkout
- Event: Date, location, RSVP
- Service: Services list, booking
- Restaurant: Menu items, ordering
- Course: Curriculum, enrollment

**Legacy Source:** `page-creator/index.html` (dynamic fields section)

## Implementation Priority

### Phase 1: Authentication (CURRENT)
1. ✅ Create auth store
2. Create login page with Google Sign-In
3. Implement session management
4. Add protected routes

### Phase 2: Dashboard
1. Create dashboard layout
2. Fetch user's pages from Strapi
3. Display page cards with actions
4. Add create/edit/delete functionality

### Phase 3: Page Creator
1. Migrate template selection UI
2. Implement dynamic form system
3. Add image upload
4. Connect to HTML generator
5. Implement preview
6. Save to Strapi

### Phase 4: Templates & HTML Generation
1. Port all page templates
2. Migrate HTML generation logic
3. Add design styles
4. Implement template customization

## Technical Decisions

### State Management
- Use Svelte stores for global state (auth, user)
- Use Svelte 5 runes ($state, $derived) for component state
- Server-side data fetching with +page.server.js

### API Integration
- Keep existing Strapi API endpoints
- Use SvelteKit API routes as proxy when needed
- Maintain backward compatibility

### File Structure
```
new-app/src/
├── lib/
│   ├── stores/
│   │   ├── auth.js ✅
│   │   └── user.js
│   ├── templates/
│   │   ├── store.js
│   │   ├── event.js
│   │   └── ...
│   └── components/
│       ├── TemplateSelector.svelte
│       ├── DynamicForm.svelte
│       └── ImageUploader.svelte
├── routes/
│   ├── login/
│   │   └── +page.svelte
│   ├── dashboard/
│   │   ├── +page.svelte
│   │   └── +page.server.js
│   └── page-creator/
│       ├── +page.svelte
│       └── +page.server.js
```

## Next Steps

1. **NOW:** Create login page with Google Sign-In
2. **NEXT:** Build user dashboard
3. **THEN:** Migrate page creator with full functionality
4. **FINALLY:** Port all templates and test end-to-end

## Notes

- Do NOT create placeholder pages
- Port REAL logic from legacy app
- Maintain exact same functionality
- Keep Hebrew UI/UX
- Preserve all original features
