# Comprehensive Testing Plan 🧪

## Overview
This document provides a complete testing plan for all newly integrated components and features in the application.

## Testing Environment Setup

### Prerequisites
- ✅ Strapi backend running on port 1337
- ✅ SvelteKit app running on port 5173
- ✅ Valid Strapi API token configured
- ✅ Test user account created
- ✅ Browser DevTools open for debugging

### Quick Start Commands
```bash
# Terminal 1 - Start Strapi
cd strapi-backend
npm run develop

# Terminal 2 - Start SvelteKit
cd new-app
npm run dev
```

## Phase 1: Template Creation Testing

### 1.1 Restaurant Template Test
**Objective:** Verify RestaurantForm creates pages correctly

**Test Steps:**
1. Navigate to `/page-creator`
2. Click on "🍽️ מסעדה" template
3. Fill in basic information:
   - Name: "מסעדת הבוקר"
   - Description: "מסעדה איטלקית משפחתית"
   - Upload logo image
4. Add menu categories:
   - Category: "ראשונות"
   - Add items with prices
5. Set opening hours for each day
6. Configure delivery settings
7. Click "צור דף"

**Expected Results:**
- ✅ Form validates all required fields
- ✅ Image upload works without errors
- ✅ Menu items save correctly
- ✅ Page created successfully
- ✅ Redirected to new page
- ✅ All data displays correctly on page

**Error Cases to Test:**
- Empty required fields
- Invalid price formats
- Image upload failures
- Network errors during save

---

### 1.2 Workshop Template Test
**Objective:** Verify WorkshopForm creates pages correctly

**Test Steps:**
1. Navigate to `/page-creator`
2. Click on "🎓 סדנה" template
3. Fill in workshop details:
   - Title: "סדנת פיתוח ווב"
   - Instructor: "יוסי כהן"
   - Upload workshop image
4. Set schedule:
   - Date: Future date
   - Time: 19:00
   - Duration: 3 hours
5. Configure platform (Zoom/Teams)
6. Set pricing:
   - Regular: 500 ILS
   - Early bird: 400 ILS
7. Add content details
8. Click "צור דף"

**Expected Results:**
- ✅ All fields save correctly
- ✅ Date picker works properly
- ✅ Pricing calculations correct
- ✅ Page created with workshop template
- ✅ All information displays correctly


### 1.3 Quick HTML Generator Test
**Objective:** Verify QuickHTMLGenerator creates pages from prompts

**Test Steps:**
1. Navigate to `/page-creator`
2. Click on "⚡ יצירה מהירה" template
3. Enter prompt: "דף נחיתה למוצר חדש - אפליקציה לניהול משימות"
4. Click "צור דף"
5. Wait for generation
6. Review preview
7. Click "שמור דף"

**Expected Results:**
- ✅ Generation completes within 10 seconds
- ✅ Preview displays generated HTML
- ✅ HTML is valid and styled
- ✅ Save creates page in Strapi
- ✅ Redirected to new page
- ✅ Page renders correctly

**Test Various Prompts:**
- Simple: "דף אודות"
- Complex: "דף מוצר עם גלריה ותמונות"
- Hebrew: "דף ברכה לחתונה"
- English: "Landing page for SaaS product"

---

## Phase 2: Management Interface Testing

### 2.1 Product Manager Test
**Objective:** Verify full CRUD operations for products

**Test Steps:**

#### Create Product
1. Navigate to `/manage/[pageId]`
2. Click "מוצרים" tab
3. Click "הוסף מוצר"
4. Fill in product details:
   - Name: "פיצה מרגריטה"
   - Description: "פיצה קלאסית עם עגבניות ובזיליקום"
   - Price: 45
   - Upload product image
5. Click "שמור"

**Expected Results:**
- ✅ Modal opens correctly
- ✅ Image upload works
- ✅ Product saves to Strapi
- ✅ Product appears in list
- ✅ Real-time update without refresh

#### Edit Product
1. Click "ערוך" on existing product
2. Change price to 50
3. Update description
4. Click "שמור"

