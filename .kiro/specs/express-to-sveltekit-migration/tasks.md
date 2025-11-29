# Implementation Plan

- [x] 1. Initialize SvelteKit and Strapi projects



  - Run `npm create svelte@latest new-app -- --template skeleton --types checkjs`
  - Run `cd new-app && npm install`
  - Install dependencies: `npm install @strapi/strapi-sdk date-fns`
  - Run `cd .. && npx create-strapi-app@latest strapi-backend --quickstart`
  - Create directory structure: `new-app/src/lib/server/`
  - Set up environment variables for Strapi URL and API token
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Define Strapi content types and schemas



  - [x] 2.1 Create User content type in Strapi


    - Define fields: id, name, email, phone, wallet, avatar, createdAt, lastActive
    - Configure relations: pages (hasMany), purchases (hasMany), leads (hasMany)
    - _Requirements: 2.1_

  - [x] 2.2 Create Page content type in Strapi


    - Define fields: title, slug (unique), htmlContent (richtext), pageType (enum), description, isActive (boolean)
    - Define contact fields: phone, email, city, address
    - Define JSON fields: products, metadata
    - Configure relations: user (belongsTo), purchases (hasMany), leads (hasMany), analytics (hasOne)
    - Add indexes: slug (unique), userId + isActive (composite)
    - _Requirements: 2.2_

  - [x] 2.3 Create Purchase content type in Strapi


    - Define fields: products (JSON), total, paymentMethod, customerName, customerPhone, customerEmail, customerAddress, shipping (boolean)
    - Define status fields: status (enum), statusText, createdAt, updatedAt, pickedAt, deliveredAt
    - Define driver fields: driverId, driverName
    - Configure relations: user (belongsTo), page (belongsTo)
    - Add indexes: pageId + createdAt
    - _Requirements: 2.3_

  - [x] 2.4 Create Lead content type in Strapi


    - Define fields: name, phone, email, message, createdAt
    - Define appointment fields: appointmentDate, appointmentStatus (enum)
    - Configure relations: user (belongsTo), page (belongsTo)
    - Add indexes: pageId + createdAt
    - _Requirements: 2.4_

  - [x] 2.5 Create Analytics content type in Strapi


    - Define fields: totalSales, totalOrders, totalCustomers, totalLeads
    - Define JSON fields: dailySales, monthlySales, topProducts, recentPurchases
    - Define timestamps: createdAt, updatedAt
    - Configure relations: page (belongsTo)
    - Add indexes: pageId (unique)
    - _Requirements: 2.5_

  - [x] 2.6 Configure Strapi permissions and API access


    - Set up API token authentication
    - Configure CORS for SvelteKit app
    - Test CRUD operations via Strapi admin panel
    - _Requirements: 2.6_

