# Implementation Plan - השלמת זהות מלאה בין המערכות

## Phase 1: Core Infrastructure Setup

- [x] 1. Create Strapi Content Types


- [x] 1.1 Create Appointment content type in Strapi


  - Create schema.json with all required fields
  - Add relations to page
  - Configure permissions
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.2 Create Subscription content type in Strapi


  - Create schema.json with status, dates, plan fields
  - Add relations to user and page
  - Configure permissions
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 1.3 Update Analytic content type in Strapi


  - Add eventType, eventData, timestamp fields
  - Add source and amount fields
  - Configure permissions
  - _Requirements: 2.1, 2.2, 2.3_

## Phase 2: Client Appointment Booking

- [x] 2. Implement appointment creation from client side


- [x] 2.1 Create POST /api/appointments endpoint


  - Accept pageId, customerName, customerPhone, date, time, service, notes
  - Validate all required fields
  - Create appointment in Strapi
  - Return appointment ID and status
  - _Requirements: 1.1, 1.2, 1.3_


- [x] 2.2 Create AppointmentBookingForm component

  - Build form with all required fields
  - Add date and time pickers
  - Add service selection dropdown
  - Implement form validation
  - Handle submission and show success/error messages
  - _Requirements: 1.1, 1.5_


- [x] 2.3 Integrate appointment form into service page template

  - Add appointment form to service page HTML
  - Style form to match page design
  - Test form submission flow
  - _Requirements: 1.1, 1.4_

## Phase 3: Analytics System

- [ ] 3. Build complete analytics system
- [ ] 3.1 Create GET /api/analytics endpoint
  - Fetch all analytics from Strapi
  - Calculate totalPages, totalViews, totalLeads, totalSales, totalRevenue
  - Return aggregated statistics
  - _Requirements: 2.4, 2.6_

- [ ] 3.2 Create GET /api/analytics/page/[pageId] endpoint
  - Fetch analytics for specific page
  - Calculate views, leads, sales, revenue
  - Group data by date for charts
  - Group leads by source
  - _Requirements: 2.4, 2.5_

- [ ] 3.3 Create POST /api/analytics/track endpoint
  - Accept pageId, eventType, data
  - Create analytic record in Strapi
  - Store timestamp automatically
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.4 Create AnalyticsDashboard component
  - Display stat cards for views, leads, sales, revenue
  - Add chart for views by date
  - Add breakdown by lead source
  - Fetch data on mount
  - _Requirements: 2.4_

- [ ] 3.5 Integrate analytics tracking into pages
  - Track page views on load
  - Track lead submissions
  - Track purchase completions
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.6 Add analytics dashboard to manage interface
  - Add analytics tab to page management
  - Display AnalyticsDashboard component
  - Add date range filter
  - _Requirements: 2.4, 2.5_

## Phase 4: Subscription Management

- [ ] 4. Implement subscription system
- [ ] 4.1 Create POST /api/subscription/activate endpoint
  - Accept userId, pageId, plan, duration
  - Calculate end date based on duration
  - Create subscription in Strapi
  - Mark page as active
  - _Requirements: 3.1, 3.2_

- [ ] 4.2 Create POST /api/subscription/deactivate endpoint
  - Accept subscriptionId
  - Update subscription status to cancelled
  - Set end date to now
  - _Requirements: 3.3_

- [ ] 4.3 Create GET /api/subscription/check/[pageId] endpoint
  - Query subscriptions for page
  - Filter by active status
  - Return boolean and subscription details
  - _Requirements: 3.6_

- [ ] 4.4 Create SubscriptionManager component
  - Display current subscription status
  - Add activate subscription button with plan selection
  - Add deactivate subscription button
  - Show subscription details (dates, plan)
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 4.5 Add subscription check to page viewing
  - Check subscription status before displaying page
  - Show "subscription required" message for inactive pages
  - Allow page owner to bypass check
  - _Requirements: 3.5_

- [ ] 4.6 Add subscription expiry automation
  - Create cron job or scheduled task
  - Check for expired subscriptions daily
  - Mark pages as inactive when subscription expires
  - _Requirements: 3.4_

## Phase 5: Restaurant Template

- [ ] 5. Create restaurant template
- [x] 5.1 Create restaurant.js template definition


  - Define all sections (basic, menu, hours, delivery)
  - Define all fields with types and validation
  - Define design styles
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [x] 5.2 Create restaurant.html template

  - Build HTML structure for restaurant page
  - Add header with logo, title, description, contact
  - Add menu sections with categories
  - Add menu items with images, prices, dietary icons
  - Add opening hours section
  - Add delivery information section
  - Style with CSS
  - _Requirements: 4.6_

