# Design Document

## Overview

This design document outlines the architecture and implementation strategy for migrating a legacy Express.js page builder platform to a modern SvelteKit 5 + Strapi 5 stack. The migration follows a clean, database-first approach where all data is stored in Strapi's database, eliminating file-based storage patterns from the legacy system.

### Key Design Principles

1. **Database-First Architecture**: All data (pages, users, purchases, leads, analytics) stored exclusively in Strapi
2. **Separation of Concerns**: SvelteKit handles UI and API routing, Strapi manages data persistence
3. **Modern Reactive UI**: Svelte 5 Runes for state management
4. **API Compatibility**: Maintain request/response formats for existing integrations
5. **Scalability**: Database-backed system can scale horizontally
6. **Clean Break from Legacy**: The new system has ZERO runtime dependency on legacy files (output/, database.json). Legacy files are preserved only for backup/reference purposes. The migration script is a one-time import operation.

### Technology Stack

- **Frontend/API Layer**: SvelteKit 5 with TypeScript
- **Backend/CMS**: Strapi 5 (headless CMS)
- **Database**: PostgreSQL (via Strapi)
- **State Management**: Svelte 5 Runes ($state, $derived, $effect)
- **Image Storage**: Strapi Media Library
- **Styling**: TailwindCSS (preserved from legacy)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         SvelteKit Frontend (Svelte 5 Runes)          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SvelteKit Server                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes (+server.js)                  │  │
│  │  • /api/create-page    • /api/pages                  │  │
│  │  • /api/purchase       • /api/leads                  │  │
│  │  • /api/marketplace    • /api/user                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Server-Side Modules (src/lib/server)        │  │
│  │  • strapi.js          • htmlGenerator.js             │  │
│  │  • dataExtractor.js   • pageProcessor.js             │  │
│  │  • imageUpload.js                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Strapi SDK
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Strapi 5 Backend                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Content Types                        │  │
│  │  • User           • Page          • Purchase         │  │
│  │  • Lead           • Analytics                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Media Library (Images)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Page Creation Flow**:
   - User interacts with Page Creator UI (Svelte component)
   - Component calls `/api/create-page` endpoint
   - API route processes HTML, extracts metadata, injects scripts
   - API route saves complete page record to Strapi
   - Strapi persists to PostgreSQL

2. **Page Viewing Flow**:
   - Visitor navigates to `/pages/:slug`
   - SvelteKit page component loads data via `+page.server.js`
   - Server queries Strapi for page by slug
   - HTML content rendered dynamically with proper headers
   - Images served from Strapi media library

3. **Purchase Flow**:
   - Customer adds products to cart (localStorage)
   - Customer completes checkout form
   - Frontend calls `/api/purchase` endpoint
   - API route creates Purchase record in Strapi
   - API route updates Analytics record
   - Confirmation returned to customer

## Components and Interfaces

### Strapi Content Types

#### User Content Type
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  wallet: number;
  avatar: string;
  createdAt: Date;
  lastActive: Date;
  // Relations
  pages: Page[];
  purchases: Purchase[];
  leads: Lead[];
}
```

#### Page Content Type
```typescript
interface Page {
  id: string;
  title: string;
  slug: string;  // URL-friendly identifier
  htmlContent: string;  // Full HTML markup
  pageType: 'store' | 'event' | 'serviceProvider' | 'messageInBottle' | 
            'course' | 'workshop' | 'restaurantMenu' | 'generic';
  description: string;
  isActive: boolean;
  // Contact Info
  phone: string;
  email: string;
  city: string;
  address: string;
  // Extracted Data
  products: Product[];  // JSON field
  metadata: Record<string, any>;  // JSON field
  createdAt: Date;
  updatedAt: Date;
  // Relations
  user: User;
  purchases: Purchase[];
  leads: Lead[];
  analytics: Analytics;
}

interface Product {
  name: string;
  price: number;
  image: string;
  description?: string;
}
```

#### Purchase Content Type
```typescript
interface Purchase {
  id: string;
  products: Product[];  // JSON field
  total: number;
  paymentMethod: string;
  // Customer Info
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  shipping: boolean;
  // Status Tracking
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusText: string;
  createdAt: Date;
  updatedAt: Date;
  pickedAt?: Date;
  deliveredAt?: Date;
  // Driver Info (for delivery tracking)
  driverId?: string;
  driverName?: string;
  // Relations
  user: User;
  page: Page;
}
```

#### Lead Content Type
```typescript
interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  // Appointment fields (for serviceProvider pages)
  appointmentDate?: Date;
  appointmentStatus?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  // Relations
  user: User;
  page: Page;
}
```

#### Analytics Content Type
```typescript
interface Analytics {
  id: string;
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalLeads: number;
  dailySales: Record<string, number>;  // JSON: { "2025-11-28": 1500 }
  monthlySales: Record<string, number>;  // JSON: { "2025-11": 45000 }
  topProducts: TopProduct[];  // JSON array
  recentPurchases: Purchase[];  // JSON array (denormalized for quick access)
  createdAt: Date;
  updatedAt: Date;
  // Relations
  page: Page;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}
```

### SvelteKit Server Modules

#### strapi.js - Strapi SDK Client
```typescript
// src/lib/server/strapi.js
import { Strapi } from '@strapi/strapi-sdk';

const strapi = new Strapi({
  url: process.env.STRAPI_URL || 'http://localhost:1337',
  apiToken: process.env.STRAPI_API_TOKEN
});

// User operations
export async function createUser(userData) { ... }
export async function getUserById(id) { ... }
export async function updateUser(id, data) { ... }

// Page operations
export async function createPage(pageData) { ... }
export async function getPageBySlug(slug) { ... }
export async function getPagesByUser(userId) { ... }
export async function updatePage(id, data) { ... }
export async function deletePage(id) { ... }
export async function getActivePages() { ... }

// Purchase operations
export async function createPurchase(purchaseData) { ... }
export async function getPurchasesByPage(pageId) { ... }
export async function updatePurchaseStatus(id, status) { ... }

// Lead operations
export async function createLead(leadData) { ... }
export async function getLeadsByPage(pageId) { ... }

// Analytics operations
export async function getAnalytics(pageId) { ... }
export async function updateAnalytics(pageId, data) { ... }
```

#### htmlGenerator.js - HTML Generation
```typescript
// src/lib/server/htmlGenerator.js

/**
 * Generate complete HTML page from template and data
 */
export function generatePageHtml(pageData, userId) {
  // Template-based HTML generation
  // Returns complete HTML string with DOCTYPE
}

