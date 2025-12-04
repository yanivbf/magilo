# Implementation Plan - Legacy Feature Restoration

## Overview
This plan implements comprehensive page editing, section management, image upload, and product management features for the SvelteKit + Strapi application. Each task builds incrementally to create a complete editing experience.

## Tasks

- [x] 1. Set up Strapi schema extensions for sections and media



  - Create Section content type in Strapi with fields: type, enabled, order, data (JSON)
  - Create Product content type with fields: name, description, price, image, enabled, order
  - Add sections relation to Page content type (one-to-many)
  - Add products relation to Page content type (one-to-many)
  - Configure media library permissions for image uploads
  - _Requirements: 2.1, 3.1, 4.1, 8.1_

- [ ]* 1.1 Write property test for section data persistence
  - **Property 5: Image upload round-trip**
  - **Validates: Requirements 2.3, 8.1**

- [ ]* 1.2 Write property test for product data persistence
  - **Property 8: Product management round-trip**




  - **Validates: Requirements 3.1, 3.2**

- [ ] 2. Create PageEditToolbar component
  - [ ] 2.1 Create PageEditToolbar.svelte component with props: pageId, userId, isOwner
    - Add floating toolbar UI with edit, image upload, and manage buttons
    - Implement visibility logic (show only for page owner)
    - Add responsive design for mobile and desktop
    - Style with Tailwind CSS matching existing design
    - _Requirements: 1.1, 1.5_


  - [ ]* 2.2 Write property test for toolbar visibility
    - **Property 1: Toolbar visibility access control**
    - **Validates: Requirements 1.1, 1.5**

  - [ ] 2.3 Implement toolbar button handlers
    - Add handleEdit() to navigate to /page-creator with pageId
    - Add handleImageUpload() to open image uploader modal
    - Add handleManage() to navigate to /manage/[pageId]





    - Add loading states for all buttons
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 2.4 Write property test for navigation correctness
    - **Property 2: Navigation correctness**

    - **Validates: Requirements 1.2, 1.4**

- [x] 3. Integrate toolbar into page view

  - [x] 3.1 Update pages/[slug]/+page.svelte to include toolbar

    - Import PageEditToolbar component
    - Pass pageId, userId, and isOwner props
    - Position toolbar as fixed element at bottom of viewport
    - Ensure toolbar doesn't interfere with page content
    - _Requirements: 1.1_


  - [ ] 3.2 Add authentication check for toolbar display
    - Check if user is logged in via session
    - Compare logged-in user ID with page owner ID
    - Hide toolbar for non-owners and visitors
    - _Requirements: 1.5_


- [ ] 4. Create ImageUploader component
  - [ ] 4.1 Create ImageUploader.svelte modal component
    - Design modal UI with section selector and image grid
    - Add file input with drag-and-drop support
    - Display current images for selected section
    - Add image reordering functionality (drag-and-drop)
    - Add delete button for each image
    - Style with Tailwind CSS
    - _Requirements: 2.1, 2.2, 6.5_


  - [ ]* 4.2 Write property test for section image retrieval
    - **Property 4: Section image retrieval**
    - **Validates: Requirements 2.2**

  - [ ] 4.3 Implement image upload functionality
    - Create /api/upload-section-image/+server.js endpoint
    - Handle file validation (type, size)
    - Upload to Strapi media library
    - Update section data in Strapi with new image
    - Return image URL and ID

    - _Requirements: 2.3_

  - [ ]* 4.4 Write property test for multiple image support
    - **Property 7: Multiple image support**
    - **Validates: Requirements 2.5, 6.1, 6.4**

  - [ ] 4.5 Implement image deletion
    - Create /api/delete-section-image/+server.js endpoint


    - Remove image from Strapi media library
    - Update section data to remove image reference
    - Handle errors gracefully

    - _Requirements: 2.4, 6.3_


  - [ ]* 4.6 Write property test for deletion consistency
    - **Property 6: Deletion consistency**
    - **Validates: Requirements 2.4, 3.4, 6.3, 7.4**


  - [ ] 4.7 Implement image reordering
    - Add drag-and-drop handlers using svelte-dnd-action
    - Update section data with new image order
    - Save order to Strapi
    - _Requirements: 6.2_

  - [x]* 4.8 Write property test for reordering persistence

    - **Property 13: Reordering persistence**
    - **Validates: Requirements 4.4, 6.2**