- [x] 5.3 Add restaurant template to template selector


  - Import restaurant template
  - Add to templates object
  - Test template selection
  - _Requirements: 9.7_

- [x] 5.4 Create RestaurantForm component


  - Build dynamic form for restaurant fields
  - Add repeater for categories and menu items
  - Add image uploaders for logo and menu items
  - Add dietary checkboxes
  - _Requirements: 4.2, 4.3_

- [ ] 5.5 Test restaurant page creation end-to-end
  - Create restaurant page with sample data
  - Verify all fields are saved
  - Verify page renders correctly
  - Test on mobile devices
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

## Phase 6: Workshop Template

- [x] 6. Create workshop template


- [x] 6.1 Create workshop.js template definition


  - Define all sections (basic, details, pricing, content)
  - Define all fields with types and validation
  - Define design styles
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6.2 Create workshop.html template


  - Build HTML structure for workshop page
  - Add header with title, instructor, image
  - Add workshop details (date, time, platform, location)
  - Add pricing section with early bird option
  - Add topics, requirements, materials sections
  - Add registration form
  - Style with CSS
  - _Requirements: 5.6_

- [x] 6.3 Add workshop template to template selector



  - Import workshop template
  - Add to templates object
  - Test template selection
  - _Requirements: 9.8_


- [x] 6.4 Create WorkshopForm component



  - Build dynamic form for workshop fields
  - Add date and time pickers
  - Add platform dropdown
  - Add pricing fields with early bird option
  - Add textarea for topics, requirements, materials
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 6.5 Implement participant limit check

  - Track number of registrations
  - Compare with maxParticipants
  - Show "fully booked" message when limit reached
  - _Requirements: 5.6_


- [x] 6.6 Test workshop page creation end-to-end


  - Create workshop page with sample data
  - Verify all fields are saved
  - Verify page renders correctly
  - Test registration flow
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

## Phase 7: Dynamic Services Update

- [ ] 7. Implement dynamic services update
- [x] 7.1 Create PUT /api/services/[pageId] endpoint

  - Accept array of service objects
  - Validate service structure
  - Update page services in Strapi
  - Return updated services
  - _Requirements: 6.1, 6.2, 6.3_


- [x] 7.2 Create ServicesEditor component


  - Display current services list
  - Add "Add Service" button
  - Add "Edit Service" button for each service
  - Add "Delete Service" button for each service
  - Implement service form with name, description, price, duration
  - _Requirements: 6.1, 6.2_

- [x] 7.3 Add services editor to service page management



  - Add services tab to manage interface
  - Display ServicesEditor component
  - Save changes to API
  - _Requirements: 6.3, 6.4_

- [x] 7.4 Update service page template to use dynamic services



  - Fetch services from page data
  - Render services dynamically
  - Update when services change
  - _Requirements: 6.4, 6.5_

## Phase 8: Quick HTML Generation


- [ ] 8. Implement quick HTML generation
- [x] 8.1 Create POST /api/generate-html endpoint


  - Accept text prompt
  - Generate basic HTML structure
  - Include DOCTYPE, meta tags, RTL support
  - Incorporate prompt into title and content
  - Apply basic styling
  - Return generated HTML

  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 8.2 Create QuickHTMLGenerator component

  - Add text input for prompt
  - Add "Generate" button
  - Show loading state
  - Display generated HTML preview
  - Add "Save Page" button
  - _Requirements: 7.1_

- [x] 8.3 Add quick HTML option to page creator



  - Add "Quick HTML" button to template selector
  - Show QuickHTMLGenerator component
  - Save generated page to Strapi
  - _Requirements: 7.1, 7.5_

## Phase 9: API Parity Verification

- [ ] 9. Verify all legacy endpoints have equivalents
- [ ] 9.1 Create API comparison checklist
  - List all legacy Express endpoints
  - List all new SvelteKit endpoints
  - Mark equivalent endpoints
  - Identify missing endpoints
  - _Requirements: 8.1_

- [ ] 9.2 Test parameter compatibility
  - Test each endpoint with legacy parameters
  - Verify new endpoints accept same parameters
  - Document any parameter changes
  - _Requirements: 8.2_

- [ ] 9.3 Test response format compatibility
  - Compare response formats
  - Verify data structure matches
  - Document any format changes
  - _Requirements: 8.3_

- [ ] 9.4 Test action equivalence
  - Verify each endpoint performs same action
  - Check side effects match
  - Test error scenarios
  - _Requirements: 8.4_