/**
 * Generate slug from title and userId
 */
export function generateSlug(title, userId) {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const userPrefix = userId.substring(0, 8);
  return `${userPrefix}-${cleanTitle}`;
}
```

#### dataExtractor.js - Metadata Extraction
```typescript
// src/lib/server/dataExtractor.js

/**
 * Extract contact information from HTML
 */
export function extractContactInfo(html) {
  return {
    phone: extractPhone(html),
    email: extractEmail(html),
    city: extractCity(html),
    address: extractAddress(html)
  };
}

/**
 * Extract products from HTML
 */
export function extractProducts(html) {
  // Parse HTML and find product cards
  // Return array of { name, price, image, description }
}

/**
 * Extract page description from meta tags
 */
export function extractDescription(html) {
  // Look for meta description or og:description
}

/**
 * Detect page type from HTML content
 */
export function detectPageType(html, selectedType) {
  // Priority: selectedType > keyword analysis
  // Returns: store | event | serviceProvider | etc.
}
```

#### pageProcessor.js - HTML Processing
```typescript
// src/lib/server/pageProcessor.js

/**
 * Inject necessary scripts into HTML based on page type
 */
export function injectScripts(html, pageType) {
  // Inject store-checkout.js for store/course/restaurant pages
  // Inject data extractor for all pages
  // Inject page-type meta tag
}

/**
 * Fix WhatsApp integration code
 */
export function fixWhatsAppCode(html, pageType) {
  // Fix WhatsApp links and buttons for event pages
}

/**
 * Clean HTML content
 */
export function cleanHtml(html) {
  // Ensure DOCTYPE present
  // Remove duplicate closing tags
  // Remove content after </html>
}

/**
 * Process complete page before saving
 */
export function processPage(html, pageType) {
  let processed = cleanHtml(html);
  processed = injectScripts(processed, pageType);
  processed = fixWhatsAppCode(processed, pageType);
  return processed;
}
```

#### imageUpload.js - Image Handling
```typescript
// src/lib/server/imageUpload.js

/**
 * Upload image to Strapi media library
 */
export async function uploadImage(file, userId, pageName) {
  // Upload to Strapi media library
  // Return media URL
}

/**
 * Delete image from Strapi media library
 */
