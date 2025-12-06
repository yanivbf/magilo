# Google OAuth Setup - Ready to Configure

## What We Did ✅

1. **Updated Client ID** in code to: `965923411238-6e3a40oluusgqnvvlb1iuh70mesion3j.apps.googleusercontent.com`
2. **Updated `.env`** file with new Client ID
3. **Updated `auth.js`** with new Client ID
4. **Verified servers** are running (Strapi on 1337, SvelteKit on 5173)

---

## What You Need to Do Now 👇

### Step 1: Open Google Cloud Console

Click here: https://console.cloud.google.com/apis/credentials

### Step 2: Find Your OAuth Client ID

Look for the Client ID starting with:
```
965923411238
```

Click on it to edit.

### Step 3: Add Authorized JavaScript Origins

Scroll to **"Authorized JavaScript origins"**

Click **"ADD URI"** and add:
```
http://localhost:5173
```

That's it! Just this one.

### Step 4: Leave Redirect URIs Empty

**Important:** Do NOT add anything to **"Authorized redirect URIs"**

Leave it **empty**!

Why? Because we're using Google Identity Services which doesn't need redirect URIs.

### Step 5: Save and Wait

1. Click **"SAVE"** at the bottom
2. Wait **1-2 minutes** for Google to update
3. Close browser and reopen

---

## Test the Login

1. Open: http://localhost:5173/login
2. Click "Sign in with Google"
3. Select your Google account
4. Should work! ✅

---

## If It Doesn't Work

### Error: "origin_mismatch"
**Solution:** Make sure you added exactly: `http://localhost:5173`

### Error: "popup_closed_by_user"
**Solution:** Just try again

### Error: "access_denied"
**Solution:** Try a different Google account or approve permissions

### Error: 500 Internal Server Error
**Solution:** Check that Strapi is running on http://localhost:1337

---

## Quick Checklist

**What should be in Google Console:**

```
Authorized JavaScript origins:
✅ http://localhost:5173

Authorized redirect URIs:
(Empty - don't add anything!)
```

---

## Authentication Flow

1. User clicks "Sign in with Google" on `/login`
2. Google Identity Services popup appears
3. User selects Google account
4. Google returns JWT credential directly to page
5. Client decodes JWT and extracts: googleId, email, name, picture
6. POST to `/api/auth/google` with user data
7. Server creates userId: `google_${googleId}`
8. Server checks/creates user in Strapi with `subscriptionStatus: 'active'`
9. Server sets cookie: `userId=google_123456789` (30 days)
10. Client stores user in `$currentUser` store
11. Client redirects to `/dashboard`

---

## Files Updated

- `new-app/.env` - Updated GOOGLE_CLIENT_ID
- `new-app/src/lib/stores/auth.js` - Already had correct Client ID
- `new-app/src/routes/api/auth/google/+server.js` - Google OAuth endpoint
- `🔧-הגדרת-Google-OAuth.md` - Updated documentation

---

## Next Steps

After you configure Google Console:

1. Test login at http://localhost:5173/login
2. Verify cookie is set (check DevTools > Application > Cookies)
3. Verify user can create pages without 500 errors
4. Let me know if it works or if you see any errors!

---

**Tell me "It works!" when you're done, and we'll continue! 🚀**