- [x] 3. Implement server-side modules





  - [ ] 3.1 Implement strapi.js module
    - Create Strapi SDK client with authentication
    - Implement user operations: createUser, getUserById, updateUser
    - Implement page operations: createPage, getPageBySlug, getPagesByUser, updatePage, deletePage, getActivePages
    - Implement purchase operations: createPurchase, getPurchasesByPage, updatePurchaseStatus
    - Implement lead operations: createLead, getLeadsByPage
    - Implement analytics operations: getAnalytics, updateAnalytics
    - _Requirements: 4.2_

  - [ ]*  3.2 Write property test for Strapi CRUD operations
    - **Property 6: User Page Query Completeness**


    - **Validates: Requirements 7.1**

  - [ ] 3.3 Implement htmlGenerator.js module
    - Implement generatePageHtml function for template-based HTML generation
    - Implement generateSlug function (userId prefix + cleaned title)
    - Ensure DOCTYPE is added to all generated HTML
    - _Requirements: 4.1_



  - [ ]* 3.4 Write property test for slug generation
    - **Property 39: Slug Generation Consistency**
    - **Validates: Requirements 16.3**

  - [ ] 3.5 Implement dataExtractor.js module
    - Implement extractContactInfo function (phone, email, city, address)
    - Implement extractProducts function (name, price, image, description)
    - Implement extractDescription function (from meta tags)
    - Implement detectPageType function (keyword analysis with priority to selectedType)
    - Use multiple selector strategies for robust extraction
    - _Requirements: 4.3_

  - [ ]* 3.6 Write property test for contact info extraction
    - **Property 32: Contact Info Extraction**
    - **Validates: Requirements 13.1**

  - [ ]* 3.7 Write property test for product extraction
    - **Property 33: Product Extraction**


    - **Validates: Requirements 13.2**

  - [ ]* 3.8 Write property test for description extraction
    - **Property 34: Description Extraction**
    - **Validates: Requirements 13.3**

  - [ ] 3.9 Implement pageProcessor.js module
    - Implement injectScripts function (store-checkout.js for stores/courses/restaurants, data extractor for all)
    - Implement fixWhatsAppCode function for event pages
    - Implement cleanHtml function (ensure DOCTYPE, remove duplicates, remove trailing text)
    - Implement processPage function (orchestrates all processing)
    - Check for skip-store-injection meta tag to avoid duplicate scripts
    - Inject page-type meta tag for reliable detection
    - _Requirements: 4.4_

  - [ ]* 3.10 Write property test for HTML cleaning
    - **Property 29: HTML Cleaning**
    - **Validates: Requirements 12.3**



  - [ ]* 3.11 Write property test for script injection
    - **Property 4: Page Type Detection and Script Injection**
    - **Validates: Requirements 6.4, 14.1, 14.2, 14.3, 14.5**

  - [ ]* 3.12 Write property test for template store script exclusion
    - **Property 35: Template Store Script Exclusion**
    - **Validates: Requirements 14.4**

  - [ ] 3.13 Implement imageUpload.js module
    - Implement uploadImage function (upload to Strapi media library)
    - Implement deleteImage function (remove from Strapi)
    - Handle file validation and error cases
    - _Requirements: 4.5_

  - [ ]* 3.14 Write property test for image upload
    - **Property 5: Image Upload Persistence**



    - **Validates: Requirements 6.5**

  - [ ]* 3.15 Write unit tests for all server modules
    - Test htmlGenerator functions with various inputs
    - Test dataExtractor with different HTML structures
    - Test pageProcessor with various page types
    - Test error handling in all modules
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4. Checkpoint - Verify server modules work correctly
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 5. Implement page management API routes
  - [ ] 5.1 Implement POST /api/create-page endpoint
    - Accept userId, title, htmlContent, pageData, selectedPageType
    - Process HTML with pageProcessor.processPage
    - Extract metadata with dataExtractor functions
    - Generate slug with htmlGenerator.generateSlug
    - Save page to Strapi with strapi.createPage
    - Create empty Analytics record for the page
    - Return page URL and success message
    - _Requirements: 3.2, 6.3, 6.4_

  - [ ]* 5.2 Write property test for page creation
    - **Property 3: Page Creation Persistence**
    - **Validates: Requirements 6.3**

  - [x] 5.3 Implement GET /api/pages/[userId] endpoint

    - Query Strapi for all pages belonging to userId
    - Return pages with metadata
    - _Requirements: 3.1, 7.1_

  - [x] 5.4 Implement PUT /api/update-page endpoint


    - Accept pageId, htmlContent
    - Process HTML with pageProcessor.processPage
    - Extract updated metadata
    - Update page in Strapi with strapi.updatePage
    - Return success message
    - _Requirements: 3.3, 7.3_

  - [ ]* 5.5 Write property test for page update
    - **Property 7: Page Update Consistency**
    - **Validates: Requirements 7.3**

  - [x] 5.6 Implement DELETE /api/delete-page endpoint


    - Accept pageId
    - Delete page from Strapi (cascade deletes purchases, leads, analytics)
    - Return success message
    - _Requirements: 3.4, 7.4_

  - [ ]* 5.7 Write property test for cascade delete
    - **Property 8: Cascade Delete Integrity**
    - **Validates: Requirements 7.4, 7.5**

  - [x] 5.8 Implement POST /api/upload-image endpoint



    - Accept image file, userId, pageName
    - Upload to Strapi media library with imageUpload.uploadImage
    - Return image URL
    - _Requirements: 6.5_

- [-] 6. Implement marketplace API routes

  - [x] 6.1 Implement GET /api/pages/all/marketplace endpoint


    - Query Strapi for pages where isActive is true
    - Support search query parameter (filter by title, description, pageType)
    - Support pageType filter parameter
    - Support pagination
    - Return pages with metadata
    - _Requirements: 3.1, 8.1, 8.3, 8.4_

  - [ ]* 6.2 Write property test for marketplace active pages filter
    - **Property 9: Marketplace Active Pages Filter**
    - **Validates: Requirements 8.1**

  - [ ]* 6.3 Write property test for marketplace search filtering
    - **Property 10: Marketplace Search Filtering**
    - **Validates: Requirements 8.3**

  - [ ]* 6.4 Write property test for marketplace type filtering
    - **Property 11: Marketplace Type Filtering**
    - **Validates: Requirements 8.4**