export async function deleteImage(imageId) {
  // Remove from Strapi
}
```

### SvelteKit API Routes

Key API endpoints to implement:

1. **POST /api/create-page** - Create new page
2. **GET /api/pages/[userId]** - Get user's pages
3. **PUT /api/update-page** - Update existing page
4. **DELETE /api/delete-page** - Delete page
5. **GET /api/pages/all/marketplace** - Get marketplace pages
6. **POST /api/purchase** - Create purchase
7. **GET /api/purchases/[pageId]** - Get page purchases
8. **POST /api/lead** - Submit lead
9. **GET /api/leads/[pageId]** - Get page leads
10. **GET /api/user/[userId]** - Get user data
11. **POST /api/user/[userId]** - Update user data
12. **POST /api/upload-image** - Upload image

### SvelteKit Pages (Routes)

Key pages to implement:

1. **/** - Home/landing page
2. **/marketplace** - Browse active pages
3. **/page-creator** - Visual page builder
4. **/pages/[slug]** - View user-created page
5. **/view/[slug]** - Clean page view (no editor)
6. **/management-hub** - User dashboard
7. **/admin** - Admin panel
8. **/store-admin** - Store management
9. **/leads-admin** - Leads management
10. **/appointments-admin** - Appointment management

## Data Models

### Strapi Schema Definitions

The Strapi content types will be defined using Strapi's schema.json format:

**User Schema** (`api/user/content-types/user/schema.json`):
- Extends default Strapi user with custom fields
- Relations: pages (hasMany), purchases (hasMany), leads (hasMany)

**Page Schema** (`api/page/content-types/page/schema.json`):
- Core fields: title, slug (unique), htmlContent (richtext)
- Metadata fields: pageType (enum), description, isActive (boolean)
- Contact fields: phone, email, city, address
- JSON fields: products, metadata
- Relations: user (belongsTo), purchases (hasMany), leads (hasMany), analytics (hasOne)

**Purchase Schema** (`api/purchase/content-types/purchase/schema.json`):
- Order fields: products (JSON), total, paymentMethod
- Customer fields: customerName, customerPhone, customerEmail, customerAddress
- Status fields: status (enum), statusText, timestamps
- Relations: user (belongsTo), page (belongsTo)

**Lead Schema** (`api/lead/content-types/lead/schema.json`):
- Contact fields: name, phone, email, message
- Appointment fields: appointmentDate, appointmentStatus (enum)
- Relations: user (belongsTo), page (belongsTo)

**Analytics Schema** (`api/analytics/content-types/analytics/schema.json`):
- Counter fields: totalSales, totalOrders, totalCustomers, totalLeads
- JSON fields: dailySales, monthlySales, topProducts, recentPurchases
- Relations: page (belongsTo)

### Database Indexes

For optimal query performance:
- Page.slug (unique index)
- Page.userId + Page.isActive (composite index for marketplace queries)
- Purchase.pageId + Purchase.createdAt (for purchase history)
- Lead.pageId + Lead.createdAt (for lead history)
- Analytics.pageId (unique index)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Endpoint Compatibility

*For any* legacy API endpoint, the new SvelteKit endpoint SHALL accept the same request format and return the same response structure, ensuring backward compatibility.

**Validates: Requirements 3.5**

### Property 2: URL Structure Preservation

*For any* legacy URL pattern, the new system SHALL either serve the same content or redirect to the equivalent new URL, ensuring existing links continue to work.

**Validates: Requirements 5.5**

### Property 3: Page Creation Persistence

*For any* valid HTML content and user, saving a page SHALL result in a complete page record in Strapi with extracted metadata (contact info, products, description).

**Validates: Requirements 6.3**

### Property 4: Page Type Detection and Script Injection

*For any* HTML content, the system SHALL correctly detect the page type and inject the appropriate scripts (store-checkout.js for stores/courses/restaurants, data extractor for all pages, WhatsApp fixes for events).

**Validates: Requirements 6.4, 14.1, 14.2, 14.3, 14.5**

### Property 5: Image Upload Persistence

*For any* valid image file, uploading SHALL result in the image being stored in Strapi media library and a valid URL being returned.

**Validates: Requirements 6.5**

### Property 6: User Page Query Completeness

*For any* userId, querying for pages SHALL return exactly the set of pages that belong to that user and no others.

**Validates: Requirements 7.1**

### Property 7: Page Update Consistency

*For any* existing page and any new HTML content, updating SHALL result in the page record being updated with the new content and freshly extracted metadata.

**Validates: Requirements 7.3**

### Property 8: Cascade Delete Integrity

*For any* page, deleting SHALL result in the page record and all associated records (purchases, leads, analytics) being removed from Strapi, maintaining referential integrity.

**Validates: Requirements 7.4, 7.5**

### Property 9: Marketplace Active Pages Filter

*For any* marketplace query, the results SHALL include only pages where isActive is true.

**Validates: Requirements 8.1**

### Property 10: Marketplace Search Filtering

*For any* search query string, marketplace results SHALL include only pages where the query matches the title, description, or pageType fields.

**Validates: Requirements 8.3**

### Property 11: Marketplace Type Filtering

*For any* pageType filter value, marketplace results SHALL include only pages of that specific type.

**Validates: Requirements 8.4**

### Property 12: Cart State Persistence

*For any* product and store page, adding the product to cart SHALL result in the cart state in localStorage being updated to include that product.

**Validates: Requirements 9.1**

### Property 13: Purchase Creation Completeness

*For any* valid checkout data (products, customer info, payment method), completing checkout SHALL create a Purchase record in Strapi containing all provided details.

**Validates: Requirements 9.2**

### Property 14: Purchase Analytics Update

*For any* purchase creation, the associated page's analytics SHALL be updated with incremented totalSales, totalOrders, and appropriate dailySales/monthlySales counters.

**Validates: Requirements 9.3**

### Property 15: Purchase Query Completeness

*For any* pageId, querying purchases SHALL return exactly the set of purchases associated with that page.

**Validates: Requirements 9.4**

### Property 16: Purchase Status Update Tracking

*For any* purchase and any valid status value, updating the status SHALL change the purchase's status field and update the appropriate timestamp (pickedAt, deliveredAt).

**Validates: Requirements 9.5**

### Property 17: Lead Creation Completeness

*For any* valid lead form data (name, phone/email, message), submitting SHALL create a Lead record in Strapi containing all provided details.

**Validates: Requirements 10.1**

### Property 18: Lead Analytics Update

*For any* lead submission, the associated page's analytics SHALL have its totalLeads counter incremented by 1.

**Validates: Requirements 10.2**

### Property 19: Lead Query Completeness

*For any* pageId, querying leads SHALL return exactly the set of leads associated with that page.

**Validates: Requirements 10.3**

### Property 20: Lead Form Universal Support

*For any* page type (store, event, serviceProvider, messageInBottle, etc.), lead submission SHALL successfully create a Lead record.

**Validates: Requirements 10.4**

### Property 21: Lead Validation

*For any* lead submission missing required fields (name, and either phone or email), the system SHALL reject the submission. *For any* submission with all required fields, the system SHALL accept it.

**Validates: Requirements 10.5**

### Property 22: Migration User Completeness

*For any* user in the legacy database.json, running the migration script SHALL result in that user existing in Strapi with all fields preserved.

**Validates: Requirements 11.1**

### Property 23: Migration Page Completeness

*For any* HTML file in the legacy output directory, running the migration script SHALL result in a page record in Strapi with the HTML content and extracted metadata.

**Validates: Requirements 11.2**

### Property 24: Migration Purchase Completeness

*For any* purchase in legacy page data directories, running the migration script SHALL result in a Purchase record in Strapi with proper user and page relations.

**Validates: Requirements 11.3**

### Property 25: Migration Lead Completeness

*For any* lead in legacy page data directories, running the migration script SHALL result in a Lead record in Strapi with proper user and page relations.

**Validates: Requirements 11.4**

### Property 26: Migration Data Integrity

*After* migration completes, the count of users, pages, purchases, and leads in Strapi SHALL equal the counts in the legacy system.

**Validates: Requirements 11.5**

### Property 27: Page Serving by Slug

*For any* valid page slug, requesting /pages/:slug SHALL query Strapi and return the HTML content of that page.

**Validates: Requirements 12.1**

### Property 28: DOCTYPE Presence

*For any* HTML content served, the response SHALL include a DOCTYPE declaration at the beginning.

**Validates: Requirements 12.2**

### Property 29: HTML Cleaning

*For any* HTML content with duplicate closing tags or text after </html>, serving SHALL clean the content by removing duplicates and trailing text.

**Validates: Requirements 12.3**

### Property 30: Image URL Correctness

*For any* image in a served page, the image URL SHALL point to the Strapi media library.

**Validates: Requirements 12.4**

### Property 31: Clean Page View

*For any* page slug, requesting /view/:slug SHALL return the HTML content without any editor tools or scripts.

**Validates: Requirements 12.5**

### Property 32: Contact Info Extraction

*For any* HTML content containing contact information (phone, email, city, address), saving the page SHALL extract and store this information in the page's metadata fields.

**Validates: Requirements 13.1**

### Property 33: Product Extraction

*For any* HTML content containing product cards with name, price, and image, saving the page SHALL extract and store these products in the page's products field.

**Validates: Requirements 13.2**

### Property 34: Description Extraction

*For any* HTML content with a meta description tag, saving the page SHALL extract and store the description in the page's description field.

**Validates: Requirements 13.3**

### Property 35: Template Store Script Exclusion

*For any* template-based store page (identified by skip-store-injection meta tag or cart-float-btn element), saving SHALL NOT inject duplicate store-checkout.js scripts.

**Validates: Requirements 14.4**

### Property 36: Appointment Lead Creation

*For any* appointment booking on a serviceProvider page, the system SHALL create a Lead record with appointmentDate and appointmentStatus fields populated.

**Validates: Requirements 15.2**

### Property 37: Appointment Status Update

*For any* appointment (Lead with appointmentDate) and any valid appointment status, updating SHALL change the Lead's appointmentStatus field.

**Validates: Requirements 15.5**

### Property 38: Legacy URL Redirect

*For any* legacy URL pattern /pages/:userId/:fileName, requesting SHALL redirect to the equivalent slug-based URL /pages/:slug.

**Validates: Requirements 16.1**

### Property 39: Slug Generation Consistency

*For any* page title and userId, the generated slug SHALL be derived from the title (lowercased, special chars replaced with hyphens) prefixed with the first 8 characters of userId.

**Validates: Requirements 16.3**

## Error Handling

### API Error Responses

All API endpoints will follow a consistent error response format:

```typescript
{
  error: string;  // Human-readable error message
  code?: string;  // Machine-readable error code
  details?: any;  // Additional error context
}
```

### Error Categories

1. **Validation Errors (400)**
   - Missing required fields
   - Invalid data formats
   - Invalid enum values

2. **Authentication Errors (401)**
   - Missing or invalid API token
   - Expired session

3. **Authorization Errors (403)**
   - User attempting to access/modify another user's resources

4. **Not Found Errors (404)**
   - Page slug not found
   - User not found
   - Resource not found

5. **Conflict Errors (409)**
   - Duplicate slug
   - Concurrent modification

6. **Server Errors (500)**
   - Database connection failures
   - Strapi API errors
   - Unexpected exceptions

### Error Handling Strategies

1. **Graceful Degradation**: If Strapi is unavailable, return cached data or friendly error messages
2. **Retry Logic**: Implement exponential backoff for transient Strapi API failures
3. **Transaction Rollback**: For operations involving multiple Strapi records (e.g., page creation with analytics), use transactions or implement compensating actions
4. **Logging**: Log all errors with context (userId, pageId, operation) for debugging
5. **User Feedback**: Provide clear, actionable error messages to users

### Specific Error Scenarios

**Page Creation Failures**:
- If metadata extraction fails, save page with empty metadata and log warning
- If script injection fails, save page without scripts and log error
- If Strapi save fails, return error to user and don't create partial records

**Migration Failures**:
- If a single record fails to migrate, log error and continue with remaining records
- Provide detailed migration report showing successes and failures
- Support re-running migration for failed records only

**Image Upload Failures**:
- If Strapi media library upload fails, return error to user
- Don't save page references to failed image uploads
- Support retry mechanism for failed uploads

## Testing Strategy

### Unit Testing

Unit tests will verify individual functions and modules work correctly in isolation:

**Modules to Unit Test**:
1. `htmlGenerator.js` - Test HTML generation and slug generation
2. `dataExtractor.js` - Test extraction of contact info, products, descriptions
3. `pageProcessor.js` - Test script injection, HTML cleaning, WhatsApp fixes
4. `strapi.js` - Test Strapi SDK wrapper functions (with mocked Strapi)

**Example Unit Tests**:
- `generateSlug()` produces correct slug format
- `extractContactInfo()` finds phone numbers in various formats
- `extractProducts()` finds products with different HTML structures
- `cleanHtml()` removes duplicate closing tags
- `injectScripts()` adds scripts in correct locations

### Property-Based Testing

Property-based tests will verify the correctness properties defined above hold across many randomly generated inputs. We will use **fast-check** (JavaScript property-based testing library) for implementation.

**Property Test Configuration**:
- Minimum 100 iterations per property test
- Use custom generators for domain-specific data (HTML, page types, user IDs)
- Tag each test with the property number and requirement it validates

**Key Property Tests**:

1. **Property 3: Page Creation Persistence**
   - Generate random HTML content with contact info and products
   - Save page via API
   - Query Strapi to verify page exists with extracted metadata
   - **Feature: express-to-sveltekit-migration, Property 3: Page Creation Persistence**

2. **Property 4: Page Type Detection and Script Injection**
   - Generate HTML for each page type (store, event, serviceProvider, etc.)
   - Save page via API
   - Verify correct scripts are injected in HTML
   - **Feature: express-to-sveltekit-migration, Property 4: Page Type Detection and Script Injection**

3. **Property 8: Cascade Delete Integrity**
   - Create page with associated purchases, leads, analytics
   - Delete page via API
   - Verify all related records are deleted from Strapi
   - **Feature: express-to-sveltekit-migration, Property 8: Cascade Delete Integrity**

4. **Property 10: Marketplace Search Filtering**
   - Generate random pages with various titles, descriptions, pageTypes
   - Generate random search query
   - Verify all results match the query
   - **Feature: express-to-sveltekit-migration, Property 10: Marketplace Search Filtering**

5. **Property 13: Purchase Creation Completeness**
   - Generate random purchase data (products, customer info)
   - Submit purchase via API
   - Verify Purchase record in Strapi contains all data
   - **Feature: express-to-sveltekit-migration, Property 13: Purchase Creation Completeness**

6. **Property 21: Lead Validation**
   - Generate random lead data (some valid, some missing required fields)
   - Submit leads via API
   - Verify invalid leads are rejected, valid leads are accepted
   - **Feature: express-to-sveltekit-migration, Property 21: Lead Validation**

7. **Property 26: Migration Data Integrity**
   - Create legacy data (users, pages, purchases, leads)
   - Run migration script
   - Count records in Strapi
   - Verify counts match legacy system
   - **Feature: express-to-sveltekit-migration, Property 26: Migration Data Integrity**

8. **Property 29: HTML Cleaning**
   - Generate HTML with various issues (duplicate tags, trailing text)
   - Serve page via API
   - Verify served HTML is cleaned
   - **Feature: express-to-sveltekit-migration, Property 29: HTML Cleaning**

9. **Property 32: Contact Info Extraction**
   - Generate HTML with contact info in various formats
   - Save page via API
   - Verify contact info is extracted correctly
   - **Feature: express-to-sveltekit-migration, Property 32: Contact Info Extraction**

10. **Property 39: Slug Generation Consistency**
    - Generate random page titles and userIds
    - Generate slugs
    - Verify slug format is correct (userId prefix + cleaned title)
    - **Feature: express-to-sveltekit-migration, Property 39: Slug Generation Consistency**

### Integration Testing

Integration tests will verify the system works correctly end-to-end:

**Test Scenarios**:
1. Complete page creation flow (UI → API → Strapi → Database)
2. Complete purchase flow (cart → checkout → API → Strapi → analytics update)
3. Complete lead submission flow (form → API → Strapi → analytics update)
4. Marketplace browsing and filtering
5. Page management (create, update, delete)
6. Migration script execution

### Testing Tools

- **Unit Tests**: Vitest
- **Property-Based Tests**: fast-check
- **Integration Tests**: Playwright (for E2E UI testing)
- **API Tests**: Supertest or Vitest with fetch mocks

### Test Data Generators

For property-based testing, we'll create custom generators:

```typescript
// Example generators for fast-check
const userIdGenerator = fc.uuid();
const pageTitleGenerator = fc.string({ minLength: 5, maxLength: 100 });
const pageTypeGenerator = fc.constantFrom(
  'store', 'event', 'serviceProvider', 'messageInBottle', 
  'course', 'workshop', 'restaurantMenu', 'generic'
);
const htmlContentGenerator = fc.string({ minLength: 100, maxLength: 10000 });
const productGenerator = fc.record({
  name: fc.string({ minLength: 3, maxLength: 50 }),
  price: fc.integer({ min: 1, max: 10000 }),
  image: fc.webUrl()
});
const contactInfoGenerator = fc.record({
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  email: fc.emailAddress(),
  city: fc.string({ minLength: 3, maxLength: 50 }),
  address: fc.string({ minLength: 10, maxLength: 100 })
});
```

## Implementation Phases

### Phase 1: Foundation Setup (Week 1)

**Goals**: Initialize projects and set up development environment

**Tasks**:
1. Run SvelteKit initialization commands
2. Run Strapi initialization commands
3. Configure PostgreSQL database for Strapi
4. Set up environment variables and configuration
5. Create basic project structure (src/lib/server/ directories)
6. Install all dependencies
7. Set up testing framework (Vitest, fast-check)

**Deliverables**:
- Working SvelteKit dev server
- Working Strapi admin panel
- Connected PostgreSQL database
- Basic project structure

### Phase 2: Strapi Schema Definition (Week 1-2)

**Goals**: Define all content types in Strapi

**Tasks**:
1. Create User content type with all fields
2. Create Page content type with all fields
3. Create Purchase content type with all fields
4. Create Lead content type with all fields
5. Create Analytics content type with all fields
6. Configure relationships between content types
7. Set up permissions and API access
8. Test CRUD operations via Strapi admin panel

**Deliverables**:
- Complete Strapi schema
- Working Strapi API endpoints
- Documented API structure

### Phase 3: Server-Side Modules (Week 2)

**Goals**: Implement reusable server-side logic

**Tasks**:
1. Implement strapi.js module with SDK wrapper functions
2. Implement htmlGenerator.js module
3. Implement dataExtractor.js module
4. Implement pageProcessor.js module
5. Implement imageUpload.js module
6. Write unit tests for all modules
7. Write property tests for extraction and processing functions

**Deliverables**:
- Complete server-side modules
- Unit test coverage >80%
- Property tests for key functions

### Phase 4: API Routes Migration (Week 3)

**Goals**: Migrate all Express endpoints to SvelteKit

**Tasks**:
1. Implement page management endpoints (create, read, update, delete)
2. Implement user management endpoints
3. Implement purchase endpoints
4. Implement lead endpoints
5. Implement marketplace endpoints
6. Implement image upload endpoint
7. Write integration tests for all endpoints
8. Write property tests for API behavior

**Deliverables**:
- All API endpoints functional
- API compatibility with legacy system
- Integration test coverage

### Phase 5: Frontend Migration (Week 4)

**Goals**: Migrate UI pages to Svelte components

**Tasks**:
1. Migrate page creator to Svelte component
2. Migrate marketplace to Svelte component
3. Migrate management hub to Svelte component
4. Migrate admin panels to Svelte components
5. Implement page viewing routes
6. Implement URL redirects for legacy patterns
7. Write E2E tests for key user flows

**Deliverables**:
- All UI pages functional
- Svelte 5 Runes used throughout
- E2E test coverage for critical paths

### Phase 6: Data Migration Script (Week 5)

**Goals**: Create script to migrate legacy data to Strapi

**Tasks**:
1. Implement user migration logic
2. Implement page migration logic (read HTML files, extract metadata)
3. Implement purchase migration logic
4. Implement lead migration logic
5. Implement analytics migration logic
6. Add data integrity verification
7. Write property tests for migration completeness
8. Test migration with production data copy

**Deliverables**:
- Working migration script
- Migration verification report
- Property tests for migration integrity

### Phase 7: Testing and Refinement (Week 6)

**Goals**: Comprehensive testing and bug fixes

**Tasks**:
1. Run all property-based tests
2. Run all integration tests
3. Run all E2E tests
4. Fix any failing tests
5. Performance testing and optimization
6. Security audit
7. Documentation updates

**Deliverables**:
- All tests passing
- Performance benchmarks met
- Security vulnerabilities addressed
- Complete documentation

### Phase 8: Deployment and Cutover (Week 7)

**Goals**: Deploy new system and migrate production data

**Tasks**:
1. Set up production Strapi instance
2. Set up production SvelteKit instance
3. Run migration script on production data (one-time import from legacy files)
4. Verify data integrity in production
5. Update DNS/routing to point to new system
6. Monitor for errors and issues
7. Archive legacy files for backup only (no runtime dependency)

**Deliverables**:
- Production system live
- All data migrated successfully
- Monitoring and alerting in place
- Legacy files archived (backup only, not used by new system)

## Migration Strategy

### Pre-Migration Checklist

- [ ] Backup legacy database.json
- [ ] Backup entire output directory
- [ ] Test migration script on copy of production data
- [ ] Verify all property tests pass
- [ ] Document rollback procedure
- [ ] Set up production Strapi and SvelteKit instances
- [ ] Configure environment variables
- [ ] Test Strapi API connectivity

### Migration Execution Steps

1. **Freeze Legacy System**: Put legacy system in read-only mode
2. **Run Migration Script**: Execute one-time migration with logging (imports data from legacy files into Strapi)
3. **Verify Data Integrity**: Run verification checks
4. **Test New System**: Smoke test all critical functionality
5. **Update Routing**: Point traffic to new system
6. **Monitor**: Watch logs and metrics for issues
7. **Archive Legacy Files**: Move legacy files to backup location (not used by new system)

### Post-Migration Verification

- [ ] User count matches
- [ ] Page count matches
- [ ] Purchase count matches
- [ ] Lead count matches
- [ ] Sample pages render correctly
- [ ] Marketplace displays correctly
- [ ] Purchase flow works end-to-end
- [ ] Lead submission works end-to-end
- [ ] Image URLs resolve correctly
- [ ] All API endpoints respond correctly

### Rollback Plan

If critical issues are discovered:

1. **Immediate**: Revert DNS/routing to legacy system (temporary)
2. **Investigate**: Analyze logs and error reports
3. **Fix**: Address issues in new system
4. **Re-test**: Verify fixes with property tests
5. **Retry**: Attempt cutover again

**Note**: Legacy files are kept as backup only. The new system operates entirely from Strapi database with no runtime dependency on legacy files.

## Performance Considerations

### Database Optimization

- **Indexes**: Create indexes on frequently queried fields (slug, userId, isActive, pageType)
- **Query Optimization**: Use Strapi's populate and select features to fetch only needed data
- **Caching**: Implement Redis caching for marketplace queries and frequently accessed pages
- **Connection Pooling**: Configure PostgreSQL connection pooling for high concurrency

### API Performance

- **Response Compression**: Enable gzip compression for API responses
- **Pagination**: Implement cursor-based pagination for large result sets
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **CDN**: Use CDN for serving images from Strapi media library

### Frontend Performance

- **Code Splitting**: Use SvelteKit's automatic code splitting
- **Lazy Loading**: Lazy load images and heavy components
- **SSR**: Use server-side rendering for initial page loads
- **Prefetching**: Prefetch data for likely next pages

### Monitoring

- **Metrics**: Track API response times, database query times, error rates
- **Logging**: Centralized logging with structured logs
- **Alerts**: Set up alerts for error spikes, slow queries, high memory usage
- **APM**: Consider Application Performance Monitoring tool (e.g., Sentry, DataDog)

## Security Considerations

### Authentication & Authorization

- **API Tokens**: Use Strapi API tokens for SvelteKit → Strapi communication
- **User Sessions**: Implement secure session management for user authentication
- **RBAC**: Use Strapi's role-based access control for admin users
- **CORS**: Configure CORS properly to allow only trusted origins

### Data Protection

- **Input Validation**: Validate all user inputs before processing
- **SQL Injection**: Strapi ORM protects against SQL injection
- **XSS Protection**: Sanitize HTML content before rendering
- **CSRF Protection**: Implement CSRF tokens for state-changing operations

### Infrastructure Security

- **HTTPS**: Enforce HTTPS for all connections
- **Environment Variables**: Store secrets in environment variables, never in code
- **Database Access**: Restrict database access to application servers only
- **Regular Updates**: Keep dependencies updated to patch security vulnerabilities

## Maintenance and Operations

### Backup Strategy

- **Database Backups**: Daily automated PostgreSQL backups with 30-day retention
- **Media Backups**: Weekly backups of Strapi media library
- **Configuration Backups**: Version control for all configuration files

### Monitoring and Alerting

- **Uptime Monitoring**: Monitor SvelteKit and Strapi availability
- **Error Tracking**: Track and alert on application errors
- **Performance Monitoring**: Monitor response times and resource usage
- **Log Aggregation**: Centralize logs for easy searching and analysis

### Scaling Strategy

- **Horizontal Scaling**: SvelteKit can be scaled horizontally behind load balancer
- **Database Scaling**: PostgreSQL can be scaled with read replicas
- **Media Storage**: Strapi media library can use S3 for scalable storage
- **Caching Layer**: Add Redis for caching to reduce database load

### Documentation

- **API Documentation**: Maintain OpenAPI/Swagger docs for all endpoints
- **Architecture Diagrams**: Keep architecture diagrams up to date
- **Runbooks**: Document common operational procedures
- **Troubleshooting Guides**: Document solutions to common issues


## Polymorphic Management Interface Architecture (REVERSE-ENGINEERED FROM LEGACY)

### Overview

The management interface uses a polymorphic routing pattern where the UI adapts based on the `pageType` field. Each page type has distinct management needs that require specialized interfaces.

**CRITICAL**: These interfaces are **reverse-engineered from legacy HTML files** (`public/store-admin.html`, `public/appointments-admin.html`, etc.). The goal is **1:1 fidelity** - port the exact layout, styling, and functionality to Svelte components.

### Legacy Files Reference

- **Store/Restaurant**: `public/store-admin.html` (769 lines)
- **Appointments**: `public/appointments-admin.html` (full implementation with calendar)
- **Events**: `public/event-admin.html` (guest list and RSVP tracking)
- **Leads**: `public/leads-admin.html` (standard lead management)
- **Courses**: `public/course-management.html` (student purchases)
- **Messages**: `public/messages-management.html` (message in bottle)

### Management Interface Routing

```typescript
// Pseudo-code for routing logic
function getManagementComponent(pageType: string) {
  switch(pageType) {
    case 'store':
    case 'restaurantMenu':
      return InventoryOrderManager; // From store-admin.html
    case 'serviceProvider':
    case 'appointment':
      return AppointmentQueueManager; // From appointments-admin.html
    case 'event':
      return GuestListRSVPManager; // From event-admin.html
    case 'course':
      return StudentPurchaseManager; // From course-management.html
    case 'messageInBottle':
      return MessagesManager; // From messages-management.html
    case 'artist':
    case 'businessCard':
    case 'portfolio':
      return LeadsManager; // From leads-admin.html
    default:
      return LeadsManager;
  }
}
```

### 1. Inventory & Order Manager (LEGACY: store-admin.html)

**Used for**: `store`, `restaurantMenu` pages

**Exact Legacy Features to Port**:

1. **Header** (sticky, white background, shadow):
   - Title: "🛒 ניהול חנות"
   - Page name display
   - Buttons: Refresh (🔄), Print (🖨️), Export Excel (📊), Back to Store (←)

2. **Statistics Cards** (5 cards, gradient backgrounds):
   - Total Orders (purple gradient)
   - Pending Orders (amber gradient) 
   - Processing Orders (blue gradient)
   - Shipped Orders (purple gradient)
   - Delivered Orders (green gradient)

3. **Revenue Card** (emerald-to-teal gradient):
   - Large display of total revenue
   - Money icon (💰)

4. **Filter Tabs** (white card with rounded corners):
   - Tabs: All, Today, This Week, Pending, Processing, Shipped, Delivered
   - Date picker input
   - Search input (by name, phone, product, order number)

5. **Orders List** (order cards with left border color by status):
   - Each order card shows:
     - Customer name and order ID
     - Date and time (Hebrew day names)
     - Status dropdown (⏳ Pending, 🔄 Processing, 📦 Shipped, ✅ Delivered, ❌ Cancelled)
     - Customer info (phone, email, address)
     - Shipping type (🏠 Pickup or 🚚 Delivery)
     - Product list with mini cards (image, name, quantity, price)
     - Total amount (large, green)
     - Tracking number (if shipped)
     - Notes (if any)
     - Action buttons: WhatsApp (💬), Add Tracking (📦), Print (🖨️)

6. **Empty State**:
   - Shopping cart icon (🛒)
   - "No orders to display" message

**Exact Styling from Legacy**:
```css
.order-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}
.order-card.pending { border-left-color: #f59e0b; background-color: #fffbeb; }
.order-card.processing { border-left-color: #3b82f6; background-color: #eff6ff; }
.order-card.shipped { border-left-color: #8b5cf6; background-color: #f5f3ff; }
.order-card.delivered { border-left-color: #10b981; background-color: #f0fdf4; }
.order-card.cancelled { border-left-color: #ef4444; background-color: #fef2f2; }
.order-card:hover { transform: translateX(-5px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
```

**Exact Functions to Port**:
- `loadOrders()` - Fetch from `/api/orders/${userId}/${pageId}`
- `updateStatistics()` - Calculate totals by status
- `filterOrders(filter)` - Filter by status/date
- `searchOrders()` - Search by text
- `updateStatus(orderId, newStatus)` - PUT to `/api/orders/${orderId}/status`
- `promptTrackingNumber(orderId)` - Add tracking number
- `printOrder(orderId)` - Print single order
- `exportOrders()` - Export to CSV
- `contactCustomer(phone)` - Open WhatsApp

### 2. Appointment/Queue Manager (LEGACY: appointments-admin.html)

**Used for**: `serviceProvider`, `appointment` pages

**Exact Legacy Features to Port**:

1. **Header** (same as store-admin):
   - Title: "📅 ניהול תורים"
   - Buttons: Refresh, Print, Back

2. **Statistics Cards** (4 cards):
   - Total Appointments
   - Confirmed Appointments (green)
   - Pending Appointments (amber) - **WITH PULSE ANIMATION**
   - Cancelled Appointments (red)

3. **Navigation Tabs** (4 views):
   - 📋 Appointments List
   - 📅 Calendar View
   - 💬 Customer Club
   - 💇 Services Management

4. **Appointments List View**:
   - Filter buttons: All, Today, Tomorrow, This Week, Pending, Confirmed
   - Date picker and search input
   - Appointment cards with **SPECIAL PENDING STYLING**:
     - Pending cards have: yellow gradient background, pulsing animation, "⚠️ Awaiting Confirmation" badge
     - Confirmed cards: green border, light green background
     - Cancelled cards: red border, light red background
   - Each card shows: customer name, phone, email, date/time, service, status, notes
   - Action buttons: Confirm, Cancel, Call, WhatsApp

5. **Calendar View**:
   - Date navigation (← Previous Day | Date | Next Day →)
   - Settings button (⚙️ Day Settings)
   - Time slot grid (140px cards):
     - Free slots: green background
     - Pending slots: **YELLOW GRADIENT WITH PULSE ANIMATION** + "⚠️ Awaiting Confirmation" badge
     - Confirmed slots: blue background
     - Cancelled slots: red background
     - Break slots: purple background

6. **Customer Club View**:
   - Bulk message form with templates (🎉 Holiday, 🎁 Promotion, 📢 Update, ⏰ Reminder)
   - Buttons: Send to Selected (📤), Send to All (📢), **Auto-Send with "Next" button (⚡)**
   - Customer list with checkboxes
   - Select All / Deselect All buttons
   - Search customers

7. **Services Management View**:
   - Add New Service button (➕)
   - Service cards with: Name, Duration (minutes), Price (₪)
   - Delete button for each service (🗑️)
   - Save Changes button (💾)

**Exact Styling for Pending Appointments**:
```css
.appointment-card.pending {
  border-left: 5px solid #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);
  animation: pulse-card 2s ease-in-out infinite;
}
@keyframes pulse-card {
  0%, 100% { box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2); }
  50% { box-shadow: 0 6px 12px rgba(245, 158, 11, 0.4); }
}
.appointment-card.pending::after {
  content: '⚠️ ממתין לאישור';
  position: absolute;
  top: 10px;
  left: 10px;
  background: #f59e0b;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}
```

**Exact Functions to Port**:
- `loadAppointments()` - Fetch from `/api/appointments/${userId}/${pageId}`
- `filterAppointments(filter)` - Filter by status/date
- `renderCalendarView()` - Render time slot grid
- `loadServices()` - Load from metadata.json
- `saveServices()` - Save to metadata.json
- `sendBulkMessage(toAll)` - Send WhatsApp messages
- `sendBulkAuto()` - Auto-send with "Next" button flow

### 3. Guest List/RSVP Manager (LEGACY: event-admin.html)

**Used for**: `event` pages

**Exact Legacy Features to Port**:

1. **Header**:
   - Title: "🎉 ניהול אירוע"
   - Event name display
   - Home button (🏠)

2. **Statistics Cards** (4 cards):
   - Total Guests
   - Confirmed (✓ green)
   - Pending (⏳ orange)
   - Declined (✗ red)

3. **Guests Section**:
   - Search input (🔍)
   - Status filter dropdown (All, Confirmed, Pending, Declined)
   - Guest cards with colored right border:
     - Name, phone, date/time
     - Status badge (✓ Coming / ✗ Not Coming / ⏳ Pending)
     - Number of guests (👨‍👩‍👧‍👦)
     - Message (if provided)

4. **Gifts Section**:
   - Total gifts amount (large, pink)
   - Gift cards showing: donor name, phone, amount, products

**Exact Functions to Port**:
- `loadEventData()` - Fetch from `/api/event/${eventId}/rsvps`
- `renderGuests(guests)` - Display guest cards
- `renderGifts(gifts)` - Display gift cards
- `filterGuests()` - Filter by search/status

### 4. Leads Manager (LEGACY: leads-admin.html)

**Used for**: `landing`, `general`, `artist`, `businessCard`, `portfolio` pages

**Exact Legacy Features to Port**:

1. **Header**:
   - Title: "📋 ניהול לידים"
   - Export Excel button (📥)
   - Home button (🏠)

2. **Statistics Cards** (4 cards):
   - Total Leads
   - New (🆕 blue)
   - Contacted (☎️ amber)
   - Converted (✅ green)

3. **Filters**:
   - Buttons: All, New, Contacted, Converted
   - Search input

4. **Leads List**:
   - Lead cards with colored right border (blue/amber/green by status)
   - Name, phone, email, date
   - Status badge
   - Message content
   - Company and source (if provided)
   - Action buttons: Mark Contacted (☎️), Mark Converted (✅), Call (📞), Email (📧)

**Exact Functions to Port**:
- `loadLeadsData()` - Fetch from `/api/leads/page/${page}`
- `updateLeadStatus(leadId, newStatus)` - POST to `/api/lead/${leadId}/status`
- `filterLeads(status)` - Filter by status
- `exportLeads()` - Export to Excel

### 5. Student & Purchase Manager (LEGACY: course-management.html)

**Used for**: `course` pages

**Exact Legacy Features to Port**:

1. **Header**:
   - Title: "🎓 ניהול קורסים"
   - Export Excel button (📥)
   - Back button

2. **Page Info Card**:
   - Page title
   - "Digital Courses Page" label
   - View Page button (👁️)

3. **Statistics Cards** (4 cards with gradients):
   - Total Purchases
   - Total Revenue (pink gradient)
   - Active Courses (blue gradient)
   - Average Purchase (green gradient)

4. **Filters**:
   - Search input
   - Status filter (All, Completed, Pending)
   - Sort by (Date, Amount)

5. **Purchases List**:
   - Purchase cards showing:
     - Customer name, email, phone
     - Course items with icons (📚)
     - Total amount (large, green)
     - Date/time
     - Status badge
     - Message (if provided)

**Exact Functions to Port**:
- `loadPurchases()` - Load from localStorage + server
- `displayPurchases()` - Render purchase cards
- `updateStatistics()` - Calculate totals

### 6. Messages Manager (LEGACY: messages-management.html)

**Used for**: `messageInBottle` pages

**Exact Legacy Features to Port**:

1. **Header**:
   - Title: "🍾 ניהול הודעות"
   - Messages count badge
   - Refresh button (🔄)
   - Back button

2. **Page Info Card**:
   - Page name
   - Type: "Message in Bottle"
   - Status (Active/Paused)
   - Edit Page button (✏️)
   - Toggle Status button (⏸️/▶️)

3. **Messages List**:
   - Message cards showing:
     - Message number badge
     - Date/time
     - Name, phone, email
     - Message content
     - Action buttons: Call (📞), WhatsApp (💬), Email (✉️)
     - Delete button (🗑️)

4. **Empty State**:
   - Mailbox icon (📭)
   - "No messages yet" text

**Exact Functions to Port**:
- `loadMessages()` - Fetch from `/api/leads/${userId}/${pageName}`
- `displayMessages(messages)` - Render message cards
- `deleteMessage(index)` - DELETE to `/api/leads/${userId}/${pageName}/${index}`
- `togglePageStatus()` - Toggle active/paused

### Implementation Pattern

Each management interface is a separate Svelte component that receives:
- `page` object with metadata
- `leads` array
- `purchases` array (if applicable)
- `analytics` object

The routing happens in `/manage/[pageId]/+page.svelte`:

```svelte
<script>
  import InventoryOrderManager from '$lib/components/manage/InventoryOrderManager.svelte';
  import AppointmentQueueManager from '$lib/components/manage/AppointmentQueueManager.svelte';
  import GuestListRSVPManager from '$lib/components/manage/GuestListRSVPManager.svelte';
  import LeadsManager from '$lib/components/manage/LeadsManager.svelte';
  
  let { data } = $props();
  
  const managementComponent = $derived(() => {
    switch(data.page.pageType) {
      case 'store':
      case 'restaurantMenu':
        return InventoryOrderManager;
      case 'serviceProvider':
      case 'appointment':
        return AppointmentQueueManager;
      case 'event':
        return GuestListRSVPManager;
      // ... other cases
      default:
        return LeadsManager;
    }
  });
</script>

<svelte:component this={managementComponent} {data} />
```

## New Page Type Templates

### Artist Page Template

**Structure**:
- Header with navigation (Biography, Gallery, Contact) + external links
- Hero section with artist photo and name
- Biography section with artist story
- Works gallery with image grid
- Contact section with form

**Metadata**:
- `pageType`: "artist"
- `products`: Empty (no e-commerce)
- Contact info extracted from HTML

### Business Card Template

**Structure**:
- Single centered card (vCard format)
- Photo, name, title
- Short description
- Action buttons (Call, Email, WhatsApp, Website)

**Metadata**:
- `pageType`: "businessCard"
- Minimal structure, focused on contact
- All contact methods as clickable buttons

### Portfolio/Image Gallery Template

**Structure**:
- Header with navigation
- Hero section with featured work
- Project grid with images and descriptions
- About section
- Contact form

**Metadata**:
- `pageType`: "portfolio"
- Image-heavy layout
- Project categorization support

## Full-Screen Stav Bot with Voice

### Architecture

The Stav Bot is upgraded from a chat widget to a full-screen immersive experience with voice capabilities.

### Component Structure

```svelte
<!-- StavBotFullScreen.svelte -->
<script>
  let isOpen = $state(false);
  let messages = $state([]);
  let isListening = $state(false);
  let isSpeaking = $state(false);
  
  // Google TTS integration
  async function speak(text) {
    const response = await fetch('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text, language: 'he-IL' })
    });
    const audioBlob = await response.blob();
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
  }
  
  // Speech Recognition
  function startListening() {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognition.start();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900">
    <!-- Full-screen chat interface -->
  </div>
{/if}
```

### Google Text-to-Speech Integration

**API Endpoint**: `/api/tts`

```typescript
// src/routes/api/tts/+server.js
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export async function POST({ request }) {
  const { text, language } = await request.json();
  
  const client = new TextToSpeechClient({
    keyFilename: process.env.GOOGLE_TTS_KEY_PATH
  });
  
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: language, name: 'he-IL-Wavenet-A' },
    audioConfig: { audioEncoding: 'MP3' }
  });
  
  return new Response(response.audioContent, {
    headers: { 'Content-Type': 'audio/mpeg' }
  });
}
```

### Features

1. **Full-Screen Modal**:
   - `position: fixed; inset: 0; z-index: 9999`
   - Gradient background with brand colors
   - Smooth animations for open/close

2. **Voice Input**:
   - Browser Speech Recognition API
   - Visual feedback when listening
   - Automatic message sending after speech

3. **Voice Output**:
   - Google Cloud Text-to-Speech API
   - Natural Hebrew voice (Wavenet)
   - Audio playback with visual indicator

4. **Conversation Context**:
   - Maintain message history in session
   - Smart follow-up questions
   - Context-aware search refinement

5. **Visual Design**:
   - Large, immersive interface
   - Animated message bubbles
   - Voice waveform visualization
   - Microphone button with pulse animation

### User Flow

1. User clicks Stav Bot button
2. Full-screen modal opens with welcome message
3. Stav speaks welcome message (TTS)
4. User can type or click microphone to speak
5. Bot processes query and responds
6. Bot speaks response (TTS)
7. User can continue conversation or close

### Technical Requirements

- Google Cloud TTS API credentials
- Browser Speech Recognition API support
- Audio playback capabilities
- WebSocket for real-time updates (optional)