**Expected Results:**
- ✅ Modal pre-fills with existing data
- ✅ Changes save correctly
- ✅ List updates immediately
- ✅ No duplicate entries created

#### Delete Product
1. Click "מחק" on product
2. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Product removed from Strapi
- ✅ Product removed from list
- ✅ No errors in console

#### Enable/Disable Product
1. Toggle "זמין" switch on product

**Expected Results:**
- ✅ Status updates immediately
- ✅ Visual feedback on toggle
- ✅ Status persists on refresh


### 2.2 Services Editor Test
**Objective:** Verify dynamic service management

**Test Steps:**

#### Add Service
1. Navigate to `/manage/[pageId]`
2. Click "שירותים" tab
3. Click "הוסף שירות"
4. Fill in service details:
   - Name: "ייעוץ אישי"
   - Description: "שעת ייעוץ אחד על אחד"
   - Duration: 60 minutes
   - Price: 300 ILS
5. Click "שמור"

**Expected Results:**
- ✅ Service added to list
- ✅ Data saves to page attributes
- ✅ Real-time update
- ✅ No page refresh needed

#### Edit Service
1. Click "ערוך" on service
2. Change duration to 90 minutes
3. Update price to 400 ILS
4. Click "שמור"

**Expected Results:**
- ✅ Changes save correctly
- ✅ List updates immediately
- ✅ Data persists on refresh

#### Delete Service
1. Click "מחק" on service
2. Confirm deletion

**Expected Results:**
- ✅ Service removed from list
- ✅ Data removed from page
- ✅ No errors

---

### 2.3 Section Manager Test
**Objective:** Verify section reordering and toggling

**Test Steps:**

#### View Sections
1. Navigate to `/manage/[pageId]`
2. Click "סקשנים" tab
3. View all page sections

**Expected Results:**
- ✅ All sections display
- ✅ Sections show correct types
- ✅ Order matches page display
- ✅ Enable/disable status visible

#### Reorder Sections
1. Drag "About" section
2. Drop it above "Services" section
3. Wait for save confirmation

**Expected Results:**
- ✅ Drag-and-drop works smoothly
- ✅ Visual feedback during drag
- ✅ Order saves to Strapi
- ✅ Success message appears
- ✅ Order persists on refresh
- ✅ Page display updates

#### Toggle Section
1. Click toggle switch on section
2. Verify status change

**Expected Results:**
- ✅ Toggle updates immediately
- ✅ Status saves to Strapi
- ✅ Section visibility changes on page
- ✅ Status persists on refresh


## Phase 3: Image Upload Testing

### 3.1 ImageUploader Component Test
**Objective:** Verify image upload functionality across components

**Test Locations:**
- ProductManager (product images)
- RestaurantForm (logo, menu items)
- WorkshopForm (workshop image)
- PageEditToolbar (page images)

**Test Steps:**
1. Click "העלה תמונה" button
2. Select valid image file (JPG, PNG)
3. Wait for upload
4. Verify preview appears
5. Save parent form/component

**Expected Results:**
- ✅ File picker opens
- ✅ Upload progress shows
- ✅ Preview displays correctly
- ✅ Image URL saved
- ✅ Image accessible via URL
- ✅ No CORS errors

**Error Cases:**
- Invalid file type (PDF, TXT)
- File too large (>10MB)
- Network error during upload
- Invalid image format

**Expected Error Handling:**
- ✅ Clear error messages in Hebrew
- ✅ Upload cancels gracefully
- ✅ No partial data saved
- ✅ User can retry

---

## Phase 4: API Endpoint Testing

### 4.1 Products API Test

#### POST /api/products
```bash
curl -X POST http://localhost:5173/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "price": 100,
    "pageId": 1,
    "imageUrl": "https://example.com/image.jpg"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "product": {
    "id": 123,
    "name": "Test Product",
    ...
  }
}
```

#### PATCH /api/products/[id]
```bash
curl -X PATCH http://localhost:5173/api/products/123 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 150
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "product": { ... }
}
```