- [ ] 5. Create ProductManager component
  - [ ] 5.1 Create ProductManager.svelte component
    - Design product list UI with add, edit, delete buttons
    - Create add/edit product modal with form fields
    - Display product cards with image, name, price, description
    - Add enable/disable toggle for each product
    - Style with Tailwind CSS

    - _Requirements: 3.1_

  - [ ] 5.2 Implement add product functionality
    - Create /api/products/+server.js POST endpoint
    - Validate product data (name, price required)

    - Upload product image to Strapi
    - Create product in Strapi linked to page
    - Return created product data
    - _Requirements: 3.2_

  - [ ] 5.3 Implement edit product functionality
    - Create /api/products/[productId]/+server.js PATCH endpoint
    - Update product fields in Strapi
    - Handle image replacement if new image uploaded
    - Return updated product data
    - _Requirements: 3.3_



  - [ ]* 5.4 Write property test for update persistence
    - **Property 9: Update persistence**
    - **Validates: Requirements 3.3, 7.3**

  - [ ] 5.5 Implement delete product functionality
    - Create /api/products/[productId]/+server.js DELETE endpoint

    - Remove product from Strapi
    - Delete associated image from media library
    - Return success response
    - _Requirements: 3.4_


  - [ ] 5.6 Implement real-time product updates
    - Use SvelteKit's invalidate() to refresh product data
    - Update product list immediately after changes
    - Show loading states during operations
    - _Requirements: 3.5_

  - [ ]* 5.7 Write property test for real-time reflection
    - **Property 10: Real-time reflection**
    - **Validates: Requirements 3.5**


- [ ] 6. Create SectionManager component
  - [ ] 6.1 Create SectionManager.svelte component
    - Design section list UI with enable/disable toggles
    - Show available sections based on page type
    - Add reorder functionality (drag-and-drop)
    - Display section preview/icon
    - Style with Tailwind CSS
    - _Requirements: 4.1_

  - [ ]* 6.2 Write property test for section type correctness
    - **Property 11: Section type correctness**
    - **Validates: Requirements 4.1**

  - [ ] 6.3 Implement section enable/disable
    - Create /api/sections/[sectionId]/toggle/+server.js endpoint
    - Update section enabled status in Strapi
    - Preserve section data when disabled
    - Return updated section data
    - _Requirements: 4.2, 4.3, 4.5_

  - [ ]* 6.4 Write property test for section enable/disable round-trip
    - **Property 12: Section enable/disable round-trip**
    - **Validates: Requirements 4.2, 4.3, 4.5**

  - [ ] 6.5 Implement section reordering
    - Create /api/sections/reorder/+server.js endpoint
    - Update section order values in Strapi
    - Maintain order consistency
    - _Requirements: 4.4_

- [ ] 7. Create TestimonialEditor component
  - [ ] 7.1 Create TestimonialEditor.svelte component
    - Design testimonial list UI
    - Create add/edit testimonial modal
    - Add circular image upload for profile photos
    - Display testimonials with customer name and text
    - Style with Tailwind CSS
    - _Requirements: 7.1_

  - [ ] 7.2 Implement testimonial CRUD operations
    - Create /api/testimonials/+server.js endpoints (POST, PATCH, DELETE)
    - Handle testimonial data (name, text, image)
    - Process circular image cropping/formatting
    - Link testimonials to page sections
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 7.3 Write property test for testimonial image format
    - **Property 23: Testimonial image format**
    - **Validates: Requirements 7.2**

