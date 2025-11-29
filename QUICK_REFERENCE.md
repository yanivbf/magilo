# 🚀 AutoPage - Quick Reference Guide

## 📋 Common Tasks

### Create a New Page
```
1. Navigate to /page-creator
2. Select template
3. Fill form (use ProductGallery for stores, BookingCalendar for services)
4. Choose design style
5. Submit
```

### Manage Existing Page
```
1. Go to /dashboard
2. Click "Manage" button on page card
3. View leads/purchases/analytics
4. Update lead status as needed
```

### Search Marketplace
```
1. Go to /marketplace
2. Use search bar OR click Stav Bot
3. Ask: "מספרה בתל אביב" or "חנויות אונליין"
4. Click results to view
```

---

## 🔑 Key Files

### Components:
- `DynamicForm.svelte` - Form with special fields
- `ProductGallery.svelte` - Product management
- `BookingCalendar.svelte` - Time slot management
- `StavBot.svelte` - Smart search bot

### Server Logic:
- `htmlGenerator.js` - Generate HTML with scripts
- `dataExtractorLegacy.js` - Extract contact info & products
- `pageFixes.js` - Fix store/event pages
- `pageProcessor.js` - Process HTML before saving

### API Routes:
- `/api/create-page` - Create new page
- `/api/stav-search` - Smart search
- `/api/leads/[pageId]` - Get leads
- `/api/purchases/[pageId]` - Get purchases

---

## 🎨 Templates

1. **Store** (`onlineStore`) - Products, cart, checkout
2. **Service** (`serviceProvider`) - Services, booking
3. **Event** (`event`) - RSVP, countdown, gifts
4. **Course** (`onlineCourse`) - Lessons, enrollment
5. **Message** (`messageInBottle`) - Personal messages
6. **Workshop** (`liveWorkshop`) - Live events
7. **Restaurant** (`restaurantMenu`) - Menu, ordering

---

## 🔧 Configuration

### Environment Variables (.env):
```
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_token_here
PUBLIC_APP_URL=http://localhost:5173
```

### Strapi Collections:
- `pages` - Page data
- `leads` - Lead submissions
- `purchases` - Purchase orders
- `analytics` - Page analytics
- `users` - User accounts

---

## 🐛 Troubleshooting

### Page not displaying correctly?
- Check if HTML has DOCTYPE
- Verify scripts are injected
- Check browser console for errors

### Cart not working?
- Ensure pageType is 'store'
- Check if store-checkout.js is loaded
- Verify cart placeholders are empty

### RSVP form not submitting?
- Check if pageType is 'event'
- Verify /api/rsvp endpoint exists
- Check browser console for errors

### Stav Bot not responding?
- Check if /api/stav-search endpoint works
- Verify marketplace pages are loaded
- Check browser console for errors

---

## 📊 Analytics

### Tracked Metrics:
- **Views:** Page visits
- **Clicks:** Button/link clicks
- **Conversions:** Leads + Purchases
- **Revenue:** Total purchase amount

### Access Analytics:
```
/manage/[pageId] → Analytics tab
```

---

## 🎯 Best Practices

### For Page Creation:
1. Use descriptive titles
2. Add clear descriptions
3. Include contact info
4. Upload quality images
5. Test before publishing

### For Store Pages:
1. Add multiple products
2. Include product images
3. Set realistic prices
4. Test cart functionality

### For Service Pages:
1. Add available time slots
2. Update calendar regularly
3. Respond to leads quickly

### For Event Pages:
1. Set event date/time
2. Enable RSVP form
3. Monitor guest count
4. Send reminders

---

## 🔐 Security

### Authentication:
- Cookie-based sessions
- User ID validation
- Page ownership checks

### Data Validation:
- Input sanitization
- XSS prevention
- SQL injection protection

### File Upload:
- Size limits (50MB)
- Type validation
- Secure storage

---

## 🚀 Deployment

### Development:
```bash
cd new-app
npm run dev
```

### Production Build:
```bash
npm run build
npm run preview
```

### Strapi Backend:
```bash
cd strapi-backend
npm run develop
```

---

## 📞 Quick Links

- **Homepage:** `/`
- **Dashboard:** `/dashboard`
- **Page Creator:** `/page-creator`
- **Marketplace:** `/marketplace`
- **Login:** `/login`
- **Manage Page:** `/manage/[pageId]`
- **View Page:** `/view/[slug]`

---

## 💡 Tips

1. **Use Stav Bot** for quick marketplace search
2. **Check Analytics** regularly to track performance
3. **Update Leads** status to stay organized
4. **Test Pages** before sharing publicly
5. **Backup Data** regularly from Strapi

---

**Need more help?** Check:
- `FINAL_SUMMARY.md` - Complete overview
- `DEEP_LOGIC_COMPLETE.md` - Technical details
- `API_DOCUMENTATION.md` - API reference
- Code comments - Inline documentation

---

*Last Updated: $(date)*
