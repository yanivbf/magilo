# Requirements Document - השלמת זהות מלאה בין המערכות

## Introduction

מסמך זה מגדיר את הדרישות להשלמת העברה מלאה של כל התכונות מהמערכת הישנה (Express) למערכת החדשה (SvelteKit + Strapi). המטרה היא להבטיח שהמערכת החדשה תהיה קופי מדויק של הישנה במכניקה, עם כל התכונות והפונקציונליות.

## Glossary

- **System**: המערכת החדשה המבוססת על SvelteKit + Strapi
- **Legacy System**: המערכת הישנה המבוססת על Express + JSON files
- **Feature Parity**: זהות מלאה בתכונות בין שתי המערכות
- **API Endpoint**: נקודת קצה לשירות REST API
- **Template**: תבנית לסוג דף (חנות, שירות, אירוע וכו')
- **Component**: קומפוננטת Svelte לממשק משתמש
- **Strapi**: מערכת ניהול תוכן headless CMS
- **Client**: לקוח שמבקר בדף שנוצר
- **Page Owner**: בעל הדף שיצר אותו במערכת

## Requirements

### Requirement 1: יצירת תור מהלקוח

**User Story:** As a client visiting a service provider page, I want to book an appointment directly from the page, so that I can schedule a service without contacting the owner manually.

#### Acceptance Criteria

1. WHEN a client submits an appointment form with valid details THEN the System SHALL create a new appointment record in Strapi
2. WHEN an appointment is created THEN the System SHALL store customer name, phone, date, time, service type, and notes
3. WHEN an appointment is successfully created THEN the System SHALL return the appointment ID and confirmation status
4. WHEN the page owner views their appointments THEN the System SHALL display all pending appointments with client details
5. WHEN an appointment form is submitted with missing required fields THEN the System SHALL reject the request and return validation errors

### Requirement 2: מערכת אנליטיקה מלאה

**User Story:** As a page owner, I want to track views, leads, sales, and revenue for my pages, so that I can measure performance and make data-driven decisions.

#### Acceptance Criteria

1. WHEN a page is viewed THEN the System SHALL increment the view counter for that page
2. WHEN a lead is submitted THEN the System SHALL increment the lead counter and track the lead source
3. WHEN a purchase is completed THEN the System SHALL increment the sales counter and add to total revenue
4. WHEN a page owner requests analytics THEN the System SHALL return aggregated statistics including views, leads, sales, and revenue
5. WHEN analytics are requested for a specific time period THEN the System SHALL filter data by the specified date range
6. WHEN analytics are requested for all pages THEN the System SHALL return aggregated data across all pages in the system

### Requirement 3: ניהול מנויים לדפים

**User Story:** As a page owner, I want to activate and manage subscriptions for my pages, so that my pages remain active and accessible to visitors.

#### Acceptance Criteria

1. WHEN a page owner activates a subscription THEN the System SHALL create a subscription record with start date, end date, and plan type
2. WHEN a subscription is activated THEN the System SHALL mark the associated page as active
3. WHEN a page owner deactivates a subscription THEN the System SHALL update the subscription status to cancelled
4. WHEN a subscription expires THEN the System SHALL automatically mark the page as inactive
5. WHEN a visitor accesses an inactive page THEN the System SHALL display a subscription required message
6. WHEN checking subscription status THEN the System SHALL return whether the page has an active subscription

### Requirement 4: תבנית מסעדה

**User Story:** As a restaurant owner, I want to create a digital menu page with categories, dishes, prices, and images, so that customers can view my menu online.

#### Acceptance Criteria

1. WHEN creating a restaurant page THEN the System SHALL provide fields for restaurant name, description, logo, phone, address, and city
2. WHEN adding menu items THEN the System SHALL allow organizing items into categories with names
3. WHEN adding a dish THEN the System SHALL store dish name, description, price, image, and dietary flags (vegan, gluten-free)
4. WHEN setting opening hours THEN the System SHALL provide fields for each day of the week
5. WHEN configuring delivery THEN the System SHALL store delivery availability, fee, minimum order, and delivery areas
6. WHEN rendering the restaurant page THEN the System SHALL display all menu items organized by category with prices and images

### Requirement 5: תבנית סדנה

**User Story:** As a workshop instructor, I want to create a workshop registration page with details, schedule, and pricing, so that participants can learn about and register for my workshop.

#### Acceptance Criteria

1. WHEN creating a workshop page THEN the System SHALL provide fields for workshop title, description, instructor name, and bio
2. WHEN setting workshop details THEN the System SHALL store date, time, duration, platform, location, and maximum participants
3. WHEN configuring pricing THEN the System SHALL store regular price, early bird price, and early bird deadline
4. WHEN adding workshop content THEN the System SHALL store topics, requirements, and materials needed
5. WHEN a participant registers THEN the System SHALL create a lead record with participant details
6. WHEN maximum participants is reached THEN the System SHALL display a "fully booked" message

### Requirement 6: עדכון שירותים דינמי

**User Story:** As a service provider page owner, I want to update my list of services dynamically, so that I can add, remove, or modify services without recreating the entire page.

#### Acceptance Criteria

1. WHEN a page owner updates services THEN the System SHALL accept an array of service objects
2. WHEN services are updated THEN the System SHALL store service name, description, price, and duration for each service
3. WHEN services are updated THEN the System SHALL replace the existing services list with the new list
4. WHEN services are retrieved THEN the System SHALL return the current list of services for the page
5. WHEN a service is removed THEN the System SHALL no longer display it on the page

### Requirement 7: יצירת HTML מהיר

**User Story:** As a user, I want to generate a basic HTML page from a text prompt, so that I can quickly create simple pages without filling detailed forms.

#### Acceptance Criteria

1. WHEN a user submits a text prompt THEN the System SHALL generate basic HTML structure
2. WHEN HTML is generated THEN the System SHALL include proper DOCTYPE, meta tags, and RTL support
3. WHEN HTML is generated THEN the System SHALL incorporate the prompt text into the page title and content
4. WHEN HTML is generated THEN the System SHALL apply basic styling for readability
5. WHEN HTML generation fails THEN the System SHALL return an error message with details

### Requirement 8: בדיקת זהות API

**User Story:** As a developer, I want all Legacy System API endpoints to have equivalent endpoints in the new System, so that no functionality is lost during migration.

#### Acceptance Criteria

1. WHEN comparing API endpoints THEN the System SHALL provide equivalent functionality for all Legacy System endpoints
2. WHEN an endpoint accepts parameters THEN the System SHALL accept the same or equivalent parameters
3. WHEN an endpoint returns data THEN the System SHALL return data in the same or compatible format
4. WHEN an endpoint performs an action THEN the System SHALL perform the same action with the same side effects
5. WHEN an endpoint fails THEN the System SHALL return error messages in a consistent format

### Requirement 9: תמיכה בכל סוגי הדפים

**User Story:** As a page creator, I want access to all page templates that existed in the Legacy System, so that I can create any type of page I need.

#### Acceptance Criteria

1. WHEN selecting a template THEN the System SHALL offer all templates available in the Legacy System
2. WHEN creating a store page THEN the System SHALL provide all store-specific fields and features
3. WHEN creating a service page THEN the System SHALL provide all service-specific fields and features
4. WHEN creating an event page THEN the System SHALL provide all event-specific fields and features
5. WHEN creating a course page THEN the System SHALL provide all course-specific fields and features
6. WHEN creating a message page THEN the System SHALL provide all message-specific fields and features
7. WHEN creating a restaurant page THEN the System SHALL provide all restaurant-specific fields and features
8. WHEN creating a workshop page THEN the System SHALL provide all workshop-specific fields and features

### Requirement 10: ממשקי ניהול מלאים

**User Story:** As a page owner, I want comprehensive management interfaces for all data types, so that I can manage appointments, orders, leads, and other data efficiently.

#### Acceptance Criteria

1. WHEN managing appointments THEN the System SHALL display all appointments with filtering and status update capabilities
2. WHEN managing orders THEN the System SHALL display all orders with status tracking and customer details
3. WHEN managing leads THEN the System SHALL display all leads with contact information and status
4. WHEN managing guest lists THEN the System SHALL display all RSVPs with attendance status
5. WHEN managing inventory THEN the System SHALL display all products with stock levels
6. WHEN managing messages THEN the System SHALL display all messages with sender details
7. WHEN managing day settings THEN the System SHALL allow configuration of working hours, breaks, and closed days