- [ ] 8. Implement page data persistence
  - [ ] 8.1 Create /api/save-page-data/+server.js endpoint
    - Accept complete page data including sections
    - Validate data structure
    - Update page in Strapi
    - Update all related sections
    - Invalidate page cache
    - Return success response
    - _Requirements: 5.1, 8.1_

  - [ ]* 8.2 Write property test for cache invalidation
    - **Property 14: Cache invalidation**
    - **Validates: Requirements 5.2, 5.3**

  - [ ] 8.2 Implement error handling for save operations
    - Add try-catch blocks for all save operations
    - Display user-friendly error messages
    - Log errors for debugging
    - Preserve local changes on error
    - _Requirements: 5.5_

  - [ ]* 8.3 Write property test for error handling
    - **Property 15: Error handling**
    - **Validates: Requirements 5.5**

  - [ ] 8.3 Implement session persistence
    - Ensure all data is saved to Strapi (not localStorage)
    - Load page data from Strapi on page load
    - Handle user logout/login correctly
    - _Requirements: 8.2, 8.3_

  - [ ]* 8.4 Write property test for session persistence
    - **Property 16: Session persistence**
    - **Validates: Requirements 8.2, 8.3**

- [ ] 9. Implement subscription checks
  - [ ] 9.1 Create subscription checking middleware
    - Add subscription status field to User model in Strapi
    - Create /api/check-subscription/+server.js endpoint
    - Check subscription status before allowing publish
    - Return subscription status and expiry date
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ]* 9.2 Write property test for subscription access control
    - **Property 19: Subscription access control**
    - **Validates: Requirements 9.1, 9.2**

  - [ ] 9.2 Implement subscription prompts
    - Show subscription required modal when needed
    - Provide link to subscription purchase page
    - Disable premium features for expired subscriptions
    - Preserve page data even when subscription expires
    - _Requirements: 9.1, 9.3_

  - [ ]* 9.3 Write property test for subscription feature gating
    - **Property 20: Subscription feature gating**
    - **Validates: Requirements 9.3**

  - [ ]* 9.4 Write property test for subscription status verification
    - **Property 21: Subscription status verification**
    - **Validates: Requirements 9.4**

- [ ] 10. Create legacy data migration tool
  - [ ] 10.1 Create migration script at scripts/migrate-legacy-data.js
    - Read legacy data from localStorage/database
    - Transform data to match Strapi schema
    - Create pages in Strapi
    - Create sections for each page
    - Upload images to Strapi media library
    - Link all data correctly
    - Generate migration report
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 10.2 Write property test for migration data integrity
    - **Property 22: Migration data integrity**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [ ] 11. Update page rendering to use section data
  - [ ] 11.1 Update PageRenderer.svelte to load sections from Strapi
    - Fetch sections for current page
    - Render only enabled sections
    - Render sections in correct order
    - Display section images from Strapi
    - Handle missing sections gracefully
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ] 11.2 Update product display to use Strapi data
    - Fetch products for current page
    - Display only enabled products
    - Show products in correct order
    - Display product images from Strapi
    - Handle empty product list
    - _Requirements: 3.5_

  - [ ] 11.3 Update testimonial display
    - Fetch testimonials from section data
    - Display with circular profile images
    - Show in correct order
    - Handle empty testimonials
    - _Requirements: 7.5_

- [ ] 12. Add visual feedback and loading states
  - [ ] 12.1 Add loading spinners for all async operations
    - Show spinner during image upload
    - Show spinner during save operations
    - Show spinner during data fetching
    - Disable buttons during operations
    - _Requirements: 5.4_

  - [ ] 12.2 Add success/error toast notifications
    - Create Toast.svelte component
    - Show success message after save
    - Show error message on failure
    - Auto-dismiss after 3 seconds
    - _Requirements: 5.5_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Add documentation and user guide
  - Create user guide for page editing
  - Document image upload process
  - Document product management
  - Document section management
  - Add inline help tooltips
  - _Requirements: All_

- [ ] 15. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