#### DELETE /api/products/[id]
```bash
curl -X DELETE http://localhost:5173/api/products/123
```

**Expected Response:**
```json
{
  "success": true
}
```


### 4.2 Services API Test

#### PUT /api/services/[pageId]
```bash
curl -X PUT http://localhost:5173/api/services/1 \
  -H "Content-Type: application/json" \
  -d '{
    "services": [
      {
        "name": "Service 1",
        "description": "Description",
        "duration": 60,
        "price": 200
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "page": { ... }
}
```

---

### 4.3 Sections API Test

#### PATCH /api/sections/[id]/toggle
```bash
curl -X PATCH http://localhost:5173/api/sections/1/toggle
```

**Expected Response:**
```json
{
  "success": true,
  "section": {
    "id": 1,
    "enabled": false
  }
}
```

#### POST /api/sections/reorder
```bash
curl -X POST http://localhost:5173/api/sections/reorder \
  -H "Content-Type: application/json" \
  -d '{
    "sections": [
      {"id": 2, "order": 0},
      {"id": 1, "order": 1},
      {"id": 3, "order": 2}
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true
}
```

---

### 4.4 HTML Generation API Test

#### POST /api/generate-html
```bash
curl -X POST http://localhost:5173/api/generate-html \
  -H "Content-Type: application/json" \
  -d '{
    "template": "quick",
    "data": {
      "prompt": "דף נחיתה למוצר חדש"
    },
    "userId": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "html": "<html>...</html>"
}
```


## Phase 5: Integration Testing

### 5.1 End-to-End Restaurant Flow
**Objective:** Test complete restaurant page creation and management

**Test Steps:**
1. Create restaurant page with RestaurantForm
2. Navigate to management interface
3. Add products via ProductManager
4. Reorder sections via SectionManager
5. View public page
6. Verify all data displays correctly

**Expected Results:**
- ✅ Seamless flow between components
- ✅ Data consistency across interfaces
- ✅ No data loss during transitions
- ✅ Real-time updates work
- ✅ Public page reflects all changes

---

### 5.2 End-to-End Workshop Flow
**Objective:** Test complete workshop page creation and management

**Test Steps:**
1. Create workshop page with WorkshopForm
2. Navigate to management interface
3. Edit services via ServicesEditor
4. Toggle sections via SectionManager
5. View public page
6. Test appointment booking

**Expected Results:**
- ✅ Workshop data saves correctly
- ✅ Services editable post-creation
- ✅ Section visibility works
- ✅ Booking form functional
- ✅ All features integrated

---

### 5.3 Quick HTML to Management Flow
**Objective:** Test pages created via QuickHTMLGenerator

**Test Steps:**
1. Create page with QuickHTMLGenerator
2. Navigate to management interface
3. Add products/services
4. Reorder sections
5. Upload images
6. View public page

**Expected Results:**
- ✅ Generated pages manageable
- ✅ All management features work
- ✅ No conflicts with generated HTML
- ✅ Data persists correctly


## Phase 6: Error Handling & Edge Cases

### 6.1 Network Error Testing
**Test Scenarios:**
- Strapi backend offline
- Slow network connection
- Request timeout
- Invalid API responses

**Test Steps:**
1. Stop Strapi backend
2. Try to create product
3. Try to save page
4. Try to upload image

**Expected Results:**
- ✅ Clear error messages
- ✅ No data corruption
- ✅ Graceful degradation
- ✅ Retry options available
- ✅ User can recover

---

### 6.2 Validation Testing
**Test Invalid Inputs:**

#### ProductManager
- Empty product name
- Negative price
- Invalid image URL
- Missing required fields

#### ServicesEditor
- Empty service name
- Zero duration
- Negative price
- Invalid data types

#### RestaurantForm
- Empty restaurant name
- Invalid opening hours
- Missing delivery info
- Malformed menu data

**Expected Results:**
- ✅ Validation errors display
- ✅ Form submission blocked
- ✅ Clear error messages
- ✅ Fields highlighted
- ✅ User can correct errors

---