- [-] 7. Implement purchase API routes

  - [x] 7.1 Implement POST /api/purchase endpoint


    - Accept userId, pageId, products, total, paymentMethod, customer details, shipping
    - Create Purchase record in Strapi with strapi.createPurchase
    - Update Analytics with strapi.updateAnalytics (increment totalSales, totalOrders, update dailySales/monthlySales)
    - Return purchase confirmation
    - _Requirements: 3.2, 9.2, 9.3_

  - [ ]* 7.2 Write property test for purchase creation
    - **Property 13: Purchase Creation Completeness**
    - **Validates: Requirements 9.2**

  - [ ]* 7.3 Write property test for purchase analytics update
    - **Property 14: Purchase Analytics Update**
    - **Validates: Requirements 9.3**

  - [x] 7.4 Implement GET /api/purchases/[pageId] endpoint


    - Query Strapi for all purchases for pageId
    - Return purchases with details
    - _Requirements: 3.1, 9.4_

  - [ ]* 7.5 Write property test for purchase query
    - **Property 15: Purchase Query Completeness**
    - **Validates: Requirements 9.4**

  - [x] 7.6 Implement PUT /api/purchase/[purchaseId]/status endpoint


    - Accept status value
    - Update purchase status in Strapi
    - Update appropriate timestamp (pickedAt, deliveredAt)
    - Return success message
    - _Requirements: 3.3, 9.5_

  - [ ]* 7.7 Write property test for purchase status update
    - **Property 16: Purchase Status Update Tracking**
    - **Validates: Requirements 9.5**

- [-] 8. Implement lead API routes

  - [x] 8.1 Implement POST /api/lead endpoint


    - Accept userId, pageId, name, phone, email, message, appointmentDate, appointmentStatus
    - Validate required fields (name, phone or email)
    - Create Lead record in Strapi with strapi.createLead
    - Update Analytics (increment totalLeads)
    - Return success message
    - _Requirements: 3.2, 10.1, 10.2, 10.5_

  - [ ]* 8.2 Write property test for lead creation
    - **Property 17: Lead Creation Completeness**
    - **Validates: Requirements 10.1**

  - [ ]* 8.3 Write property test for lead analytics update
    - **Property 18: Lead Analytics Update**
    - **Validates: Requirements 10.2**

  - [ ]* 8.4 Write property test for lead validation
    - **Property 21: Lead Validation**
    - **Validates: Requirements 10.5**

  - [ ]* 8.5 Write property test for lead form universal support
    - **Property 20: Lead Form Universal Support**
    - **Validates: Requirements 10.4**

  - [x] 8.6 Implement GET /api/leads/[pageId] endpoint


    - Query Strapi for all leads for pageId
    - Return leads with details
    - _Requirements: 3.1, 10.3_

  - [ ]* 8.7 Write property test for lead query
    - **Property 19: Lead Query Completeness**
    - **Validates: Requirements 10.3**

  - [x] 8.8 Implement PUT /api/lead/[leadId]/status endpoint


    - Accept appointmentStatus value
    - Update lead appointmentStatus in Strapi
    - Return success message
    - _Requirements: 3.3, 15.5_

  - [ ]* 8.9 Write property test for appointment status update
    - **Property 37: Appointment Status Update**
    - **Validates: Requirements 15.5**

- [-] 9. Implement user API routes

  - [x] 9.1 Implement GET /api/user/[userId] endpoint


    - Query Strapi for user by userId
    - Return user data
    - _Requirements: 3.1_

  - [x] 9.2 Implement POST /api/user/[userId] endpoint


    - Accept user data updates
    - Update user in Strapi
    - Return success message
    - _Requirements: 3.2_

