# Quick Start Guide

Get the migrated application running in minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Step 1: Start Strapi Backend

```bash
cd strapi-backend
npm run develop
```

**First Time Setup:**
1. Open http://localhost:1337/admin
2. Create your admin account
3. Go to Settings → API Tokens → Create new API Token
4. Name: "SvelteKit App", Type: "Full access"
5. Copy the token

## Step 2: Configure SvelteKit

Update `new-app/.env` with your Strapi API token:

```env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-token-here
PUBLIC_STRAPI_URL=http://localhost:1337
```

## Step 3: Start SvelteKit App

```bash
cd new-app
npm run dev
```

Access the app at: http://localhost:5173

## What You Can Do Now

### 1. Browse the Home Page
- Visit http://localhost:5173
- See features and page types
- Click "Browse Marketplace" or "Create a Page"

### 2. View the Marketplace
- Visit http://localhost:5173/marketplace
- Search and filter pages
- Click on any page to view it

### 3. Test the API

**Create a Test Page:**
```bash
curl -X POST http://localhost:5173/api/create-page \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "title": "My First Page",
    "htmlContent": "<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello World!</h1><p>This is my first page.</p></body></html>",
    "selectedPageType": "generic"
  }'
```

**View Your Page:**
The API will return a slug. Visit: http://localhost:5173/pages/[slug]

**Get User Pages:**
```bash
curl http://localhost:5173/api/pages/test-user-123
```

### 4. Create a Purchase

```bash
curl -X POST http://localhost:5173/api/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pageId": "1",
    "products": [{"name": "Test Product", "price": 100, "quantity": 1}],
    "total": 100,
    "paymentMethod": "credit_card",
    "customerName": "John Doe",
    "customerPhone": "0501234567"
  }'
```

### 5. Submit a Lead

```bash
curl -X POST http://localhost:5173/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pageId": "1",
    "name": "Jane Doe",
    "phone": "0501234567",
    "message": "Interested in your services"
  }'
```

## Available Routes

### Public Pages
- `/` - Home page
- `/marketplace` - Browse active pages
- `/pages/[slug]` - View a page
- `/view/[slug]` - Clean page view (no editor)

### API Endpoints
See `API_DOCUMENTATION.md` for complete API reference.

## Troubleshooting

### Strapi won't start
- Check if port 1337 is available
- Delete `strapi-backend/.tmp` and try again
- Run `npm install` in strapi-backend

### SvelteKit won't start
- Check if port 5173 is available
- Verify `.env` file has correct Strapi URL and token
- Run `npm install` in new-app

### API returns 401 Unauthorized
- Verify STRAPI_API_TOKEN in `.env` is correct
- Check token hasn't expired in Strapi admin
- Restart SvelteKit dev server after changing `.env`

### Pages not loading
- Verify Strapi is running
- Check browser console for errors
- Verify page exists in Strapi admin panel

## Next Steps

### Create More Pages
Use the API to create different page types:
- `store` - Online store
- `event` - Event page
- `serviceProvider` - Service booking
- `restaurantMenu` - Restaurant menu
- `course` - Digital course
- `workshop` - Live workshop

### Explore Strapi Admin
- View all content types
- Manage pages, purchases, leads
- Check analytics data
- Upload images to media library

### Test Different Features
- Create pages with products
- Submit leads and appointments
- Update purchase statuses
- Search and filter marketplace

## Development Tips

### Hot Reload
Both Strapi and SvelteKit support hot reload:
- Changes to SvelteKit code reload automatically
- Changes to Strapi content types require restart

### Debugging
- Check browser console for frontend errors
- Check terminal for backend errors
- Use browser DevTools Network tab for API calls

### Database
Strapi uses SQLite by default (stored in `strapi-backend/.tmp/data.db`).
For production, configure PostgreSQL in `strapi-backend/config/database.ts`.

## What's Working

✅ **Backend (100%)**
- All API endpoints functional
- Strapi content types defined
- Database operations working
- Image uploads to Strapi media library

✅ **Frontend (60%)**
- Home page with features
- Marketplace with search/filter
- Page viewing (dynamic HTML rendering)
- Clean page view
- Legacy URL redirects

⏳ **To Be Implemented**
- Page creator UI
- Management hub (user dashboard)
- Admin panels (purchases, leads, appointments)
- Data migration script

## Support

For issues or questions:
1. Check `API_DOCUMENTATION.md` for API reference
2. Check `MIGRATION_PROGRESS.md` for implementation status
3. Check `PROJECT_STRUCTURE.md` for architecture overview
4. Review Strapi logs in terminal
5. Review SvelteKit logs in terminal

## Production Deployment

Before deploying to production:
1. Configure PostgreSQL database
2. Set up proper authentication
3. Configure CORS for production domain
4. Set up SSL/HTTPS
5. Configure environment variables
6. Run migration script to import legacy data

See deployment guides in documentation.
