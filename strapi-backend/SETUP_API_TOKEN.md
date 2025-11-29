# Strapi API Token Setup

After starting Strapi for the first time, you need to create an API token for the SvelteKit app to communicate with Strapi.

## Steps to Create API Token

1. **Start Strapi in development mode:**
   ```bash
   cd strapi-backend
   npm run develop
   ```

2. **Create Admin Account:**
   - Open http://localhost:1337/admin
   - Create your admin account (first time only)

3. **Create API Token:**
   - Go to Settings → API Tokens
   - Click "Create new API Token"
   - Name: `SvelteKit App`
   - Token duration: `Unlimited`
   - Token type: `Full access` (or customize permissions)
   - Click "Save"

4. **Copy the Token:**
   - Copy the generated token (you'll only see it once!)
   - Update `new-app/.env`:
     ```
     STRAPI_API_TOKEN=your-copied-token-here
     ```

5. **Configure Permissions (Optional):**
   - Go to Settings → Roles → Public
   - Enable permissions for content types as needed
   - For development, you can enable all permissions
   - For production, restrict to only necessary operations

## Content Types Created

The following content types are now available in Strapi:

- ✅ **User** - Platform users
- ✅ **Page** - User-generated landing pages
- ✅ **Purchase** - Customer purchases
- ✅ **Lead** - Form submissions and appointments
- ✅ **Analytics** - Page analytics data

## Testing the API

Once the token is configured, you can test the API:

```bash
# Get all pages
curl http://localhost:1337/api/pages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create a user
curl -X POST http://localhost:1337/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"data": {"name": "Test User", "email": "test@example.com"}}'
```

## CORS Configuration

CORS is configured to allow requests from:
- http://localhost:5173 (SvelteKit dev server)
- http://localhost:3000 (alternative dev port)
- http://localhost:4173 (SvelteKit preview)

For production, update `strapi-backend/config/middlewares.ts` to include your production domain.

## Next Steps

1. ✅ Content types created
2. ⏳ Create API token
3. ⏳ Update SvelteKit .env with token
4. ⏳ Test API connectivity
5. ⏳ Proceed to Task 3 (Implement server-side modules)