- [ ] 10. Checkpoint - Verify all API routes work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [-] 11. Implement page viewing routes


  - [x] 11.1 Implement /pages/[slug]/+page.server.js load function

    - Query Strapi for page by slug with strapi.getPageBySlug
    - Return page data (htmlContent, metadata)
    - _Requirements: 5.3, 12.1_


  - [x] 11.2 Implement /pages/[slug]/+page.svelte component

    - Render HTML content dynamically
    - Ensure DOCTYPE is present
    - Clean HTML with pageProcessor.cleanHtml
    - Replace image URLs to point to Strapi media library
    - _Requirements: 5.1, 12.2, 12.3, 12.4_

  - [ ]* 11.3 Write property test for page serving
    - **Property 27: Page Serving by Slug**
    - **Validates: Requirements 12.1**

  - [ ]* 11.4 Write property test for DOCTYPE presence
    - **Property 28: DOCTYPE Presence**
    - **Validates: Requirements 12.2**

  - [ ]* 11.5 Write property test for image URL correctness
    - **Property 30: Image URL Correctness**
    - **Validates: Requirements 12.4**


  - [x] 11.6 Implement /view/[slug]/+page.server.js load function

    - Query Strapi for page by slug
    - Return page data
    - _Requirements: 5.3, 12.5_


  - [x] 11.7 Implement /view/[slug]/+page.svelte component

    - Render HTML content without editor tools
    - Strip out editor scripts and UI elements
    - _Requirements: 5.1, 12.5_

  - [ ]* 11.8 Write property test for clean page view
    - **Property 31: Clean Page View**
    - **Validates: Requirements 12.5**


  - [x] 11.9 Implement legacy URL redirect

    - Create /pages/[userId]/[fileName]/+page.server.js
    - Parse userId and fileName
    - Look up page by userId and fileName (stored in metadata)
    - Redirect to /pages/[slug]
    - _Requirements: 16.1_

  - [ ]* 11.10 Write property test for legacy URL redirect
    - **Property 38: Legacy URL Redirect**
    - **Validates: Requirements 16.1**

- [-] 12. Implement page creator UI

  - [x] 12.1 Implement /page-creator/+page.svelte component



    - Use Svelte 5 Runes ($state, $derived) for reactive state
    - Display template selection interface
    - Load template HTML when selected
    - Allow HTML customization
    - Handle image uploads
    - Call POST /api/create-page on save
    - _Requirements: 5.1, 5.2, 6.1, 6.2_

  - [ ] 12.2 Implement /page-creator/+page.server.js load function
    - Load available templates
    - Return template data
    - _Requirements: 5.3_

- [-] 13. Implement marketplace UI

  - [x] 13.1 Implement /marketplace/+page.svelte component


    - Use Svelte 5 Runes for reactive state
    - Display search interface
    - Display page type filters
    - Display pages in responsive grid
    - Implement pagination
    - Call GET /api/pages/all/marketplace
    - _Requirements: 5.1, 5.2, 8.2, 8.5_


  - [x] 13.2 Implement /marketplace/+page.server.js load function

    - Fetch initial marketplace pages
    - Return page data
    - _Requirements: 5.3_

- [ ] 14. Implement management hub UI
  - [ ] 14.1 Implement /management-hub/+page.svelte component
    - Use Svelte 5 Runes for reactive state
    - Display user's pages
    - Show page metadata (pageType, description, contact info, isActive)
    - Provide edit, delete actions
    - Call GET /api/pages/[userId]
    - _Requirements: 5.1, 5.2, 7.2_

  - [ ] 14.2 Implement /management-hub/+page.server.js load function
    - Fetch user's pages
    - Return page data
    - _Requirements: 5.3_

- [ ] 15. Implement admin panels UI
  - [ ] 15.1 Implement /store-admin/+page.svelte component
    - Use Svelte 5 Runes for reactive state
    - Display purchases for user's store pages
    - Allow status updates
    - Call GET /api/purchases/[pageId]
    - Call PUT /api/purchase/[purchaseId]/status
    - _Requirements: 5.1, 5.2_

  - [ ] 15.2 Implement /leads-admin/+page.svelte component
    - Use Svelte 5 Runes for reactive state
    - Display leads for user's pages
    - Call GET /api/leads/[pageId]
    - _Requirements: 5.1, 5.2_

  - [ ] 15.3 Implement /appointments-admin/+page.svelte component
    - Use Svelte 5 Runes for reactive state
    - Display appointments (leads with appointmentDate)
    - Allow status updates
    - Display calendar view
    - Call GET /api/leads/[pageId]
    - Call PUT /api/lead/[leadId]/status
    - _Requirements: 5.1, 5.2, 15.3, 15.4_

- [ ] 16. Implement home page and other static pages
  - [x] 16.1 Implement /+page.svelte (home page)



    - Use Svelte 5 Runes for reactive state
    - Display landing page content
    - _Requirements: 5.1, 5.2_

  - [ ] 16.2 Implement /admin/+page.svelte (admin panel)
    - Use Svelte 5 Runes for reactive state
    - Display admin interface
    - _Requirements: 5.1, 5.2_

