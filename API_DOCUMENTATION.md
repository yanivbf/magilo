# API Documentation

Complete API reference for the SvelteKit + Strapi migration.

## Base URL

- **Development**: `http://localhost:5173/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Currently, the API does not require authentication for most endpoints. In production, you should add authentication middleware.

---

## Page Management

### Create Page

**POST** `/api/create-page`

Create a new page with HTML content and metadata.

**Request Body:**
```json
{
  "userId": "string (required)",
  "title": "string (required)",
  "htmlContent": "string (required)",
  "selectedPageType": "string (optional)",
  "metadata": "object (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "pageId": "1",
  "slug": "user123-my-page",
  "pageUrl": "/pages/user123-my-page",
  "message": "Page created successfully"
}
```

---

### Get User Pages

**GET** `/api/pages/[userId]`

Get all pages for a specific user.

**Response:**
```json
{
  "success": true,
  "pages": [
    {
      "id": "1",
      "title": "My Page",
      "slug": "user123-my-page",
      "pageType": "store",
      "description": "Page description",
      "isActive": false,
      "phone": "0501234567",
      "email": "user@example.com",
      "city": "Tel Aviv",
      "products": [],
      "createdAt": "2025-11-29T00:00:00.000Z",
      "analytics": {
        "totalSales": 0,
        "totalOrders": 0,
        "totalLeads": 0
      }
    }
  ],
  "count": 1
}
```

---

### Update Page

**PUT** `/api/update-page`

Update an existing page.

**Request Body:**
```json
{
  "pageId": "string (required)",
  "htmlContent": "string (optional)",
  "title": "string (optional)",
  "isActive": "boolean (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "pageId": "1",
  "message": "Page updated successfully"
}
```

---

### Delete Page

**DELETE** `/api/delete-page`

Delete a page (cascade deletes purchases, leads, analytics).

**Request Body:**
```json
{
  "pageId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Page deleted successfully"
}
```

---

### Upload Image

**POST** `/api/upload-image`

Upload an image to Strapi media library.

**Request:** `multipart/form-data`
- `image`: File (required)
- `userId`: string (required)
- `pageName`: string (optional, default: "general")

**Response:**
```json
{
  "success": true,
  "url": "http://localhost:1337/uploads/image_123.jpg",
  "id": "1",
  "message": "Image uploaded successfully"
}
```

---

## Marketplace

### Get Marketplace Pages

**GET** `/api/pages/all/marketplace`

Get all active pages for marketplace display.

**Query Parameters:**
- `search`: string (optional) - Search in title, description, pageType
- `pageType`: string (optional) - Filter by page type
- `page`: number (optional, default: 1) - Page number
- `pageSize`: number (optional, default: 25) - Items per page

**Response:**
```json
{
  "success": true,
  "pages": [
    {
      "id": "1",
      "title": "My Store",
      "slug": "user123-my-store",
      "pageType": "store",
      "description": "Best products",
      "phone": "0501234567",
      "city": "Tel Aviv",
      "products": [],
      "user": {
        "id": "1",
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "pageCount": 1,
    "total": 1
  }
}
```

---

## Purchases

### Create Purchase

**POST** `/api/purchase`

Create a new purchase.

**Request Body:**
```json
{
  "userId": "string (required)",
  "pageId": "string (required)",
  "products": "array (required)",
  "total": "number (required)",
  "paymentMethod": "string (required)",
  "customerName": "string (required)",
  "customerPhone": "string (required)",
  "customerEmail": "string (optional)",
  "customerAddress": "string (optional)",
  "shipping": "boolean (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "purchaseId": "1",
  "message": "Purchase created successfully"
}
```

---

### Get Page Purchases

**GET** `/api/purchases/[pageId]`

Get all purchases for a page.

**Response:**
```json
{
  "success": true,
  "purchases": [
    {
      "id": "1",
      "products": [
        {
          "name": "Product 1",
          "price": 100,
          "quantity": 1
        }
      ],
      "total": 100,
      "paymentMethod": "credit_card",
      "customerName": "Jane Doe",
      "customerPhone": "0501234567",
      "status": "pending",
      "createdAt": "2025-11-29T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Update Purchase Status

**PUT** `/api/purchase/[purchaseId]/status`

Update purchase status.

**Request Body:**
```json
{
  "status": "string (required: pending|processing|shipped|delivered|cancelled)",
  "statusText": "string (optional)",
  "driverId": "string (optional)",
  "driverName": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase status updated successfully"
}
```

---

## Leads

### Submit Lead

**POST** `/api/lead`

Submit a lead form.

**Request Body:**
```json
{
  "userId": "string (required)",
  "pageId": "string (required)",
  "name": "string (required)",
  "phone": "string (required if email not provided)",
  "email": "string (required if phone not provided)",
  "message": "string (optional)",
  "appointmentDate": "string (optional, ISO date)",
  "appointmentStatus": "string (optional, default: pending)"
}
```

**Response:**
```json
{
  "success": true,
  "leadId": "1",
  "message": "Lead submitted successfully"
}
```

---

### Get Page Leads

**GET** `/api/leads/[pageId]`

Get all leads for a page.

**Response:**
```json
{
  "success": true,
  "leads": [
    {
      "id": "1",
      "name": "John Doe",
      "phone": "0501234567",
      "email": "john@example.com",
      "message": "Interested in your services",
      "appointmentDate": null,
      "appointmentStatus": "pending",
      "createdAt": "2025-11-29T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Update Lead Status

**PUT** `/api/lead/[leadId]/status`

Update lead appointment status.

**Request Body:**
```json
{
  "appointmentStatus": "string (required: pending|confirmed|completed|cancelled)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead status updated successfully"
}
```

---

## Users

### Get User

**GET** `/api/user/[userId]`

Get user data.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0501234567",
    "wallet": 0,
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2025-11-29T00:00:00.000Z",
    "lastActive": "2025-11-29T00:00:00.000Z",
    "pagesCount": 5,
    "purchasesCount": 10,
    "leadsCount": 3
  }
}
```

---

### Update User

**POST** `/api/user/[userId]`

Update user data.

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "wallet": "number (optional)",
  "avatar": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing with cURL

### Create a Page
```bash
curl -X POST http://localhost:5173/api/create-page \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "title": "My Test Page",
    "htmlContent": "<html><body><h1>Hello World</h1></body></html>",
    "selectedPageType": "generic"
  }'
```

### Get User Pages
```bash
curl http://localhost:5173/api/pages/test-user-123
```

### Create Purchase
```bash
curl -X POST http://localhost:5173/api/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pageId": "1",
    "products": [{"name": "Product 1", "price": 100, "quantity": 1}],
    "total": 100,
    "paymentMethod": "credit_card",
    "customerName": "Jane Doe",
    "customerPhone": "0501234567"
  }'
```

### Submit Lead
```bash
curl -X POST http://localhost:5173/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pageId": "1",
    "name": "John Doe",
    "phone": "0501234567",
    "message": "Interested in your services"
  }'
```

### Upload Image
```bash
curl -X POST http://localhost:5173/api/upload-image \
  -F "image=@/path/to/image.jpg" \
  -F "userId=test-user-123" \
  -F "pageName=my-page"
```

---

## Page Types

Supported page types:
- `store` - Online store with products
- `event` - Event page with RSVP
- `serviceProvider` - Service provider with appointments
- `messageInBottle` - Message in a bottle pages
- `course` - Digital courses
- `workshop` - Live workshops/webinars
- `restaurantMenu` - Restaurant/cafe menu
- `generic` - Generic landing page

---

## Notes

- All dates are in ISO 8601 format
- All endpoints log requests to console for debugging
- Analytics are automatically updated when purchases/leads are created
- Images are stored in Strapi media library
- Cascade deletes ensure referential integrity
