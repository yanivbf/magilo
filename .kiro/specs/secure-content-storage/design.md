# Design Document: Secure Content Storage

## Overview

This design addresses the architectural security concern of storing raw HTML strings in the database. The current system generates complete HTML pages server-side and stores them as text in Strapi's `htmlContent` field. This approach poses security risks and violates modern CMS best practices.

The new architecture will:
1. Store structured content as JSON blocks instead of raw HTML
2. Generate HTML on-demand from structured content
3. Maintain all current functionality while improving security
4. Provide a migration path for existing pages

## Architecture

### Current Architecture (To Be Replaced)

```
User Input → Template Engine → Complete HTML String → Strapi (text field) → Direct HTML Rendering
```

**Problems:**
- Raw HTML stored in database
- No content validation
- XSS vulnerability if HTML is compromised
- Difficult to modify or version content
- No structured data for search/analysis

### New Architecture

```
User Input → Content Structurer → JSON Blocks → Strapi (richtext/blocks) → Block Renderer → Safe HTML
```

**Benefits:**
- Structured content with validation
- XSS protection through controlled rendering
- Content can be searched, analyzed, versioned
- Easier to modify and maintain
- Strapi provides built-in validation

## Components and Interfaces

### 1. Content Structurer

**Purpose:** Convert template data into structured JSON blocks

**Location:** `new-app/src/lib/server/contentStructurer.js`

**Interface:**
```javascript
/**
 * Convert template data to structured blocks
 * @param {string} templateType - Template type (store, event, etc.)
 * @param {Object} data - Template data
 * @param {string[]} optionalSections - Optional sections to include
 * @returns {Object[]} - Array of content blocks
 */
export function structureContent(templateType, data, optionalSections = [])
```

**Block Types:**
- `hero` - Hero section with title, subtitle, image
- `text` - Rich text content
- `products` - Product grid with structured product data
- `gallery` - Image gallery
- `faq` - FAQ accordion
- `contact` - Contact information
- `social` - Social media links
- `video` - Embedded video
- `services` - Services list
- `custom` - Custom HTML (sanitized)

### 2. Block Renderer

**Purpose:** Convert structured blocks to safe HTML

**Location:** `new-app/src/lib/server/blockRenderer.js`

**Interface:**
```javascript
/**
 * Render structured blocks to HTML
 * @param {Object[]} blocks - Content blocks
 * @param {Object} pageData - Additional page data
 * @returns {string} - Safe HTML output
 */
export function renderBlocks(blocks, pageData = {})
```

**Rendering Strategy:**
- Each block type has a dedicated renderer function
- All user content is escaped before rendering
- HTML structure is controlled by the renderer
- No raw HTML from blocks is rendered directly

### 3. Strapi Schema Update

**File:** `strapi-backend/src/api/page/content-types/page/schema.json`

**Change:**
```json
{
  "htmlContent": {
    "type": "richtext",
    "required": true
  }
}
```

**Note:** Strapi's `richtext` type stores content as Markdown with JSON metadata, providing built-in sanitization and validation.

### 4. Migration Script

**Purpose:** Convert existing HTML pages to structured blocks

**Location:** `scripts/migrate-to-blocks.js`

**Strategy:**
1. Parse existing HTML to extract structured data
2. Identify sections (hero, products, contact, etc.)
3. Convert to block format
4. Validate blocks
5. Update Strapi records
6. Verify rendering matches original

## Data Models

### Content Block Structure

```javascript
{
  type: 'hero' | 'text' | 'products' | 'gallery' | 'faq' | 'contact' | 'social' | 'video' | 'services' | 'custom',
  id: string,  // Unique block ID
  data: {
    // Block-specific data
  },
  metadata: {
    order: number,
    visible: boolean,
    style: object  // Optional styling
  }
}
```

### Block Type Examples

**Hero Block:**
```javascript
{
  type: 'hero',
  id: 'hero-1',
  data: {
    title: 'Welcome',
    subtitle: 'Description',
    image: 'https://...',
    ctaText: 'Get Started',
    ctaLink: '#contact'
  }
}
```

**Products Block:**
```javascript
{
  type: 'products',
  id: 'products-1',
  data: {
    title: 'Our Products',
    products: [
      {
        id: 1,
        name: 'Product 1',
        description: 'Description',
        price: 99,
        image: 'https://...'
      }
    ]
  }
}
```