- [ ] 17. Checkpoint - Verify all UI pages work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Implement data migration script
  - [ ] 18.1 Create migration script file (scripts/migrate.js)
    - Set up Strapi SDK client
    - Implement logging and progress tracking
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 18.2 Implement user migration logic
    - Read database.json
    - Parse users object
    - For each user, call strapi.createUser
    - Log success/failure for each user
    - _Requirements: 11.1_

  - [ ]* 18.3 Write property test for user migration
    - **Property 22: Migration User Completeness**
    - **Validates: Requirements 11.1**

  - [ ] 18.4 Implement page migration logic
    - Scan output directory for user folders
    - For each HTML file, read content
    - Read associated metadata.json if exists
    - Extract metadata with dataExtractor functions
    - Process HTML with pageProcessor.processPage
    - Generate slug with htmlGenerator.generateSlug
    - Call strapi.createPage
    - Create Analytics record for page
    - Log success/failure for each page
    - _Requirements: 11.2_

  - [ ]* 18.5 Write property test for page migration
    - **Property 23: Migration Page Completeness**
    - **Validates: Requirements 11.2**

  - [ ] 18.6 Implement purchase migration logic
    - Scan page data directories for purchases.json files
    - For each purchase, parse JSON
    - Look up user and page by ID (map legacy IDs to Strapi IDs)
    - Call strapi.createPurchase with proper relations
    - Log success/failure for each purchase
    - _Requirements: 11.3_

  - [ ]* 18.7 Write property test for purchase migration
    - **Property 24: Migration Purchase Completeness**
    - **Validates: Requirements 11.3**

  - [ ] 18.8 Implement lead migration logic
    - Scan page data directories for leads.json files
    - For each lead, parse JSON
    - Look up user and page by ID (map legacy IDs to Strapi IDs)
    - Call strapi.createLead with proper relations
    - Log success/failure for each lead
    - _Requirements: 11.4_

  - [ ]* 18.9 Write property test for lead migration
    - **Property 25: Migration Lead Completeness**
    - **Validates: Requirements 11.4**

  - [ ] 18.10 Implement data integrity verification
    - Count users in database.json vs Strapi
    - Count pages in output directory vs Strapi
    - Count purchases in data directories vs Strapi
    - Count leads in data directories vs Strapi
    - Generate verification report
    - _Requirements: 11.5_

  - [ ]* 18.11 Write property test for migration data integrity
    - **Property 26: Migration Data Integrity**
    - **Validates: Requirements 11.5**

  - [ ] 18.12 Test migration script with production data copy
    - Create copy of production database.json and output directory
    - Run migration script
    - Verify all data migrated correctly
    - Review migration report
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 19. Final checkpoint - Comprehensive testing
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 20. Write integration tests for critical flows
  - Test complete page creation flow (UI → API → Strapi)
  - Test complete purchase flow (cart → checkout → API → Strapi → analytics)
  - Test complete lead submission flow (form → API → Strapi → analytics)
  - Test marketplace browsing and filtering
  - Test page management (create, update, delete)
  - _Requirements: All_

- [ ]* 21. Write E2E tests with Playwright
  - Test page creator user flow
  - Test marketplace browsing user flow
  - Test purchase checkout user flow
  - Test lead submission user flow
  - Test admin panel user flows
  - _Requirements: All_

- [ ] 22. Performance optimization
  - Add database indexes for frequently queried fields
  - Implement caching for marketplace queries
  - Enable response compression
  - Optimize image serving from Strapi media library
  - _Requirements: All_

- [ ] 23. Security hardening
  - Configure CORS properly
  - Implement rate limiting on API endpoints
  - Validate and sanitize all user inputs
  - Set up HTTPS for production
  - Secure environment variables
  - _Requirements: All_

- [ ] 24. Documentation
  - Document API endpoints (OpenAPI/Swagger)
  - Document Strapi content types
  - Document migration process
  - Create deployment guide
  - Create troubleshooting guide
  - _Requirements: All_

- [ ] 25. Deployment preparation
  - Set up production Strapi instance
  - Set up production SvelteKit instance
  - Configure PostgreSQL database
  - Set up environment variables
  - Test production deployment
  - _Requirements: All_

- [ ] 26. Production migration
  - Freeze legacy system (read-only mode)
  - Run migration script on production data
  - Verify data integrity
  - Smoke test all critical functionality
  - Update DNS/routing to new system
  - Monitor logs and metrics
  - Archive legacy files for backup only
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_


