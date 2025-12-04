# Requirements Document

## Introduction

This specification addresses a critical architectural security concern: the current system stores raw HTML strings in the database, which poses security risks and violates modern content management best practices. The system must be refactored to store structured, secure content instead of raw HTML.

## Glossary

- **Strapi**: The headless CMS backend that stores all page data
- **Page Content**: The main content of a user-generated landing page
- **Rich Text / Blocks**: Strapi's structured content format that stores content as JSON blocks instead of raw HTML
- **Template Engine**: The server-side system that generates HTML from templates and data
- **SvelteKit Frontend**: The frontend application that renders pages to users
- **Content Security**: Protection against XSS attacks and malicious content injection

## Requirements

### Requirement 1

**User Story:** As a system architect, I want to store page content as structured data instead of raw HTML, so that the system is secure and maintainable.

#### Acceptance Criteria

1. WHEN page content is created THEN the system SHALL store it as structured JSON blocks in Strapi
2. WHEN page content is retrieved THEN the system SHALL convert structured blocks to safe HTML for rendering
3. WHEN malicious content is submitted THEN the system SHALL sanitize it through the structured format
4. THE system SHALL NOT store raw HTML strings in the database
5. THE system SHALL maintain backward compatibility with existing pages during migration

### Requirement 2

**User Story:** As a developer, I want the Strapi schema to use proper content types, so that content is validated and secure.

#### Acceptance Criteria

1. THE Strapi page schema SHALL use "richtext" or "blocks" type for the htmlContent field
2. WHEN content is saved to Strapi THEN Strapi SHALL validate the content structure
3. THE system SHALL reject improperly formatted content at the database level
4. THE schema SHALL support all current page types (store, event, service, etc.)

### Requirement 3

**User Story:** As a frontend developer, I want to render structured content safely, so that pages display correctly without security risks.

#### Acceptance Criteria

1. WHEN the frontend receives structured content THEN it SHALL convert it to HTML for display
2. THE rendering process SHALL escape all user-provided text content
3. THE system SHALL support all current template features (products, galleries, FAQs, etc.)
4. WHEN rendering fails THEN the system SHALL display a graceful fallback
5. THE rendered output SHALL be visually identical to the current system

### Requirement 4

**User Story:** As a system administrator, I want to migrate existing pages to the new format, so that all content is secure.

#### Acceptance Criteria

1. THE system SHALL provide a migration script for existing pages
2. WHEN migration runs THEN all existing HTML SHALL be converted to structured format
3. THE migration SHALL preserve all page functionality and appearance
4. WHEN migration completes THEN the system SHALL verify all pages render correctly
5. THE migration SHALL be reversible in case of issues

### Requirement 5

**User Story:** As a page creator, I want the page creation process to work seamlessly, so that I don't notice any changes.

#### Acceptance Criteria

1. WHEN I create a page with a template THEN the system SHALL generate structured content
2. THE page creation API SHALL accept the same inputs as before
3. THE generated pages SHALL look identical to the current system
4. WHEN I edit a page THEN the system SHALL update the structured content
5. THE system SHALL maintain all current features (products, services, appointments, etc.)
