# 🔧 CSP Cache Issue - Quick Fix

**Problem:** Browser is caching old CSP policy  
**Error:** `connect-src 'self' https://api.openai.com` (old policy)  
**Actual File:** Has correct Supabase URL

---

## Quick Fix Steps

### 1. Hard Refresh Browser
Press **Ctrl + Shift + R** (or **Cmd + Shift + R** on Mac) to force reload

### 2. Clear Browser Cache
**Chrome/Edge:**
1. Press **F12** to open DevTools
2. Right-click the refresh button
3. Select **"Empty Cache and Hard Reload"**

**Or:**
1. Press **Ctrl + Shift + Delete**
2. Select "Cached images and files"
3. Click "Clear data"

### 3. Restart Dev Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
cd new-app
npm run dev
```

### 4. Use Incognito/Private Window
Open a new incognito/private window to test without cache

---

## Verify CSP is Correct

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Reload the page
4. Click on the first request (usually the HTML document)
5. Look at **Response Headers**
6. Find `Content-Security-Policy` header
7. Verify it includes: `https://osoqfadqohqcauawzmmq.supabase.co`

---

## Alternative: Remove CSP Temporarily

If you want to test without CSP restrictions during development:

**Option 1: Comment out CSP in app.html**
```html
<!-- <meta http-equiv="Content-Security-Policy" content="..."> -->
```

**Option 2: Use browser extension**
- Install "Disable Content-Security-Policy" extension
- Enable it for localhost only

---

## Current CSP Policy (Correct)

```
connect-src 'self' http://localhost:1337 https://osoqfadqohqcauawzmmq.supabase.co https://accounts.google.com
```

This SHOULD allow:
- ✅ Localhost Strapi API
- ✅ Supabase authentication
- ✅ Google OAuth

---

## If Still Not Working

### Check for Multiple CSP Sources

CSP can come from multiple places:
1. **HTML meta tag** (app.html) ← We updated this
2. **HTTP headers** (hooks.server.js) ← Check this
3. **Browser extensions** ← Disable temporarily
4. **Proxy/CDN** ← Not applicable for localhost

### Check hooks.server.js

<function_calls>
<invoke name="readFile">
<parameter name="explanation">Checking if hooks.server.js has CSP headers that might override