### 6.3 Concurrent User Testing
**Test Scenarios:**
- Two users editing same page
- Simultaneous product creation
- Concurrent section reordering
- Race conditions

**Test Steps:**
1. Open page in two browsers
2. Edit same product in both
3. Save from both browsers
4. Verify data consistency

**Expected Results:**
- ✅ Last write wins (or conflict detection)
- ✅ No data corruption
- ✅ Clear conflict messages
- ✅ Data integrity maintained


## Phase 7: Performance Testing

### 7.1 Load Testing
**Test Scenarios:**
- Page with 100+ products
- Page with 50+ services
- Page with 20+ sections
- Large image uploads (5-10MB)

**Metrics to Measure:**
- Initial page load time
- Component render time
- API response time
- Image upload time
- Real-time update latency

**Expected Performance:**
- ✅ Page load < 3 seconds
- ✅ Component render < 500ms
- ✅ API response < 1 second
- ✅ Image upload < 5 seconds
- ✅ Updates < 1 second

---

### 7.2 Memory Testing
**Test Steps:**
1. Open management interface
2. Create 50 products
3. Switch between tabs repeatedly
4. Monitor memory usage in DevTools

**Expected Results:**
- ✅ No memory leaks
- ✅ Memory usage stable
- ✅ No performance degradation
- ✅ Smooth tab switching

---

## Phase 8: Mobile Responsiveness Testing

### 8.1 Mobile Device Testing
**Test Devices:**
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Various screen sizes

**Test Components:**
- RestaurantForm on mobile
- WorkshopForm on mobile
- ProductManager on mobile
- SectionManager drag-and-drop
- Image upload on mobile

**Expected Results:**
- ✅ Responsive layouts
- ✅ Touch-friendly buttons
- ✅ Readable text sizes
- ✅ Proper spacing
- ✅ No horizontal scroll
- ✅ Forms usable on mobile
- ✅ Drag-and-drop works (or alternative)

---

### 8.2 RTL Testing
**Test Hebrew Interface:**
- All forms in Hebrew
- Management interface in Hebrew
- Error messages in Hebrew
- Proper RTL alignment
- No text overflow

**Expected Results:**
- ✅ Correct RTL direction
- ✅ Proper text alignment
- ✅ Icons positioned correctly
- ✅ No layout breaks
- ✅ Readable on all screens


## Phase 9: Browser Compatibility Testing

### 9.1 Cross-Browser Testing
**Test Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Test All Features:**
- Template creation
- Product management
- Service editing
- Section reordering
- Image uploads
- Form submissions

**Expected Results:**
- ✅ Consistent behavior
- ✅ No browser-specific bugs
- ✅ Proper rendering
- ✅ All features work
- ✅ No console errors

---

## Phase 10: Accessibility Testing

### 10.1 Keyboard Navigation
**Test Steps:**
1. Navigate forms using Tab key
2. Submit forms using Enter
3. Close modals using Escape
4. Navigate management tabs

**Expected Results:**
- ✅ Logical tab order
- ✅ Visible focus indicators
- ✅ All interactive elements accessible
- ✅ Keyboard shortcuts work
- ✅ No keyboard traps

---

### 10.2 Screen Reader Testing
**Test with:**
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (Mac/iOS)

**Expected Results:**
- ✅ Proper ARIA labels
- ✅ Form fields announced
- ✅ Error messages read
- ✅ Button purposes clear
- ✅ Navigation logical

---

## Phase 11: Security Testing

### 11.1 Authentication Testing
**Test Scenarios:**
- Unauthenticated access attempts
- Expired session handling
- Invalid token handling
- CSRF protection

**Expected Results:**
- ✅ Unauthorized access blocked
- ✅ Proper redirects to login
- ✅ Session expiry handled
- ✅ No sensitive data exposed

---

### 11.2 Input Sanitization
**Test Malicious Inputs:**
- XSS attempts in forms
- SQL injection attempts
- Script tags in text fields
- HTML injection

