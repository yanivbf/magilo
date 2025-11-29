# Project Structure

This document describes the structure of the migrated application.

## Directory Overview

```
.
├── new-app/                    # SvelteKit 5 Application
│   ├── src/
│   │   ├── lib/
│   │   │   └── server/        # Server-side modules (strapi.js, htmlGenerator.js, etc.)
│   │   └── routes/            # SvelteKit routes (pages and API endpoints)
│   ├── static/                # Static assets
│   ├── .env                   # Environment variables (Strapi URL, API token)
│   └── package.json           # Dependencies: @strapi/client, date-fns
│
├── strapi-backend/            # Strapi 5 Backend (Headless CMS)
│   ├── config/                # Strapi configuration
│   ├── database/              # Database files (SQLite for dev, PostgreSQL for prod)
│   ├── src/
│   │   ├── api/               # Content types (User, Page, Purchase, Lead, Analytics)
│   │   └── extensions/        # Custom Strapi extensions
│   └── public/                # Strapi media library (uploaded images)
│
├── output/                    # Legacy files (BACKUP ONLY - not used by new system)
├── database.json              # Legacy database (BACKUP ONLY - not used by new system)
└── server.js                  # Legacy Express server (BACKUP ONLY - not used by new system)
```

## Key Points

### SvelteKit App (new-app/)
- **Frontend**: Svelte 5 components with Runes ($state, $derived, $effect)
- **API Layer**: SvelteKit API routes (+server.js files)
- **Server Modules**: Reusable logic in src/lib/server/
- **No File System Dependencies**: All data comes from Strapi API

### Strapi Backend (strapi-backend/)
- **Content Types**: User, Page, Purchase, Lead, Analytics
- **Database**: PostgreSQL (production) or SQLite (development)
- **Media Library**: Stores uploaded images
- **API**: RESTful API for CRUD operations

### Legacy Files
- **Purpose**: Backup and reference only
- **Not Used**: The new system has ZERO runtime dependency on these files
- **Migration**: One-time import from legacy files into Strapi database

## Environment Variables

### SvelteKit (.env)
```
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-api-token-here
PUBLIC_STRAPI_URL=http://localhost:1337
```

### Strapi (.env)
Generated automatically by Strapi during initialization.

## Running the Applications

### Development

**Terminal 1 - Strapi Backend:**
```bash
cd strapi-backend
npm run develop
```
Access Strapi admin at: http://localhost:1337/admin

**Terminal 2 - SvelteKit App:**
```bash
cd new-app
npm run dev
```
Access app at: http://localhost:5173

### Production

**Strapi:**
```bash
cd strapi-backend
npm run build
npm run start
```

**SvelteKit:**
```bash
cd new-app
npm run build
npm run preview
```

## Next Steps

1. ✅ Projects initialized
2. ⏳ Define Strapi content types (Task 2)
3. ⏳ Implement server-side modules (Task 3)
4. ⏳ Implement API routes (Tasks 5-9)
5. ⏳ Implement UI pages (Tasks 11-16)
6. ⏳ Create migration script (Task 18)
7. ⏳ Deploy to production (Task 25-26)