- [ ] 27. Implement polymorphic management interfaces
  - [ ] 27.1 Create management component router
    - Implement /manage/[pageId]/+page.svelte with polymorphic routing logic
    - Use $derived to select appropriate management component based on pageType
    - Import all specialized management components
    - Pass page data, leads, purchases, and analytics to selected component
    - _Requirements: 17.5_

  - [ ] 27.2 Create InventoryOrderManager component
    - Implement product inventory CRUD operations
    - Display order tracking table with status updates
    - Show revenue analytics and top products
    - Add stock level monitoring
    - Support category management
    - Use for store, restaurantMenu, and course page types
    - _Requirements: 17.1, 17.6_

  - [ ] 27.3 Create AppointmentQueueManager component
    - Implement calendar view of appointments
    - Add time slot management interface
    - Support booking status updates (pending, confirmed, completed, cancelled)
    - Display customer contact information
    - Show appointment history
    - Use for serviceProvider and appointment page types
    - _Requirements: 17.2_

  - [ ] 27.4 Create GuestListRSVPManager component
    - Implement RSVP tracking table (confirmed, declined, pending)
    - Display guest count and plus-ones
    - Show contact information for attendees
    - Add event capacity monitoring
    - Support export guest list functionality
    - Use for event page type
    - _Requirements: 17.3_

  - [ ] 27.5 Create MessagesManager component
    - Display received messages in chronological order
    - Support message status (read/unread)
    - Show sender information
    - Display message timestamps
    - Add archive functionality
    - Use for messageInBottle page type
    - _Requirements: 17.7_

  - [ ] 27.6 Update LeadsManager component
    - Ensure it works for landing, general, artist, businessCard, and portfolio page types
    - Display contact form submissions
    - Support lead status tracking (new, contacted, completed)
    - Show contact information and message content
    - Add lead source tracking
    - _Requirements: 17.4_

  - [ ]* 27.7 Write unit tests for management components
    - Test component rendering with different page types
    - Test data display and formatting
    - Test status update functionality
    - Test filtering and sorting
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.6, 17.7_

- [ ] 28. Add new page type templates
  - [ ] 28.1 Create artist page template
    - Add to templates/index.js with artist configuration
    - Create template structure with header, hero, biography, gallery, and contact sections
    - Include navigation with internal links (Biography, Gallery, Contact) and external links
    - Set pageType to "artist"
    - Add image upload support for gallery
    - _Requirements: 18.1, 18.4_

  - [ ] 28.2 Create business card template
    - Add to templates/index.js with businessCard configuration
    - Create single centered vCard structure
    - Include photo, name, title, description, and action buttons
    - Add contact buttons (Call, Email, WhatsApp, Website)
    - Set pageType to "businessCard"
    - _Requirements: 18.2, 18.4_

  - [ ] 28.3 Create portfolio/image gallery template
    - Add to templates/index.js with portfolio configuration
    - Create template with header, hero, project grid, about, and contact sections
    - Support image-heavy layout with project categorization
    - Add image upload support for projects
    - Set pageType to "portfolio"
    - _Requirements: 18.3, 18.4, 18.5_

  - [ ] 28.4 Update TemplateSelector component
    - Add artist, businessCard, and portfolio options to template list
    - Include appropriate icons and descriptions
    - Update template preview images
    - _Requirements: 18.1, 18.2, 18.3_

  - [ ] 28.5 Update page type detection logic
    - Add artist, businessCard, and portfolio to pageType enum in Strapi
    - Update dataExtractor.detectPageType to recognize new templates
    - Ensure proper script injection for new page types
    - _Requirements: 18.4_

  - [ ]* 28.6 Write unit tests for new templates
    - Test template generation with various inputs
    - Test pageType detection for new templates
    - Test metadata extraction from new page types
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 29. Implement full-screen Stav Bot with voice
  - [ ] 29.1 Create StavBotFullScreen component
    - Implement full-screen modal with z-index 9999
    - Add gradient background with brand colors
    - Create immersive chat interface with large message bubbles
    - Add smooth open/close animations
    - Support conversation context across messages
    - _Requirements: 19.1, 19.5, 19.7_

  - [ ] 29.2 Implement Google TTS integration
    - Create /api/tts/+server.js endpoint
    - Install @google-cloud/text-to-speech package
    - Configure Google Cloud credentials
    - Implement synthesizeSpeech with Hebrew voice (he-IL-Wavenet-A)
    - Return audio as MP3 blob
    - _Requirements: 19.2_

  - [ ] 29.3 Add voice output to bot responses
    - Call /api/tts endpoint when bot responds
    - Create audio element and play response
    - Add visual indicator when speaking
    - Support pause/resume audio playback
    - _Requirements: 19.2_

  - [ ] 29.4 Implement voice input with Speech Recognition
    - Use browser webkitSpeechRecognition API
    - Configure for Hebrew language (he-IL)
    - Add microphone button with pulse animation
    - Show visual feedback when listening
    - Automatically send message after speech recognition
    - _Requirements: 19.6_

  - [ ] 29.5 Add voice waveform visualization
    - Implement audio waveform animation during playback
    - Add microphone pulse animation during recording
    - Use CSS animations for smooth effects
    - _Requirements: 19.1_

  - [ ] 29.6 Update marketplace page to use full-screen bot
    - Replace current StavBot component with StavBotFullScreen
    - Ensure bot button is visible and accessible
    - Test bot functionality on marketplace page
    - _Requirements: 19.1, 19.5_

  - [ ]* 29.7 Write unit tests for Stav Bot
    - Test modal open/close functionality
    - Test message sending and receiving
    - Test conversation context maintenance
    - Mock TTS and Speech Recognition APIs
    - _Requirements: 19.1, 19.2, 19.5, 19.6, 19.7_

  - [ ]* 29.8 Write integration tests for voice features
    - Test TTS API endpoint with various text inputs
    - Test audio playback functionality
    - Test Speech Recognition integration
    - Test error handling for API failures
    - _Requirements: 19.2, 19.6_