**Contact Block:**
```javascript
{
  type: 'contact',
  id: 'contact-1',
  data: {
    phone: '050-1234567',
    email: 'contact@example.com',
    address: 'Tel Aviv',
    whatsapp: '972501234567'
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all properties from the prework, several can be consolidated:

**Redundancies Identified:**
- Properties 1.2 and 3.1 both test block-to-HTML conversion (consolidate into one)
- Properties 1.3 and 3.2 both test content sanitization (consolidate into one)
- Properties 2.2 and 2.3 both test Strapi validation (consolidate into one)
- Properties 3.3, 3.5, 5.3, and 5.5 all test feature parity (consolidate into one comprehensive property)
- Properties 4.2 and 4.3 both test migration correctness (consolidate into one)

**Final Property Set:** 12 unique properties after consolidation

### Correctness Properties

**Property 1: Block Storage Invariant**
*For any* page creation operation, the content stored in Strapi's htmlContent field must be in structured JSON block format, not raw HTML strings.
**Validates: Requirements 1.1, 1.4**

**Property 2: Block Rendering Correctness**
*For any* valid block structure, the renderer must produce valid, safe HTML with all user content properly escaped.
**Validates: Requirements 1.2, 3.1, 3.2**

**Property 3: XSS Protection**
*For any* user input containing potential XSS vectors (script tags, event handlers, etc.), the system must sanitize or escape the content so that it cannot execute in the rendered HTML.
**Validates: Requirements 1.3**

**Property 4: Backward Compatibility**
*For any* existing page, after migration to the new system, the rendered output must be visually and functionally identical to the original.
**Validates: Requirements 1.5, 4.3**

**Property 5: Schema Validation**
*For any* content saved to Strapi, if the content structure is invalid (malformed blocks, missing required fields), Strapi must reject the save operation.
**Validates: Requirements 2.2, 2.3**

**Property 6: Template Type Support**
*For any* supported page type (store, event, service, course, workshop, restaurant, artist, message), the system must successfully create, store, and render pages with all type-specific features.
**Validates: Requirements 2.4, 3.3, 5.5**

**Property 7: Graceful Degradation**
*For any* rendering error (invalid blocks, missing data, etc.), the system must display a fallback page instead of crashing or showing broken content.
**Validates: Requirements 3.4**

**Property 8: Visual Parity**
*For any* page created with the new system, the rendered HTML must be visually identical to what the old system would have produced for the same input data.
**Validates: Requirements 3.5, 5.3**

**Property 9: Migration Completeness**
*For any* set of existing pages, after running the migration script, all pages must be successfully converted to block format with no data loss.
**Validates: Requirements 4.2**

**Property 10: Migration Reversibility**
*For any* migrated page, running the rollback process must restore the original HTML content exactly.
**Validates: Requirements 4.5**

**Property 11: API Backward Compatibility**
*For any* page creation request using the old API format, the new system must accept it and produce the same result as before.
**Validates: Requirements 5.2**

**Property 12: Block Update Correctness**
*For any* page edit operation, updating block content must persist the changes correctly and render the updated content on the next page load.
**Validates: Requirements 5.4**

## Error Handling

### Content Structuring Errors

**Scenario:** Invalid template data provided
**Handling:** 
- Validate all required fields before structuring
- Provide default values for optional fields
- Return detailed error messages indicating missing/invalid fields
- Log errors for debugging

**Scenario:** Unsupported template type
**Handling:**
- Fall back to generic template
- Log warning about unsupported type
- Continue with basic content blocks

### Rendering Errors

**Scenario:** Invalid block structure
**Handling:**
- Skip invalid blocks with warning log
- Continue rendering valid blocks
- Display error message in place of invalid block (dev mode only)

**Scenario:** Missing required block data
**Handling:**
- Use default values where possible
- Skip block if defaults not available
- Log warning for debugging

**Scenario:** Complete rendering failure
**Handling:**
- Return minimal fallback HTML with page title and contact info
- Log full error details
- Display user-friendly error message

### Migration Errors

**Scenario:** HTML parsing fails
**Handling:**
- Log the problematic HTML
- Skip page and continue with others
- Generate report of failed migrations
- Provide manual migration option

**Scenario:** Block validation fails after conversion
**Handling:**
- Attempt to fix common issues automatically
- Fall back to simpler block structure
- Log validation errors
- Mark page for manual review

### Database Errors

**Scenario:** Strapi save fails
**Handling:**
- Retry with exponential backoff (3 attempts)
- Log full error details
- Return error to user with actionable message
- Preserve user input for retry

**Scenario:** Schema validation fails
**Handling:**
- Return detailed validation errors
- Suggest corrections
- Do not persist invalid data
- Log for monitoring

## Testing Strategy

### Unit Testing

**Content Structurer Tests:**
- Test each template type produces correct block structure
- Test optional sections are included/excluded correctly
- Test edge cases (empty data, missing fields, special characters)
- Test error handling for invalid inputs

**Block Renderer Tests:**
- Test each block type renders correct HTML
- Test HTML escaping for user content
- Test XSS prevention (script tags, event handlers, etc.)
- Test fallback rendering for invalid blocks
- Test visual output matches expected HTML structure

**Migration Script Tests:**
- Test HTML parsing extracts correct data
- Test block conversion for each template type
- Test preservation of all page features
- Test error handling for malformed HTML

### Property-Based Testing

**Testing Framework:** fast-check (JavaScript property-based testing library)

**Test Configuration:** Each property test must run minimum 100 iterations

**Property Test Implementations:**

**Property 1 Test:** Generate random page data for each template type, create pages, query database, verify all htmlContent fields contain JSON blocks not HTML strings.

**Property 2 Test:** Generate random block structures, render them, verify output is valid HTML and all text content is escaped.

**Property 3 Test:** Generate random XSS attack vectors, include in page data, verify rendered HTML does not contain executable scripts.

**Property 4 Test:** Create pages with old system, migrate, compare rendered output byte-by-byte.

**Property 5 Test:** Generate invalid block structures, attempt to save, verify Strapi rejects them.

**Property 6 Test:** For each template type, generate random valid data, create page, verify all features work.

**Property 7 Test:** Generate invalid/corrupted blocks, attempt to render, verify fallback is shown.

**Property 8 Test:** Generate random page data, create with both old and new systems, compare rendered HTML.

**Property 9 Test:** Create set of pages with old system, run migration, verify all convert successfully.

**Property 10 Test:** Migrate pages, run rollback, verify original HTML is restored exactly.

**Property 11 Test:** Generate random old-format API requests, send to new system, verify same results.

**Property 12 Test:** Create page, modify blocks, save, reload, verify changes persisted.

### Integration Testing

**End-to-End Page Creation:**
1. User fills out template form
2. System generates blocks
3. Blocks saved to Strapi
4. Page rendered and displayed
5. Verify all features work (products, contact forms, etc.)

**Migration Integration:**
1. Create test pages with old system
2. Run migration script
3. Verify all pages accessible
4. Test all interactive features
5. Compare visual output

**API Integration:**
- Test all page creation endpoints
- Test page update endpoints
- Test page retrieval endpoints
- Verify error responses
- Test rate limiting and validation

### Visual Regression Testing

**Tool:** Playwright with screenshot comparison

**Tests:**
- Capture screenshots of pages before migration
- Capture screenshots after migration
- Compare pixel-by-pixel
- Flag differences for review
- Test responsive layouts (mobile, tablet, desktop)

### Security Testing

**XSS Prevention:**
- Test common XSS vectors
- Test encoded XSS attempts
- Test DOM-based XSS
- Test stored XSS
- Verify Content Security Policy headers

**Input Validation:**
- Test SQL injection attempts (should be blocked by Strapi)
- Test NoSQL injection
- Test path traversal
- Test file upload exploits

### Performance Testing

**Rendering Performance:**
- Measure time to render blocks vs old HTML
- Test with large pages (100+ blocks)
- Test concurrent rendering
- Verify no memory leaks

**Migration Performance:**
- Test migration of 1000+ pages
- Measure time per page
- Test memory usage
- Verify no data corruption

## Implementation Notes

### Phase 1: Core Infrastructure
1. Implement Content Structurer
2. Implement Block Renderer
3. Update Strapi schema
4. Write unit tests

### Phase 2: Integration
1. Update page creation API
2. Update page rendering
3. Test all template types
4. Write integration tests

### Phase 3: Migration
1. Implement migration script
2. Implement rollback mechanism
3. Test on staging data
4. Write migration tests

### Phase 4: Deployment
1. Backup production database
2. Run migration on production
3. Verify all pages
4. Monitor for issues
5. Keep rollback ready

### Rollback Plan

If issues are discovered after deployment:
1. Stop accepting new page creations
2. Run rollback script to restore HTML content
3. Revert code to previous version
4. Investigate issues
5. Fix and re-deploy

### Monitoring

**Metrics to Track:**
- Page creation success rate
- Rendering errors
- Migration success rate
- Page load times
- User-reported issues

**Alerts:**
- Spike in rendering errors
- Migration failures
- Strapi validation failures
- Slow page rendering (>2s)

## Security Considerations

### Content Security Policy

Update CSP headers to prevent inline scripts:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; font-src 'self' https:;
```

### Input Sanitization

All user input must be sanitized at multiple layers:
1. Client-side validation (UX)
2. API validation (security)
3. Block structuring (data integrity)
4. Strapi validation (database integrity)
5. Rendering escaping (XSS prevention)

### Audit Logging

Log all content modifications:
- Who created/modified content
- When it was modified
- What was changed
- IP address of requester

## Backward Compatibility

### API Compatibility

Old API endpoints must continue to work:
- `/api/create-page-with-template` - Convert to blocks internally
- `/api/save-page-to-strapi` - Convert HTML to blocks
- `/api/generate-html` - Return rendered HTML from blocks

### Data Compatibility

During transition period:
- Support both HTML and block formats
- Detect format on page load
- Migrate on-demand if HTML format detected
- Eventually deprecate HTML format

### URL Compatibility

All existing page URLs must continue to work:
- Slugs remain unchanged
- Redirects not needed
- SEO not affected