**Expected Results:**
- ✅ All inputs sanitized
- ✅ No script execution
- ✅ Safe data storage
- ✅ Proper escaping


## Testing Checklist

### Pre-Testing Setup
- [ ] Strapi backend running
- [ ] SvelteKit app running
- [ ] Test user account created
- [ ] Browser DevTools open
- [ ] Network tab monitoring
- [ ] Console tab monitoring

### Template Creation
- [ ] Restaurant template creates pages
- [ ] Workshop template creates pages
- [ ] Quick HTML generator works
- [ ] All form fields save correctly
- [ ] Images upload successfully
- [ ] Validation works properly

### Management Interface
- [ ] Product CRUD operations work
- [ ] Service CRUD operations work
- [ ] Section reordering works
- [ ] Section toggling works
- [ ] Real-time updates function
- [ ] All tabs accessible

### API Endpoints
- [ ] Products API responds correctly
- [ ] Services API responds correctly
- [ ] Sections API responds correctly
- [ ] HTML generation API works
- [ ] Image upload API works
- [ ] Error responses proper

### Integration
- [ ] End-to-end restaurant flow
- [ ] End-to-end workshop flow
- [ ] Quick HTML to management flow
- [ ] Data consistency maintained
- [ ] No data loss occurs

### Error Handling
- [ ] Network errors handled
- [ ] Validation errors display
- [ ] Concurrent edits handled
- [ ] Recovery options available
- [ ] Clear error messages

### Performance
- [ ] Page loads quickly
- [ ] Components render fast
- [ ] No memory leaks
- [ ] Smooth interactions
- [ ] Large datasets handled

### Mobile & Responsive
- [ ] Mobile layouts work
- [ ] Touch interactions work
- [ ] RTL properly implemented
- [ ] No horizontal scroll
- [ ] Readable on all screens

### Browser Compatibility
- [ ] Chrome works
- [ ] Firefox works
- [ ] Safari works
- [ ] Edge works
- [ ] No browser-specific bugs

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen readers compatible
- [ ] Focus indicators visible
- [ ] ARIA labels proper
- [ ] Semantic HTML used

### Security
- [ ] Authentication enforced
- [ ] Inputs sanitized
- [ ] XSS prevented
- [ ] CSRF protected
- [ ] No data leaks


## Bug Reporting Template

When you find a bug, document it using this template:

```markdown
### Bug Report #[NUMBER]

**Component:** [ProductManager / RestaurantForm / etc.]

**Severity:** [Critical / High / Medium / Low]

**Description:**
[Clear description of the bug]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Browser: [Chrome 120 / Firefox 121 / etc.]
- OS: [Windows 11 / macOS 14 / etc.]
- Screen Size: [1920x1080 / Mobile / etc.]

**Screenshots/Videos:**
[Attach if available]

**Console Errors:**
```
[Paste console errors]
```

**Network Errors:**
[Paste failed requests]

**Additional Context:**
[Any other relevant information]
```

---

## Test Results Documentation

### Test Session Template

```markdown
## Test Session: [DATE]

**Tester:** [Name]
**Duration:** [Time]
**Environment:** [Browser, OS, etc.]

### Tests Completed
- [x] Template Creation - Restaurant
- [x] Template Creation - Workshop
- [ ] Template Creation - Quick HTML (FAILED - See Bug #1)
- [x] Product Manager - Create
- [x] Product Manager - Edit
- [ ] Product Manager - Delete (FAILED - See Bug #2)

### Bugs Found
1. Bug #1 - Quick HTML generation timeout
2. Bug #2 - Product delete confirmation not showing

### Performance Notes
- Page load time: 2.1s (Good)
- Product creation: 0.8s (Good)
- Image upload: 4.2s (Acceptable)

### Recommendations
- Improve error messages for network failures
- Add loading indicators to all async operations
- Consider pagination for large product lists
```

---

## Automated Testing Scripts

### Quick Test Script (Browser Console)