- [ ] 30. Final checkpoint - Test polymorphic management and new features
  - Ensure all tests pass, ask the user if questions arise.
  - Test each management interface with appropriate page types
  - Test new page templates (artist, business card, portfolio)
  - Test full-screen Stav Bot with voice input/output
  - Verify Google TTS integration works correctly
  - Test Speech Recognition in supported browsers

- [ ] 27. Implement Polymorphic Management Interfaces
  - [x] 27.1 Create polymorphic management router in /manage/[pageId]/+page.svelte
    - Import all management components
    - Implement $derived() logic to select component based on pageType
    - Add loading state while component is determined
    - Use <svelte:component> for dynamic rendering
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

  - [x] 27.2 Port Store Inventory & Order Manager (legacy/store-admin.html)
    - Create InventoryOrderManager.svelte component
    - Port exact HTML structure and styling from store-admin.html
    - Implement order filtering (all, today, week, pending, processing, shipped, delivered)
    - Implement search functionality (by name, phone, product, order ID)
    - Display statistics cards (total orders, pending, processing, shipped, delivered, revenue)
    - Implement status dropdown for each order (pending → processing → shipped → delivered)
    - Add WhatsApp contact button
    - Add tracking number prompt for shipped orders
    - Add export to Excel functionality
    - Add print functionality
    - Display order details (customer info, products, total, notes, tracking)
    - Use purchases data from +page.server.js
    - Call PUT /api/purchase/[purchaseId]/status for status updates
    - _Requirements: 17.1_

  - [ ] 27.3 Port Appointment/Queue Manager (legacy/appointments-admin.html)
    - Create AppointmentQueueManager.svelte component
    - Port exact HTML structure and styling from appointments-admin.html
    - Implement calendar view with date navigation
    - Display appointments by date with time slots
    - Implement status updates (pending, confirmed, completed, cancelled)
    - Add customer contact buttons (call, WhatsApp)
    - Display appointment details (service, duration, price, notes)
    - Add filtering by status and date range
    - Add export functionality
    - Use leads data filtered by appointmentDate
    - Call PUT /api/lead/[leadId]/status for status updates
    - _Requirements: 17.2_

  - [ ] 27.4 Port Guest List/RSVP Manager (legacy/event-admin.html)
    - Create GuestListRSVPManager.svelte component
    - Port exact HTML structure and styling from event-admin.html
    - Display guest list with RSVP status (pending, confirmed, declined)
    - Implement guest filtering (all, confirmed, pending, declined)
    - Display guest count statistics
    - Add bulk messaging functionality
    - Add export guest list functionality
    - Display guest details (name, phone, email, plus-ones, dietary restrictions)
    - Use leads data with RSVP information
    - Call PUT /api/lead/[leadId]/status for RSVP updates
    - _Requirements: 17.3_

  - [ ] 27.5 Port Messages Manager (legacy/messages-management.html)
    - Create MessagesManager.svelte component
    - Port exact HTML structure and styling from messages-management.html
    - Display all messages with sender info
    - Implement message filtering (read, unread, archived)
    - Add message status updates
    - Display message details (sender, recipient, content, date)
    - Add reply functionality
    - Use leads data with message content
    - _Requirements: 17.5_

  - [ ] 27.6 Update Leads Manager for standard pages (legacy/leads-admin.html)
    - Update LeadsManager.svelte component
    - Port exact HTML structure and styling from leads-admin.html
    - Display leads table with filtering
    - Implement status updates (new, contacted, converted)
    - Add contact buttons (call, email, WhatsApp)
    - Display lead details (name, phone, email, message, company)
    - Add export functionality
    - Use leads data from +page.server.js
    - Call PUT /api/lead/[leadId]/status for status updates
    - _Requirements: 17.6_

  - [ ]* 27.7 Write unit tests for management components
    - Test InventoryOrderManager filtering and search
    - Test AppointmentQueueManager calendar navigation
    - Test GuestListRSVPManager guest filtering
    - Test MessagesManager message filtering
    - Test LeadsManager status updates
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 28. Add New Page Type Templates
  - [ ] 28.1 Create artist page template (new-app/src/lib/templates/artist.js)
    - Define artist template structure
    - Include biography section
    - Include works/gallery section
    - Include exhibitions section
    - Include contact section
    - Add to template registry
    - _Requirements: 18.1_

  - [ ] 28.2 Create business card template (new-app/src/lib/templates/businessCard.js)
    - Define business card template structure
    - Include profile photo
    - Include contact buttons (call, email, WhatsApp, website)
    - Include social media links
    - Include vCard download button
    - Add to template registry
    - _Requirements: 18.2_

  - [ ] 28.3 Create portfolio/image gallery template (new-app/src/lib/templates/portfolio.js)
    - Define portfolio template structure
    - Include masonry/grid image gallery
    - Include project descriptions
    - Include categories/tags
    - Include lightbox functionality
    - Add to template registry
    - _Requirements: 18.3_

  - [ ] 28.4 Update TemplateSelector component
    - Add artist, businessCard, and portfolio options
    - Update template icons and descriptions
    - Update template preview images
    - _Requirements: 18.1, 18.2, 18.3_

  - [ ] 28.5 Update page type detection logic in dataExtractor
    - Add detection for artist pages
    - Add detection for business card pages
    - Add detection for portfolio pages
    - _Requirements: 18.1, 18.2, 18.3_

  - [ ]* 28.6 Write unit tests for new templates
    - Test artist template generation
    - Test business card template generation
    - Test portfolio template generation
    - _Requirements: 18.1, 18.2, 18.3_

