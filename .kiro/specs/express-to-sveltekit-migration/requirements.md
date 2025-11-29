# Requirements Document

## Introduction

This document specifies the requirements for migrating a legacy Express.js application to a modern SvelteKit 5 + Strapi 5 architecture. The legacy system is a multi-tenant page builder and marketplace platform that allows users to create landing pages, online stores, event pages, appointment booking pages, and message-in-a-bottle pages. The system includes features for lead management, purchase tracking, analytics, and a marketplace where pages can be discovered.

The migration aims to modernize the technology stack while preserving all existing functionality and data structures. The new architecture will separate concerns by using SvelteKit for the frontend and API layer, and Strapi as a headless CMS for content and data management.

## Glossary

- **Legacy System**: The existing Express.js application (server.js) that serves HTML pages and manages data through a JSON file database
- **SvelteKit App**: The new frontend and API layer built with SvelteKit 5, using Svelte Runes ($state, $derived) for reactivity
- **Strapi Backend**: The headless CMS (Strapi 5) that will replace the JSON file database for content and data management
- **Page**: A user-generated landing page (HTML file) stored in the output directory, can be of various types (store, event, serviceProvider, messageInBottle, course, workshop, restaurantMenu)
- **User**: A platform user identified by userId who can create and manage multiple pages
- **Lead**: A form submission or inquiry from a visitor to a user's page
- **Purchase**: A completed transaction on a store/course/restaurant page
- **Marketplace**: A public directory where active pages can be discovered by visitors
- **Page Metadata**: JSON data associated with each page including pageType, contact info, products, and analytics
- **Page Creator**: The visual page builder tool that allows users to create pages from templates
- **HTML Content**: The complete HTML markup of a page, stored as a text field in Strapi Backend

## Requirements

### Requirement 1

**User Story:** As a platform administrator, I want to initialize the new SvelteKit and Strapi projects, so that I have the foundation for migrating the legacy system.

#### Acceptance Criteria

1. WHEN the initialization commands are executed, THE SvelteKit App SHALL be created with TypeScript support and skeleton template
2. WHEN the SvelteKit App is created, THE system SHALL install required dependencies including @strapi/strapi-sdk and date-fns
3. WHEN the Strapi initialization command is executed, THE Strapi Backend SHALL be created with quickstart configuration
4. WHEN both projects are initialized, THE system SHALL create the necessary directory structure for server-side modules in src/lib/server/
5. THE SvelteKit App SHALL use Svelte 5 syntax with Runes for all reactive state management

### Requirement 2

**User Story:** As a developer, I want to replicate the legacy data model in Strapi, so that all existing data structures are preserved in the new system.

#### Acceptance Criteria

1. THE Strapi Backend SHALL define a User content type with fields for id, name, email, phone, wallet, purchases relation, createdAt, lastActive, and avatar
2. THE Strapi Backend SHALL define a Page content type with fields for userId relation, title, slug, htmlContent (rich text), pageType, description, isActive, phone, email, city, address, products (JSON), and metadata (JSON)
3. THE Strapi Backend SHALL define a Purchase content type with fields for id, user relation, page relation, products (JSON), total, paymentMethod, customerName, customerPhone, customerEmail, customerAddress, shipping boolean, status, and timestamps
4. THE Strapi Backend SHALL define a Lead content type with fields for id, user relation, page relation, name, phone, email, message, and createdAt
5. THE Strapi Backend SHALL define an Analytics content type with fields for page relation, totalSales, totalOrders, totalCustomers, totalLeads, dailySales (JSON), monthlySales (JSON), topProducts (JSON), and recentPurchases (JSON)
6. THE Strapi Backend SHALL support relationships between content types (User has many Pages, Page has many Purchases and Leads, Page has one Analytics)

### Requirement 3

**User Story:** As a developer, I want to migrate all Express route handlers to SvelteKit API routes, so that all existing endpoints remain functional.

#### Acceptance Criteria

