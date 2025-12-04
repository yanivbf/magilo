# Requirements Document - Legacy Feature Restoration

## Introduction

This specification defines the requirements for adding critical missing features to the new SvelteKit + Strapi application. The legacy system could create pages but lacked editing capabilities. Users report that products disappear, sections are missing, design is poor, and there's no editing toolbar. This spec will add comprehensive page editing, section management, image upload, and product management capabilities that were never implemented in either system.

## Glossary

- **Page Creator**: The interface where users create and edit pages
- **Section**: A modular component of a page (e.g., testimonials, gallery, products)
- **Strapi**: The headless CMS backend system
- **SvelteKit**: The frontend framework
- **Page Toolbar**: The editing interface that appears when viewing a page
- **Image Uploader**: Component for uploading images to sections
- **Product Manager**: Interface for managing store products

## Requirements

### Requirement 1: Page Editing Toolbar

**User Story:** As a page owner, I want to see an editing toolbar when viewing my page, so that I can quickly edit content, upload images, and manage sections.

#### Acceptance Criteria

1. WHEN a logged-in user views their own page THEN the system SHALL display a floating editing toolbar
2. WHEN the user clicks the edit button THEN the system SHALL navigate to the page editor
3. WHEN the user clicks the image upload button THEN the system SHALL open the image uploader modal
4. WHEN the user clicks the manage button THEN the system SHALL navigate to the management interface
5. THE toolbar SHALL be visible only to the page owner and SHALL not appear for visitors

### Requirement 2: Section Image Upload

**User Story:** As a page owner, I want to upload images to specific sections of my page, so that I can customize testimonials, galleries, and other visual content.

#### Acceptance Criteria

1. WHEN a user opens the image uploader THEN the system SHALL display all available sections that support images
2. WHEN a user selects a section THEN the system SHALL show the current images in that section
3. WHEN a user uploads an image to a section THEN the system SHALL save the image to Strapi and update the page data
4. WHEN a user deletes an image from a section THEN the system SHALL remove the image from Strapi and update the page data
5. THE system SHALL support multiple images per section for galleries

### Requirement 3: Product Management for Stores

**User Story:** As a store owner, I want to add, edit, and remove products from my online store, so that I can keep my inventory up to date.

#### Acceptance Criteria

1. WHEN a store owner accesses product management THEN the system SHALL display all current products
2. WHEN a store owner adds a new product THEN the system SHALL save the product to Strapi with name, price, description, and image
3. WHEN a store owner edits a product THEN the system SHALL update the product in Strapi
4. WHEN a store owner deletes a product THEN the system SHALL remove the product from Strapi
5. THE system SHALL immediately reflect product changes on the live store page

### Requirement 4: Section Management

**User Story:** As a page owner, I want to enable or disable sections on my page, so that I can control what content is displayed.

#### Acceptance Criteria

1. WHEN a user accesses section management THEN the system SHALL display all available sections for the page type
2. WHEN a user enables a section THEN the system SHALL add the section to the page and save to Strapi
3. WHEN a user disables a section THEN the system SHALL remove the section from the page and save to Strapi
4. WHEN a user reorders sections THEN the system SHALL update the section order in Strapi
5. THE system SHALL preserve section data when sections are disabled and re-enabled

### Requirement 5: Real-time Page Preview

**User Story:** As a page owner, I want to see changes to my page immediately after editing, so that I can verify my changes without refreshing.

#### Acceptance Criteria

1. WHEN a user saves changes to a page THEN the system SHALL update the page data in Strapi
2. WHEN page data is updated THEN the system SHALL invalidate the page cache
3. WHEN a user views the page after editing THEN the system SHALL display the updated content
4. THE system SHALL provide visual feedback during save operations
5. THE system SHALL handle save errors gracefully and inform the user

### Requirement 6: Image Gallery Management

**User Story:** As a page owner, I want to manage image galleries on my page, so that I can showcase multiple photos in an organized way.

#### Acceptance Criteria

1. WHEN a user uploads images to a gallery section THEN the system SHALL store all images in Strapi
2. WHEN a user reorders gallery images THEN the system SHALL update the image order in Strapi
3. WHEN a user deletes a gallery image THEN the system SHALL remove the image from Strapi
4. THE system SHALL support uploading multiple images at once
5. THE system SHALL display image thumbnails in the management interface

### Requirement 7: Testimonial Section with Images

**User Story:** As a page owner, I want to add customer testimonials with circular profile images, so that I can build trust with visitors.

#### Acceptance Criteria

1. WHEN a user adds a testimonial THEN the system SHALL save the testimonial text, customer name, and profile image to Strapi
2. WHEN a user uploads a testimonial image THEN the system SHALL crop or display the image in a circular format
3. WHEN a user edits a testimonial THEN the system SHALL update the testimonial data in Strapi
4. WHEN a user deletes a testimonial THEN the system SHALL remove the testimonial from Strapi
5. THE system SHALL display testimonials with circular images on the live page

### Requirement 8: Page Data Persistence

**User Story:** As a page owner, I want all my page edits to be saved permanently, so that I don't lose my work.

#### Acceptance Criteria

1. WHEN a user saves page changes THEN the system SHALL persist all data to Strapi
2. WHEN a user logs out and logs back in THEN the system SHALL retrieve all saved page data from Strapi
3. WHEN a user views their page THEN the system SHALL load the latest saved version from Strapi
4. THE system SHALL handle concurrent edits gracefully
5. THE system SHALL provide backup and restore capabilities

### Requirement 9: Subscription-Based Access

**User Story:** As a platform owner, I want to require active subscriptions for certain features, so that I can monetize the platform.

#### Acceptance Criteria

1. WHEN a user without a subscription attempts to publish a page THEN the system SHALL prompt them to purchase a subscription
2. WHEN a user with an active subscription publishes a page THEN the system SHALL allow the publication
3. WHEN a subscription expires THEN the system SHALL disable premium features but preserve page data
4. THE system SHALL check subscription status from Strapi
5. THE system SHALL provide clear messaging about subscription requirements

### Requirement 10: Legacy Data Migration

**User Story:** As a system administrator, I want to migrate existing pages from the legacy system to the new system, so that users don't lose their content.

#### Acceptance Criteria

1. WHEN the migration tool runs THEN the system SHALL extract all page data from the legacy system
2. WHEN page data is extracted THEN the system SHALL transform it to match the new Strapi schema
3. WHEN data is transformed THEN the system SHALL import it into Strapi
4. THE system SHALL migrate all images and upload them to Strapi
5. THE system SHALL provide a migration report showing success and failures