```javascript
// Test Product Creation
async function testProductCreation() {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      pageId: 1
    })
  });
  const result = await response.json();
  console.log('Product Creation:', result.success ? '✅ PASS' : '❌ FAIL');
  return result;
}

// Test Service Update
async function testServiceUpdate(pageId) {
  const response = await fetch(`/api/services/${pageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      services: [
        { name: 'Test Service', duration: 60, price: 200 }
      ]
    })
  });
  const result = await response.json();
  console.log('Service Update:', result.success ? '✅ PASS' : '❌ FAIL');
  return result;
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Starting Tests...\n');
  await testProductCreation();
  await testServiceUpdate(1);
  console.log('\n✅ Tests Complete');
}

// Execute
runAllTests();
```


## Priority Testing Order

### Phase 1: Critical Path (Day 1)
**Priority: HIGHEST**
1. Template creation (all 3 types)
2. Product CRUD operations
3. Service CRUD operations
4. Image uploads
5. Page creation and viewing

**Goal:** Ensure core functionality works

---

### Phase 2: Management Features (Day 2)
**Priority: HIGH**
1. Section reordering
2. Section toggling
3. Real-time updates
4. Management interface navigation
5. Data persistence

**Goal:** Verify management tools work

---

### Phase 3: Integration & Flow (Day 3)
**Priority: MEDIUM**
1. End-to-end flows
2. Data consistency
3. Component integration
4. API endpoint testing
5. Error handling

**Goal:** Ensure seamless user experience

---

### Phase 4: Quality & Polish (Day 4)
**Priority: MEDIUM**
1. Mobile responsiveness
2. Browser compatibility
3. Performance testing
4. Accessibility
5. RTL implementation

**Goal:** Production-ready quality

---

### Phase 5: Security & Edge Cases (Day 5)
**Priority: LOW (but important)
1. Security testing
2. Edge case handling
3. Concurrent user testing
4. Load testing
5. Memory testing

**Goal:** Robust and secure application

---

## Success Criteria

### Must Have (Blocking Issues)
- ✅ All template types create pages successfully
- ✅ Product CRUD operations work without errors
- ✅ Service CRUD operations work without errors
- ✅ Image uploads complete successfully
- ✅ Data persists correctly in Strapi
- ✅ No critical console errors
- ✅ No data loss or corruption

### Should Have (Important)
- ✅ Section reordering works smoothly
- ✅ Real-time updates function properly
- ✅ Error messages clear and helpful
- ✅ Mobile responsive layouts
- ✅ RTL properly implemented
- ✅ Performance acceptable (<3s load)

### Nice to Have (Polish)
- ✅ Smooth animations
- ✅ Loading indicators everywhere
- ✅ Keyboard shortcuts
- ✅ Screen reader support
- ✅ Advanced error recovery

---

## Testing Tools & Resources

### Browser DevTools
- **Network Tab:** Monitor API calls
- **Console Tab:** Check for errors
- **Performance Tab:** Measure load times
- **Application Tab:** Check localStorage/cookies
- **Lighthouse:** Accessibility & performance audit

### Testing Extensions
- **React DevTools:** Component inspection (if needed)
- **Redux DevTools:** State inspection (if needed)
- **Axe DevTools:** Accessibility testing
- **WAVE:** Web accessibility evaluation

### External Tools
- **Postman:** API endpoint testing
- **BrowserStack:** Cross-browser testing
- **GTmetrix:** Performance analysis
- **Lighthouse CI:** Automated audits

---

## Contact & Support

### If You Find Issues
1. Document using bug report template
2. Check console for errors
3. Check network tab for failed requests
4. Take screenshots/videos
5. Note steps to reproduce

### Getting Help
- Check INTEGRATION_COMPLETE.md for component details
- Review API_DOCUMENTATION.md for endpoint specs
- Check component source code for implementation
- Review Strapi admin for data verification

---

## Final Notes

This testing plan is comprehensive but flexible. Adjust priorities based on:
- Project timeline
- Available resources
- Critical user paths
- Known risk areas

**Remember:** The goal is production-ready software that works reliably for users. Focus on critical paths first, then expand to edge cases and polish.

**Good luck with testing! 🚀**