1. WHEN a legacy GET endpoint exists, THE SvelteKit App SHALL create an equivalent +server.js file with a GET handler in the appropriate src/routes/api/ directory
2. WHEN a legacy POST endpoint exists, THE SvelteKit App SHALL create an equivalent +server.js file with a POST handler in the appropriate src/routes/api/ directory
3. WHEN a legacy PUT endpoint exists, THE SvelteKit App SHALL create an equivalent +server.js file with a PUT handler in the appropriate src/routes/api/ directory
4. WHEN a legacy DELETE endpoint exists, THE SvelteKit App SHALL create an equivalent +server.js file with a DELETE handler in the appropriate src/routes/api/ directory
5. THE SvelteKit App SHALL maintain the same request/response structure for all migrated endpoints to ensure backward compatibility

### Requirement 4

**User Story:** As a developer, I want to extract reusable server-side logic into modules, so that the codebase is maintainable and follows best practices.

#### Acceptance Criteria

1. THE SvelteKit App SHALL create an htmlGenerator.js module in src/lib/server/ containing all HTML generation functions from the Legacy System
2. THE SvelteKit App SHALL create a strapi.js module in src/lib/server/ containing the Strapi SDK client and helper functions for CRUD operations on all content types
3. THE SvelteKit App SHALL create a dataExtractor.js module in src/lib/server/ containing functions for extracting contact info, products, and metadata from HTML
4. THE SvelteKit App SHALL create a pageProcessor.js module in src/lib/server/ containing functions for injecting scripts, fixing WhatsApp code, and processing page content
5. THE SvelteKit App SHALL create an imageUpload.js module in src/lib/server/ containing functions for handling image uploads to Strapi media library
6. WHEN any API route needs to perform these operations, THE system SHALL import and use the appropriate module functions

### Requirement 5

**User Story:** As a developer, I want to migrate frontend HTML pages to Svelte components, so that the UI is built with modern reactive patterns.

#### Acceptance Criteria

1. WHEN a legacy HTML page exists in the public directory, THE SvelteKit App SHALL create an equivalent +page.svelte file in src/routes/
2. THE SvelteKit App SHALL use Svelte 5 Runes ($state, $derived, $effect) for all reactive state management in components
3. WHEN a page requires data from the API, THE SvelteKit App SHALL use +page.server.js load functions to fetch data server-side
4. THE SvelteKit App SHALL preserve all existing UI functionality including the page creator, marketplace, admin panels, and management interfaces
5. THE SvelteKit App SHALL maintain the same URL structure for all pages to ensure existing links continue to work

### Requirement 6

**User Story:** As a platform user, I want to create pages using the page creator, so that I can build landing pages without coding.

#### Acceptance Criteria

1. WHEN a user accesses the page creator, THE SvelteKit App SHALL display the visual page builder interface with template selection
2. WHEN a user selects a template, THE system SHALL load the template HTML and allow customization
3. WHEN a user saves a page, THE system SHALL process the HTML content, extract metadata, and save the complete page record to Strapi Backend
4. WHEN a page is created, THE system SHALL detect the page type (store, event, serviceProvider, messageInBottle, course, workshop, restaurantMenu) and inject appropriate scripts into the HTML content
5. THE system SHALL support image uploads and store them in the Strapi Backend media library

### Requirement 7

**User Story:** As a platform user, I want to view and manage my created pages, so that I can track their performance and make updates.

#### Acceptance Criteria

1. WHEN a user requests their pages, THE system SHALL query Strapi Backend for all pages belonging to that userId
2. WHEN displaying pages, THE system SHALL show metadata including pageType, description, contact info, and activity status
3. WHEN a user updates a page, THE system SHALL process the new HTML content, extract updated metadata, and update the page record in Strapi Backend
4. WHEN a user deletes a page, THE system SHALL delete the page record and all associated data (purchases, leads, analytics) from Strapi Backend
5. THE system SHALL maintain referential integrity by cascading deletes to related records when a page is deleted

### Requirement 8

**User Story:** As a visitor, I want to browse the marketplace, so that I can discover active pages from various users.

#### Acceptance Criteria