- [ ] 29. Implement Full-Screen Stav Bot with Voice
  - [ ] 29.1 Create StavBotFullScreen component
    - Create full-screen modal overlay (z-index 9999)
    - Implement gradient background (purple-900 → pink-800 → purple-900)
    - Add close button
    - Add message display area with animations
    - Add input area with microphone button
    - Add voice waveform visualization placeholder
    - _Requirements: 19.1, 19.2_

  - [ ] 29.2 Implement Google TTS integration
    - Create /api/tts/+server.js endpoint
    - Install @google-cloud/text-to-speech package
    - Configure Google Cloud credentials
    - Implement text-to-speech synthesis (he-IL-Wavenet-A voice)
    - Return audio as MP3 stream
    - _Requirements: 19.2_

  - [ ] 29.3 Add voice output to bot responses
    - Call /api/tts endpoint when bot responds
    - Play audio using Web Audio API
    - Add audio loading state
    - Handle audio playback errors
    - _Requirements: 19.2_

  - [ ] 29.4 Implement voice input with Speech Recognition
    - Use browser Speech Recognition API
    - Configure for Hebrew language (he-IL)
    - Add microphone button with recording state
    - Display transcribed text
    - Send transcribed text to bot
    - Handle recognition errors
    - _Requirements: 19.3_

  - [ ] 29.5 Add voice waveform visualization
    - Use Web Audio API AnalyserNode
    - Create canvas-based waveform visualization
    - Animate waveform during speech
    - Add pulsing effect to microphone button
    - _Requirements: 19.2, 19.3_

  - [ ] 29.6 Update marketplace page to use full-screen bot
    - Replace StavBot component with StavBotFullScreen
    - Add "דבר עם סתיו" button
    - Update styling for full-screen experience
    - _Requirements: 19.1_

  - [ ]* 29.7 Write unit tests for Stav Bot
    - Test message display and formatting
    - Test conversation context maintenance
    - Test error handling
    - _Requirements: 19.1, 19.2, 19.3_

  - [ ]* 29.8 Write integration tests for voice features
    - Test TTS endpoint with various inputs
    - Test audio playback
    - Test Speech Recognition integration
    - _Requirements: 19.2, 19.3_

- [ ] 30. Final Checkpoint - Polymorphic Management & Voice Features
  - Test all polymorphic management interfaces with real data
  - Test new page templates (artist, business card, portfolio)
  - Test full-screen Stav Bot with voice input/output
  - Verify Google TTS and Speech Recognition work correctly
  - Ensure all management interfaces match legacy 1:1
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 18.1, 18.2, 18.3, 19.1, 19.2, 19.3_
