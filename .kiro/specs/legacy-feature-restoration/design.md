# Design Document - Legacy Feature Restoration

## Overview

This design document outlines the architecture and implementation strategy for restoring critical missing features from the legacy page creator system to the new SvelteKit + Strapi application. The design focuses on maintaining the user experience of the legacy system while leveraging the modern architecture of SvelteKit and Strapi.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   SvelteKit     │
│   Frontend      │
│                 │
│  ┌───────────┐  │
│  │ Page View │  │
│  │ Component │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │  Toolbar  │  │
│  │ Component │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼──────┐ │
│  │   Image    │ │
│  │  Uploader  │ │
│  └─────┬──────┘ │
│        │        │
│  ┌─────▼──────┐ │
│  │  Product   │ │
│  │  Manager   │ │
│  └────────────┘ │
└────────┬────────┘
         │
    HTTP/REST
         │
┌────────▼────────┐
│     Strapi      │
│     Backend     │
│                 │
│  ┌───────────┐  │
│  │   Pages   │  │
│  │   Model   │  │
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │  Sections │  │
│  │   Model   │  │
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │  Products │  │
│  │   Model   │  │
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │   Media   │  │
│  │  Library  │  │
│  └───────────┘  │
└─────────────────┘
```

### Component Architecture

1. **PageEditToolbar.svelte** - Floating toolbar for page editing
2. **ImageUploader.svelte** - Modal for uploading images to sections
3. **ProductManager.svelte** - Interface for managing store products
4. **SectionManager.svelte** - Interface for enabling/disabling sections
5. **TestimonialEditor.svelte** - Interface for managing testimonials

## Components and Interfaces

### PageEditToolbar Component

**Purpose**: Provides quick access to editing features when viewing a page

**Props**:
- `pageId: string` - The ID of the current page
- `userId: string` - The ID of the logged-in user
- `isOwner: boolean` - Whether the current user owns the page

**State**:
- `showToolbar: boolean` - Whether to display the toolbar
- `isLoading: boolean` - Loading state for operations

**Methods**:
- `handleEdit()` - Navigate to page editor
- `handleImageUpload()` - Open image uploader modal
- `handleManage()` - Navigate to management interface

### ImageUploader Component

**Purpose**: Allows users to upload images to specific page sections

**Props**:
- `pageId: string` - The ID of the page being edited
- `sections: Section[]` - Available sections that support images

**State**:
- `selectedSection: string | null` - Currently selected section
- `images: Image[]` - Current images in the selected section
- `uploading: boolean` - Upload in progress state

**Methods**:
- `selectSection(sectionId: string)` - Select a section to edit
- `uploadImage(file: File)` - Upload an image to the selected section
- `deleteImage(imageId: string)` - Delete an image from the section
- `reorderImages(newOrder: string[])` - Reorder images in a gallery

### ProductManager Component

**Purpose**: Manages products for online store pages

**Props**:
- `pageId: string` - The ID of the store page
- `products: Product[]` - Current products

**State**:
- `editingProduct: Product | null` - Product being edited
- `showAddModal: boolean` - Whether to show add product modal

**Methods**:
- `addProduct(product: Product)` - Add a new product
- `updateProduct(productId: string, updates: Partial<Product>)` - Update a product
- `deleteProduct(productId: string)` - Delete a product
- `uploadProductImage(file: File)` - Upload product image

## Data Models

### Page Model (Strapi)

```typescript
interface Page {
  id: string;
  userId: string;
  title: string;
  slug: string;
  pageType: string;
  content: PageContent;
  sections: Section[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Section Model

```typescript
interface Section {
  id: string;
  type: 'testimonials' | 'gallery' | 'products' | 'about' | 'contact';
  enabled: boolean;
  order: number;
  data: SectionData;
}

interface SectionData {
  images?: Image[];
  testimonials?: Testimonial[];
  products?: Product[];
  text?: string;
}
```

### Image Model

```typescript
interface Image {
  id: string;
  url: string;
  alt: string;
  order: number;
  sectionId: string;
}
```

### Product Model (Strapi)

```typescript
interface Product {
  id: string;
  pageId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  enabled: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Testimonial Model

```typescript
interface Testimonial {
  id: string;
  customerName: string;
  text: string;
  image: string; // Circular profile image
  order: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

Before defining properties, we identify and eliminate redundancy:

- Properties 2.3 and 8.1 both test persistence to Strapi - we can combine these into a general persistence property
- Properties 2.4, 3.4, 6.3, and 7.4 all test deletion - we can create a general deletion property
- Properties 3.3 and 7.3 both test updates - we can combine into a general update property
- Properties 4.2 and 4.3 test enable/disable which are inverse operations - we can test as a round-trip
- Properties 6.2 and 4.4 both test reordering - we can create a general reordering property

### Core Properties

Property 1: Toolbar visibility access control
*For any* page and user combination, the editing toolbar should be visible if and only if the user is the page owner
**Validates: Requirements 1.1, 1.5**

Property 2: Navigation correctness
*For any* toolbar button click (edit, manage), the system should navigate to the correct destination
**Validates: Requirements 1.2, 1.4**

Property 3: Modal opening
*For any* image upload button click, the image uploader modal should open and display available sections
**Validates: Requirements 1.3, 2.1**

Property 4: Section image retrieval
*For any* section selection, the system should display all current images for that section
**Validates: Requirements 2.2**

Property 5: Image upload round-trip
*For any* valid image file uploaded to a section, retrieving the section data should return the uploaded image
**Validates: Requirements 2.3, 8.1**

Property 6: Deletion consistency
*For any* entity (image, product, testimonial) that is deleted, subsequent queries should not return that entity
**Validates: Requirements 2.4, 3.4, 6.3, 7.4**

Property 7: Multiple image support
*For any* gallery section, uploading multiple images should result in all images being stored and retrievable
**Validates: Requirements 2.5, 6.1, 6.4**

Property 8: Product management round-trip
*For any* product added with name, price, description, and image, retrieving products should return the same data
**Validates: Requirements 3.1, 3.2**

Property 9: Update persistence
*For any* entity (product, testimonial, section) that is updated, retrieving the entity should return the updated values
**Validates: Requirements 3.3, 7.3**

Property 10: Real-time reflection
*For any* product change, the live store page should reflect the change without requiring a manual refresh
**Validates: Requirements 3.5**

Property 11: Section type correctness
*For any* page type, the section management interface should display only sections valid for that page type
**Validates: Requirements 4.1**

Property 12: Section enable/disable round-trip
*For any* section that is disabled and then re-enabled, the section data should be preserved
**Validates: Requirements 4.2, 4.3, 4.5**

Property 13: Reordering persistence
*For any* collection (sections, images, products) that is reordered, the new order should persist across page reloads
**Validates: Requirements 4.4, 6.2**

Property 14: Cache invalidation
*For any* page update, subsequent page views should not serve stale cached data
**Validates: Requirements 5.2, 5.3**

Property 15: Error handling
*For any* save operation that fails, the system should handle the error gracefully and inform the user
**Validates: Requirements 5.5**

Property 16: Session persistence
*For any* user who saves page data, logs out, and logs back in, all saved data should be retrievable
**Validates: Requirements 8.2, 8.3**

Property 17: Concurrent edit handling
*For any* two users editing the same page concurrently, the system should handle conflicts without data loss
**Validates: Requirements 8.4**

Property 18: Backup and restore round-trip
*For any* page that is backed up and then restored, the restored page should match the original
**Validates: Requirements 8.5**

Property 19: Subscription access control
*For any* user without an active subscription, attempting to publish should be blocked with a prompt
**Validates: Requirements 9.1, 9.2**

Property 20: Subscription feature gating
*For any* user whose subscription expires, premium features should be disabled but page data should be preserved
**Validates: Requirements 9.3**

Property 21: Subscription status verification
*For any* subscription check, the system should query Strapi for the current status
**Validates: Requirements 9.4**

Property 22: Migration data integrity
*For any* page migrated from the legacy system, all data (text, images, products) should be present in Strapi
**Validates: Requirements 10.1, 10.2, 10.3, 10.4**

Property 23: Testimonial image format
*For any* testimonial image uploaded, the image should be displayed in a circular format on the live page
**Validates: Requirements 7.2**

## Error Handling

### Upload Errors
- File size too large: Display error message with size limit
- Invalid file type: Display error message with accepted types
- Network failure: Retry with exponential backoff, show error after 3 attempts

### Save Errors
- Strapi API error: Display error message, preserve local changes
- Validation error: Highlight invalid fields, show specific error messages
- Concurrent edit conflict: Show conflict resolution UI

### Permission Errors
- Unauthorized access: Redirect to login
- Insufficient permissions: Display permission denied message
- Expired subscription: Show subscription renewal prompt

## Testing Strategy

### Unit Testing
- Test individual components in isolation
- Mock Strapi API responses
- Test error handling paths
- Test edge cases (empty data, large files, etc.)

### Property-Based Testing
- Use **fast-check** library for JavaScript/TypeScript property-based testing
- Configure each property test to run minimum 100 iterations
- Each property test must reference its corresponding design property using format: `**Feature: legacy-feature-restoration, Property {number}: {property_text}**`
- Generate random test data for:
  - User IDs and page ownership combinations
  - Image files of various sizes and types
  - Product data with different field combinations
  - Section configurations
  - Concurrent edit scenarios

### Integration Testing
- Test complete workflows (create page → edit → upload images → publish)
- Test Strapi integration with real API calls
- Test image upload and retrieval
- Test subscription checks

### End-to-End Testing
- Test user journeys from login to page publication
- Test cross-browser compatibility
- Test mobile responsiveness
- Test performance with large datasets

## Implementation Notes

### Image Upload Strategy
1. Use Strapi's built-in media library for image storage
2. Generate thumbnails on upload for performance
3. Store image metadata (alt text, order) in section data
4. Implement lazy loading for galleries

### Real-time Updates
1. Use SvelteKit's invalidation system to refresh data
2. Implement optimistic UI updates for better UX
3. Use WebSocket or polling for real-time product updates (future enhancement)

### Migration Strategy
1. Create migration script that reads from legacy database/localStorage
2. Transform data to match new Strapi schema
3. Upload images to Strapi media library
4. Create pages and sections in Strapi
5. Generate migration report with success/failure counts

### Performance Considerations
1. Implement pagination for large product lists
2. Use image CDN for faster loading
3. Cache section data on client side
4. Lazy load images in galleries
5. Debounce save operations to reduce API calls

### Security Considerations
1. Validate file types and sizes on both client and server
2. Sanitize user input to prevent XSS
3. Implement rate limiting for uploads
4. Verify user ownership before allowing edits
5. Use HTTPS for all API calls