1. WHEN a visitor accesses the marketplace, THE system SHALL query Strapi Backend for all pages where isActive is true
2. WHEN displaying marketplace pages, THE system SHALL show page title, description, pageType, contact info, and preview
3. WHEN a visitor searches the marketplace, THE system SHALL filter pages by keywords matching title, description, or pageType
4. THE system SHALL support filtering marketplace pages by pageType (store, event, serviceProvider, etc.)
5. THE system SHALL display marketplace pages in a responsive grid layout with pagination

### Requirement 9

**User Story:** As a store owner, I want customers to purchase products from my page, so that I can sell items online.

#### Acceptance Criteria

1. WHEN a customer adds a product to cart on a store page, THE system SHALL track the cart state in browser localStorage
2. WHEN a customer completes checkout, THE system SHALL create a Purchase record in Strapi Backend with all order details
3. WHEN a purchase is created, THE system SHALL update the analytics data including totalSales, dailySales, and monthlySales
4. WHEN a store owner views their purchases, THE system SHALL query Strapi Backend for all purchases associated with their page
5. THE system SHALL support purchase status updates (processing, shipped, delivered) and track status change timestamps

### Requirement 10

**User Story:** As a service provider, I want to receive lead submissions from my page, so that potential customers can contact me.

#### Acceptance Criteria

1. WHEN a visitor submits a lead form on a page, THE system SHALL create a Lead record in Strapi Backend with the form data
2. WHEN a lead is submitted, THE system SHALL increment the totalLeads counter in the page's analytics
3. WHEN a page owner views their leads, THE system SHALL query Strapi Backend for all leads associated with their page
4. THE system SHALL support lead forms on all page types including messageInBottle pages
5. THE system SHALL validate required fields (name, phone or email) before accepting lead submissions

### Requirement 11

**User Story:** As a developer, I want to migrate the legacy file-based data to Strapi, so that all existing data is preserved in the new database.

#### Acceptance Criteria

1. WHEN the migration script runs, THE system SHALL read the existing database.json file and import all users into Strapi Backend
2. WHEN the migration script runs, THE system SHALL scan the output directory, read all HTML files and metadata, and import complete page records into Strapi Backend
3. WHEN the migration script runs, THE system SHALL import all purchases from page data directories into Strapi Backend with proper page and user relations
4. WHEN the migration script runs, THE system SHALL import all leads from page data directories into Strapi Backend with proper page and user relations
5. WHEN the migration completes, THE system SHALL verify data integrity by comparing record counts between the legacy system and Strapi Backend

### Requirement 12

**User Story:** As a visitor, I want to view user-created pages, so that I can see their content and interact with features.

#### Acceptance Criteria

1. WHEN a visitor requests a page at /pages/:slug, THE SvelteKit App SHALL query Strapi Backend for the page record and render the HTML content dynamically
2. WHEN serving HTML pages, THE system SHALL ensure DOCTYPE is present to prevent rendering issues
3. WHEN serving HTML pages, THE system SHALL clean duplicate content and remove any text after the closing html tag
4. THE system SHALL serve images from the Strapi Backend media library with proper URLs
5. THE system SHALL support serving clean pages without editor tools at /view/:slug

### Requirement 13

**User Story:** As a developer, I want to extract page data from HTML, so that metadata can be automatically populated.

#### Acceptance Criteria

1. WHEN a page is saved, THE system SHALL extract contact information (phone, email, city, address) from the HTML content
2. WHEN a page is saved, THE system SHALL extract product information (name, price, image) from product cards in the HTML
3. WHEN a page is saved, THE system SHALL extract the page description from meta tags
4. THE system SHALL use multiple selector strategies to find products including .product-card, [class*="product"], and semantic HTML elements
5. THE system SHALL store extracted metadata in Strapi Backend for search and filtering purposes

### Requirement 14

**User Story:** As a developer, I want to inject necessary scripts into pages, so that features like cart, checkout, and data extraction work correctly.

#### Acceptance Criteria