- [ ] 9.5 Standardize error responses
  - Ensure all endpoints use same error format
  - Add consistent error messages
  - Test error handling
  - _Requirements: 8.5_

## Phase 10: Management Interface Completion

- [ ] 10. Complete all management interfaces
- [ ] 10.1 Verify AppointmentQueueManager is complete
  - Test filtering appointments
  - Test status updates
  - Test appointment details view
  - _Requirements: 10.1_

- [ ] 10.2 Verify InventoryOrderManager is complete
  - Test order listing
  - Test status tracking
  - Test customer details display
  - _Requirements: 10.2_

- [ ] 10.3 Verify GuestListRSVPManager is complete
  - Test RSVP listing
  - Test attendance status updates
  - Test guest details display
  - _Requirements: 10.4_

- [ ] 10.4 Verify MessagesManager is complete
  - Test message listing
  - Test sender details display
  - Test message filtering
  - _Requirements: 10.6_

- [ ] 10.5 Verify DaySettingsManager is complete
  - Test working hours configuration
  - Test break times configuration
  - Test closed days configuration
  - _Requirements: 10.7_

- [ ] 10.6 Add analytics to all management interfaces
  - Add analytics dashboard to each manager
  - Show relevant metrics for each data type
  - Add export functionality
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

## Phase 11: Testing & Quality Assurance

- [ ] 11. Comprehensive testing
- [ ] 11.1 Write unit tests for appointment endpoints
  - Test POST /api/appointments
  - Test GET /api/appointments/[pageId]
  - Test PUT /api/appointments/[appointmentId]/status
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 11.2 Write unit tests for analytics endpoints
  - Test GET /api/analytics
  - Test GET /api/analytics/page/[pageId]
  - Test POST /api/analytics/track
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 11.3 Write unit tests for subscription endpoints
  - Test POST /api/subscription/activate
  - Test POST /api/subscription/deactivate
  - Test GET /api/subscription/check/[pageId]
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 11.4 Write component tests
  - Test AppointmentBookingForm
  - Test AnalyticsDashboard
  - Test SubscriptionManager
  - Test ServicesEditor
  - Test QuickHTMLGenerator
  - _Requirements: All_

- [ ] 11.5 Perform integration testing
  - Test appointment creation flow end-to-end
  - Test analytics tracking and display flow
  - Test subscription activation and checking flow
  - Test restaurant page creation flow
  - Test workshop page creation flow
  - _Requirements: All_

- [ ] 11.6 Perform manual testing
  - Test all features on desktop
  - Test all features on mobile
  - Test all features on different browsers
  - Test error scenarios
  - Test edge cases
  - _Requirements: All_

## Phase 12: Documentation & Deployment

- [ ] 12. Final documentation and deployment
- [ ] 12.1 Update API documentation
  - Document all new endpoints
  - Add request/response examples
  - Document error codes
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12.2 Write user documentation
  - Document how to create appointments
  - Document how to view analytics
  - Document how to manage subscriptions
  - Document how to create restaurant pages
  - Document how to create workshop pages
  - _Requirements: All_

- [ ] 12.3 Create migration guide
  - Document differences from legacy system
  - Provide migration steps for existing users
  - Document any breaking changes
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 12.4 Deploy to staging environment
  - Build and deploy Strapi backend
  - Build and deploy SvelteKit frontend
  - Configure environment variables
  - Test deployment
  - _Requirements: All_

- [ ] 12.5 Perform production deployment
  - Deploy to production servers
  - Run database migrations
  - Verify all features work
  - Monitor for errors
  - _Requirements: All_

- [ ] 12.6 Set up monitoring and alerts
  - Configure logging
  - Set up error tracking
  - Configure performance monitoring
  - Set up alerts for critical issues
  - _Requirements: All_

## Summary

This implementation plan covers all missing features from the legacy system:

- ✅ Client appointment booking (Phase 2)
- ✅ Complete analytics system (Phase 3)
- ✅ Subscription management (Phase 4)
- ✅ Restaurant template (Phase 5)
- ✅ Workshop template (Phase 6)
- ✅ Dynamic services update (Phase 7)
- ✅ Quick HTML generation (Phase 8)
- ✅ API parity verification (Phase 9)
- ✅ Complete management interfaces (Phase 10)
- ✅ Comprehensive testing (Phase 11)
- ✅ Documentation and deployment (Phase 12)

**Estimated Timeline:** 6-8 weeks for complete implementation
**Priority:** High - Critical for feature parity
**Dependencies:** Strapi backend, SvelteKit frontend, Supabase auth