1. WHEN a store, course, or restaurantMenu page is saved, THE system SHALL inject the store-checkout.js script before the closing body tag
2. WHEN any page is saved, THE system SHALL inject the universal data extractor script for bot integration
3. WHEN an event page is saved, THE system SHALL fix WhatsApp integration code to ensure proper functionality
4. THE system SHALL skip script injection for template-based stores that have built-in cart systems
5. THE system SHALL inject a meta tag with page-type attribute to ensure reliable page type detection

### Requirement 15

**User Story:** As a platform user, I want to manage appointments on my service provider page, so that customers can book time slots.

#### Acceptance Criteria

1. WHEN a serviceProvider page is created, THE system SHALL support appointment booking functionality
2. WHEN a customer books an appointment, THE system SHALL create a Lead record with appointment details
3. THE system SHALL support calendar integration for displaying available time slots
4. THE system SHALL allow service providers to view and manage their appointment bookings
5. THE system SHALL support appointment status updates (pending, confirmed, completed, cancelled)

### Requirement 16

**User Story:** As a developer, I want to maintain API compatibility, so that existing integrations continue to work during the transition.

#### Acceptance Criteria

1. THE SvelteKit App SHALL provide URL redirects from legacy patterns (/pages/:userId/:fileName) to new patterns (/pages/:slug)
2. THE SvelteKit App SHALL maintain the same API request/response formats for all endpoints to ensure client compatibility
3. THE SvelteKit App SHALL use slug-based URLs for pages derived from page title and userId
4. THE SvelteKit App SHALL support both legacy and new URL patterns during a transition period
5. WHEN external systems query the API, THE responses SHALL match the format expected by those systems

### Requirement 17

**User Story:** As a page owner, I want distinct management interfaces for each page type, so that I can manage my content with tools specific to my business model.

#### Acceptance Criteria

1. WHEN a user clicks "Manage" on a store page, THE system SHALL load the Inventory & Order Manager interface with product management and order tracking
2. WHEN a user clicks "Manage" on a service page, THE system SHALL load the Appointment/Queue Manager interface with calendar and booking management
3. WHEN a user clicks "Manage" on an event page, THE system SHALL load the Guest List/RSVP Manager interface with attendee tracking and RSVP status
4. WHEN a user clicks "Manage" on a standard page, THE system SHALL load the Leads Manager interface with contact form submissions
5. THE system SHALL route to the appropriate management interface based on the pageType field from Strapi Backend
6. WHEN a user clicks "Manage" on a course page, THE system SHALL load the Student & Purchase Manager interface with enrollment tracking
7. WHEN a user clicks "Manage" on a messageInBottle page, THE system SHALL load the Messages Manager interface with received messages

### Requirement 18

**User Story:** As a platform user, I want to create artist pages, business cards, and portfolio pages, so that I can showcase my work and personal brand.

#### Acceptance Criteria

1. WHEN a user selects the "Artist Page" template, THE system SHALL generate a page with biography, gallery, and contact sections
2. WHEN a user selects the "Business Card" template, THE system SHALL generate a digital vCard with photo, name, title, and contact buttons
3. WHEN a user selects the "Portfolio/Image Gallery" template, THE system SHALL generate a page with image grid and project showcase
4. THE system SHALL detect pageType as "artist", "businessCard", or "portfolio" based on template selection
5. THE system SHALL support image uploads for gallery and portfolio pages with proper media library integration

### Requirement 19

**User Story:** As a marketplace visitor, I want to interact with Stav Bot in full-screen mode with voice capabilities, so that I can search for pages naturally using text or voice.

#### Acceptance Criteria

1. WHEN a visitor clicks the Stav Bot button, THE system SHALL open a full-screen modal overlay covering the entire viewport
2. WHEN Stav Bot responds, THE system SHALL use Google Text-to-Speech API to speak the response aloud
3. WHEN a visitor types a message, THE system SHALL process natural language queries and return relevant page results
4. THE system SHALL display the full-screen modal with z-index 9999 to ensure it appears above all other content
5. WHEN a visitor closes the bot, THE system SHALL return to the previous view without page reload
6. THE system SHALL support voice input using browser Speech Recognition API for hands-free interaction
7. THE system SHALL maintain conversation context across multiple messages in the same session
