# Bookstore API Documentation

**Base URL:** `/api`

**Version:** 1.0

**Authentication:** Most endpoints require JWT Bearer token authentication. Include the token in the `Authorization` header as `Bearer <token>`.

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Book Endpoints](#book-endpoints)
3. [Category Endpoints](#category-endpoints)
4. [Cart Endpoints](#cart-endpoints)
5. [Order Endpoints](#order-endpoints)
6. [Author Endpoints](#author-endpoints)
7. [User Endpoints](#user-endpoints)
8. [Admin Dashboard Endpoints](#admin-dashboard-endpoints)
9. [File Upload Endpoints](#file-upload-endpoints)
10. [Error Response Format](#error-response-format)

---

## Authentication Endpoints

### 1. Register User

**Description:** Register a new user account.

**URL:** `POST /api/auth/register`

**Authentication:** None required

**Request Body:**

```json
{
  "username": "string (required)",
  "password": "string (required, min: 8, max: 25)",
  "email": "string (required, valid email format)",
  "fullName": "string (required)",
  "phoneNumber": "string (required)"
}
```

**Success Response (201 Created):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 3600000,
  "id": 1,
  "username": "johndoe",
  "email": "johndoe@example.com",
  "roles": ["ROLE_USER"]
}
```

**Error Responses:**

- **400 Bad Request:** Validation errors (missing fields, invalid email format, password too short)
- **409 Conflict:** Username or email already exists
- **500 Internal Server Error:** Server error

---

### 2. Login

**Description:** Authenticate user and receive JWT tokens.

**URL:** `POST /api/auth/login`

**Authentication:** None required

**Request Body:**

```json
{
  "usernameOrEmail": "string (required, username or email)",
  "password": "string (required, min: 8, max: 25)"
}
```

**Success Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 3600000,
  "id": 1,
  "username": "johndoe",
  "email": "johndoe@example.com",
  "roles": ["ROLE_USER"]
}
```

**Error Responses:**

- **400 Bad Request:** Validation errors
- **401 Unauthorized:** Wrong username/email or password
- **500 Internal Server Error:** Server error

---

### 3. Refresh Token

**Description:** Refresh access token using refresh token.

**URL:** `POST /api/auth/refresh`

**Authentication:** None required (but refresh token needed in body)

**Request Body:**

```json
{
  "refreshToken": "string (required)"
}
```

**Success Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600000
}
```

**Error Responses:**

- **400 Bad Request:** Refresh token is required
- **401 Unauthorized:** Invalid or expired refresh token
- **500 Internal Server Error:** Server error

---

## Book Endpoints

### 1. Get All Books (Paginated)

**Description:** Retrieve a paginated list of all books.

**URL:** `GET /api/books`

**Authentication:** None required

**Query Parameters:**

- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 5)
- `sort` (optional): Sort by field (e.g., `title,asc`)

**Example Request:**

```
GET /api/books?page=0&size=10&sort=title,asc
```

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "authors": [
        {
          "id": 1,
          "name": "F. Scott Fitzgerald",
          "description": "American novelist"
        }
      ],
      "publisher": "Scribner",
      "price": 15.99,
      "isbn": "978-0-7432-7356-5",
      "description": "A classic American novel",
      "coverImage": "https://example.com/image.jpg",
      "quantity": 50,
      "categories": [
        {
          "id": 1,
          "name": "Fiction",
          "description": "Fictional works"
        }
      ]
    }
  ],
  "pageNo": 0,
  "pageSize": 10,
  "totalElements": 100,
  "totalPages": 10,
  "last": false
}
```

**Error Responses:**

- **500 Internal Server Error:** Server error

---

### 2. Get Book by ID

**Description:** Retrieve a specific book by its ID.

**URL:** `GET /api/books/{id}`

**Authentication:** None required

**Path Parameters:**

- `id` (required): Book ID (Long)

**Success Response (200 OK):**

```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "authors": [
    {
      "id": 1,
      "name": "F. Scott Fitzgerald",
      "description": "American novelist"
    }
  ],
  "publisher": "Scribner",
  "price": 15.99,
  "isbn": "978-0-7432-7356-5",
  "description": "A classic American novel",
  "coverImage": "https://example.com/image.jpg",
  "quantity": 50,
  "categories": [
    {
      "id": 1,
      "name": "Fiction",
      "description": "Fictional works"
    }
  ]
}
```

**Error Responses:**

- **404 Not Found:** Book not found
- **500 Internal Server Error:** Server error

---

### 3. Search Books

**Description:** Search books by multiple criteria with pagination.

**URL:** `GET /api/books/search`

**Authentication:** None required

**Query Parameters:**

- `title` (optional): Search by title
- `author` (optional): Search by author name (mapped to Author filter)
- `category` (optional): Filter by category name
- `minPrice` (optional): Minimum price (BigDecimal)
- `maxPrice` (optional): Maximum price (BigDecimal)
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `sort` (optional): Sort field (default: title)

**Example Request:**

```
GET /api/books/search?title=gatsby&minPrice=10&maxPrice=20&page=0&size=10
```

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "authors": [
        {
          "id": 1,
          "name": "F. Scott Fitzgerald",
          "description": "American novelist"
        }
      ],
      "publisher": "Scribner",
      "price": 15.99,
      "isbn": "978-0-7432-7356-5",
      "description": "A classic American novel",
      "coverImage": "https://example.com/image.jpg",
      "quantity": 50,
      "categories": [
        {
          "id": 1,
          "name": "Fiction",
          "description": "Fictional works"
        }
      ]
    }
  ],
  "pageNo": 0,
  "pageSize": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

**Error Responses:**

- **500 Internal Server Error:** Server error

---

### 4. Create Book (Admin Only)

**Description:** Create a new book in the system.

**URL:** `POST /api/books`

**Authentication:** JWT Bearer Token required (Admin role)

**Request Body:**

```json
{
  "title": "string (required)",
  "authorsIds": [1, 2],
  "publisher": "string (optional)",
  "price": 15.99,
  "isbn": "string (optional)",
  "description": "string (optional)",
  "coverImage": "string (optional, URL)",
  "quantity": 100,
  "categoryIds": [1, 2, 3]
}
```

**Success Response (201 Created):**

```json
{
  "id": 1,
  "title": "New Book",
  "authors": [
    {
      "id": 1,
      "name": "Author Name",
      "description": "Author description"
    }
  ],
  "publisher": "Publisher Name",
  "price": 15.99,
  "isbn": "978-0-7432-7356-5",
  "description": "Book description",
  "coverImage": "https://example.com/image.jpg",
  "quantity": 100,
  "categories": [
    {
      "id": 1,
      "name": "Fiction",
      "description": "Fictional works"
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request:** Validation errors (missing required fields, invalid price)
- **401 Unauthorized:** No token provided or invalid token
- **403 Forbidden:** User does not have admin role
- **500 Internal Server Error:** Server error

---

### 5. Update Book (Admin Only)

**Description:** Update an existing book.

**URL:** `PUT /api/books/{id}`

**Authentication:** JWT Bearer Token required (Admin role)

**Path Parameters:**

- `id` (required): Book ID (Long)

**Request Body:**

```json
{
  "title": "string (required)",
  "authorsIds": [1, 2],
  "publisher": "string (optional)",
  "price": 15.99,
  "isbn": "string (optional)",
  "description": "string (optional)",
  "coverImage": "string (optional, URL)",
  "quantity": 100,
  "categoryIds": [1, 2, 3]
}
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "title": "Updated Book",
  "authors": [
    {
      "id": 1,
      "name": "Author Name",
      "description": "Author description"
    }
  ],
  "publisher": "Publisher Name",
  "price": 15.99,
  "isbn": "978-0-7432-7356-5",
  "description": "Updated description",
  "coverImage": "https://example.com/image.jpg",
  "quantity": 100,
  "categories": [
    {
      "id": 1,
      "name": "Fiction",
      "description": "Fictional works"
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request:** Validation errors
- **401 Unauthorized:** No token provided or invalid token
- **403 Forbidden:** User does not have admin role
- **404 Not Found:** Book not found
- **500 Internal Server Error:** Server error

---

### 6. Delete Book (Admin Only)

**Description:** Delete a book from the system.

**URL:** `DELETE /api/books/{id}`

**Authentication:** JWT Bearer Token required (Admin role)

**Path Parameters:**

- `id` (required): Book ID (Long)

**Success Response (204 No Content):**

No body content returned.

**Error Responses:**

- **401 Unauthorized:** No token provided or invalid token
- **403 Forbidden:** User does not have admin role
- **404 Not Found:** Book not found
- **500 Internal Server Error:** Server error

---

## Category Endpoints

### 1. Get All Categories

**Description:** Retrieve all categories.

**URL:** `GET /api/categories`

**Authentication:** None required

**Success Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "Fiction",
    "description": "Fictional works"
  },
  {
    "id": 2,
    "name": "Science",
    "description": "Science books"
  }
]
```

**Error Responses:**

- **500 Internal Server Error:** Server error

---

### 2. Get Category by ID

**Description:** Retrieve a specific category by ID.

**URL:** `GET /api/categories/{id}`

**Authentication:** None required

**Path Parameters:**

- `id` (required): Category ID (Long)

**Success Response (200 OK):**

```json
{
  "id": 1,
  "name": "Fiction",
  "description": "Fictional works"
}
```

**Error Responses:**

- **404 Not Found:** Category not found
- **500 Internal Server Error:** Server error

---

### 3. Create Category (Admin Only)

**Description:** Create a new category.

**URL:** `POST /api/categories`

**Authentication:** JWT Bearer Token required (Admin role)

**Request Body:**

```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "name": "Fiction",
  "description": "Fictional works"
}
```

**Error Responses:**

- **400 Bad Request:** Validation errors (name is required)
- **401 Unauthorized:** No token provided or invalid token
- **403 Forbidden:** User does not have admin role
- **409 Conflict:** Category with this name already exists
- **500 Internal Server Error:** Server error

---

### 4. Update Category (Admin Only)

**Description:** Update an existing category.

**URL:** `PUT /api/categories/{id}`

**Authentication:** JWT Bearer Token required (Admin role)

**Path Parameters:**

- `id` (required): Category ID (Long)

**Request Body:**

```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "name": "Updated Fiction",
  "description": "Updated description"
}
```

**Error Responses:**

- **400 Bad Request:** Validation errors
- **401 Unauthorized:** No token provided or invalid token
- **403 Forbidden:** User does not have admin role
- **404 Not Found:** Category not found
- **500 Internal Server Error:** Server error

---

### 5. Delete Category (Admin Only)

**Description:** Delete a category.

**URL:** `DELETE /api/categories/{id}`

**Authentication:** JWT Bearer Token required (Admin role)

**Path Parameters:**

- `id` (required): Category ID (Long)

**Success Response (200 OK):**

No body content returned.

**Error Responses:**

- **401 Unauthorized:** No token provided or invalid token
- **403 Forbidden:** User does not have admin role
- **404 Not Found:** Category not found
- **500 Internal Server Error:** Server error

---

## Cart Endpoints

### 1. Get User's Cart

**Description:** Retrieve the current user's cart.

**URL:** `GET /api/cart`

**Authentication:** JWT Bearer Token required

**Success Response (200 OK):**

```json
{
  "id": 1,
  "userId": 1,
  "items": [
    {
      "id": 1,
      "bookId": 1,
      "title": "The Great Gatsby",
      "coverImage": "https://example.com/image.jpg",
      "price": 15.99,
      "quantity": 2,
      "subTotal": 31.98
    }
  ],
  "totalPrice": 31.98
}
```

**Error Responses:**

- **401 Unauthorized:** No token provided or invalid token
- **404 Not Found:** Cart not found
- **500 Internal Server Error:** Server error

---

### 2. Add Item to Cart

**Description:** Add a book to the user's cart.

**URL:** `POST /api/cart/add`

**Authentication:** JWT Bearer Token required

**Request Body:**

```json
{
  "bookId": 1,
  "quantity": 2
}
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "userId": 1,
  "items": [
    {
      "id": 1,
      "bookId": 1,
      "title": "The Great Gatsby",
      "coverImage": "https://example.com/image.jpg",
      "price": 15.99,
      "quantity": 2,
      "subTotal": 31.98
    }
  ],
  "totalPrice": 31.98
}
```

**Error Responses:**

- **400 Bad Request:** Invalid book ID or quantity
- **401 Unauthorized:** No token provided or invalid token
- **404 Not Found:** Book not found
- **500 Internal Server Error:** Server error

---

### 3. Update Cart Item

**Description:** Update the quantity of a cart item.

**URL:** `PUT /api/cart/items/{cartItemId}`

**Authentication:** JWT Bearer Token required

**Path Parameters:**

- `cartItemId` (required): Cart item ID (Long)

**Request Body:**

```json
{
  "quantity": 3
}
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "userId": 1,
  "items": [
    {
      "id": 1,
      "bookId": 1,
      "title": "The Great Gatsby",
      "coverImage": "https://example.com/image.jpg",
      "price": 15.99,
      "quantity": 3,
      "subTotal": 47.97
    }
  ],
  "totalPrice": 47.97
}
```

**Error Responses:**

- **400 Bad Request:** Invalid quantity
- **401 Unauthorized:** No token provided or invalid token
- **404 Not Found:** Cart item not found
- **500 Internal Server Error:** Server error

---

### 4. Remove Cart Item

**Description:** Remove an item from the cart.

**URL:** `DELETE /api/cart/items/{cartItemId}`

**Authentication:** JWT Bearer Token required

**Path Parameters:**

- `cartItemId` (required): Cart item ID (Long)

**Success Response (200 OK):**

```json
{
  "id": 1,
  "userId": 1,
  "items": [],
  "totalPrice": 0.00
}
```

**Error Responses:**

- **401 Unauthorized:** No token provided or invalid token
- **404 Not Found:** Cart item not found
- **500 Internal Server Error:** Server error

---

### 5. Remove All Cart Items

**Description:** Remove all items from the current user's cart.

**URL:** `DELETE /api/cart/items`

**Authentication:** JWT Bearer Token required

**Success Response (200 OK):**

```json
{
  "id": 1,
  "userId": 1,
  "items": [],
  "totalPrice": 0.00
}
```

**Error Responses:**

- **401 Unauthorized:** No token provided or invalid token
- **500 Internal Server Error:** Server error

---

## Order Endpoints

### 1. Place Order

**Description:** Create a new order from specified items.

**URL:** `POST /api/orders`

**Authentication:** JWT Bearer Token required

**Request Body:**

```json
{
  "shippingAddress": "string (required)",
  "phoneNumber": "string (required)",
  "items": [
    {
      "bookId": 1,
      "quantity": 2
    },
    {
      "bookId": 2,
      "quantity": 1
    }
  ]
}
```

**Success Response (201 Created):**

```json
{
  "id": 1,
  "userId": 1,
  "orderDate": "2024-04-06T16:23:31.718Z",
  "totalAmount": 47.97,
  "status": "PENDING",
  "orderItems": [
    {
      "id": 1,
      "bookId": 1,
      "bookTitle": "The Great Gatsby",
      "quantity": 2,
      "price": 15.99
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request:** Validation errors (missing fields, empty items list)
- **401 Unauthorized:** No token provided or invalid token
- **404 Not Found:** Book not found
- **500 Internal Server Error:** Server error

---

### 2. Get Order History

**Description:** Retrieve all orders for the current user.

**URL:** `GET /api/orders`

**Authentication:** JWT Bearer Token required

**Success Response (200 OK):**

```json
[
  {
    "id": 1,
    "userId": 1,
    "orderDate": "2024-04-06T16:23:31.718Z",
    "totalAmount": 47.97,
    "status": "PENDING",
    "orderItems": [
      {
        "id": 1,
        "bookId": 1,
        "bookTitle": "The Great Gatsby",
        "quantity": 2,
        "price": 15.99
      }
    ]
  }
]
```

**Error Responses:**

- **401 Unauthorized:** No token provided or invalid token
- **500 Internal Server Error:** Server error

---

### 3. Get Order by ID

**Description:** Retrieve a specific order by ID (user can only view their own orders).

**URL:** `GET /api/orders/{id}`

**Authentication:** JWT Bearer Token required

**Path Parameters:**

- `id` (required): Order ID (Long)

**Success Response (200 OK):**

```json
{
  "id": 1,
  "userId": 1,
  "orderDate": "2024-04-06T16:23:31.718Z",
  "totalAmount": 47.97,
  "status": "PENDING",
  "orderItems": [
    {
      "id": 1,
      "bookId": 1,
      "bookTitle": "The Great Gatsby",
      "quantity": 2,
      "price": 15.99
    }
  ]
}
```

**Error Responses:**

- **401 Unauthorized:** No token provided or invalid token
- **403 Forbidden:** User trying to access another user's order
- **404 Not Found:** Order not found
- **500 Internal Server Error:** Server error

---

### 4. Cancel Order

**Description:** Cancel a pending order (user can only cancel their own orders).

**URL:** `PATCH /api/orders/{id}/cancel`

**Authentication:** JWT Bearer Token required

**Path Parameters:**

- `id` (required): Order ID (Long)

**Success Response (200 OK):**

```json
{
  "id": 1,
  "userId": 1,
  "orderDate": "2024-04-06T16:23:31.718Z",
  "totalAmount": 47.97,
  "status": "CANCELLED",
  "orderItems": [
    {
      "id": 1,
      "bookId": 1,
      "bookTitle": "The Great Gatsby",
      "quantity": 2,
      "price": 15.99
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request:** Order cannot be cancelled (already shipped/delivered)
- **401 Unauthorized:** No token provided or invalid token
- **403 Forbidden:** User trying to cancel another user's order
- **404 Not Found:** Order not found
- **500 Internal Server Error:** Server error

---

### 5. Get Order by ID (Admin Only)

**Description:** Admin endpoint to retrieve any order by ID.

**URL:** `GET /api/orders/admin/{id}`

**Authentication:** JWT Bearer Token required (Admin role)

**Path Parameters:**

- `id` (required): Order ID (Long)

**Success Response (200 OK):**

```json
{
  "id": 1,
  "userId": 1,
  "orderDate": "2024-04-06T16:23:31.718Z",
  "totalAmount": 47.97,
  "status": "PENDING",
  "orderItems": [
    {
      "id": 1,
      "bookId": 1,
      "bookTitle": "The Great Gatsby",
      "quantity": 2,
      "price": 15.99
    }
  ]
}
```

**Error Responses:**

- **401 Unauthorized:** No token provided or invalid token
- **403 Forbidden:** User does not have admin role
- **404 Not Found:** Order not found
- **500 Internal Server Error:** Server error

---

### 6. Get All Orders (Admin Only)

**Description:** Admin endpoint to retrieve all orders with pagination.

**URL:** `GET /api/orders/admin`

**Authentication:** JWT Bearer Token required (Admin role)

**Query Parameters:**

- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)
- `sort` (optional): Sort field (default: orderDate,DESC)

**Example Request:**

```
GET /api/orders/admin?page=0&size=10&sort=orderDate,DESC
```

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": 1,
      "userId": 1,
      "orderDate": "2024-04-06T16:23:31.718Z",
      "totalAmount": 47.97,
      "status": "PENDING",
      "orderItems": [
        {
          "id": 1,
          "bookId": 1,
          "bookTitle": "The Great Gatsby",
          "quantity": 2,
          "price": 15.99
        }
      ]
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalPages": 5,
  "totalElements": 50,
  "last": false,
  "first": true
}
```

**Error Responses:**

- **401 Unauthorized:** No token provided or invalid token
- **403 Forbidden:** User does not have admin role
- **500 Internal Server Error:** Server error

---

### 7. Update Order Status (Admin Only)

**Description:** Admin endpoint to update order status.

**URL:** `PATCH /api/orders/admin/{id}/status`

**Authentication:** JWT Bearer Token required (Admin role)

**Path Parameters:**

- `id` (required): Order ID (Long)

**Query Parameters:**

- `status` (required): New order status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)

**Example Request:**

```
PATCH /api/orders/admin/1/status?status=SHIPPED
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "userId": 1,
  "orderDate": "2024-04-06T16:23:31.718Z",
  "totalAmount": 47.97,
  "status": "SHIPPED",
  "orderItems": [
    {
      "id": 1,
      "bookId": 1,
      "bookTitle": "The Great Gatsby",
      "quantity": 2,
      "price": 15.99
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request:** Invalid status value
- **401 Unauthorized:** No token provided or invalid token
- **403 Forbidden:** User does not have admin role
- **404 Not Found:** Order not found
- **500 Internal Server Error:** Server error

---

## Author Endpoints

### 1. Get Authors (Paginated)

**Description:** Get paginated authors with optional name filter.

**URL:** `GET /api/authors`

**Authentication:** None required

**Query Parameters:**

- `find` (optional): Keyword for author name search
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `sort` (optional): Sort field (default: `name`)

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": 1,
      "name": "F. Scott Fitzgerald",
      "description": "American novelist"
    }
  ],
  "pageNo": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

### 2. Get Author by ID

**URL:** `GET /api/authors/{id}`

**Authentication:** None required

**Success Response (200 OK):**

```json
{
  "id": 1,
  "name": "F. Scott Fitzgerald",
  "description": "American novelist"
}
```

### 3. Create Author (Admin Only)

**URL:** `POST /api/admin/authors`

**Authentication:** JWT Bearer Token required (Admin role)

**Request Body:**

```json
{
  "name": "Author name",
  "description": "Author description"
}
```

### 4. Update Author (Admin Only)

**URL:** `PATCH /api/admin/authors/{id}`

**Authentication:** JWT Bearer Token required (Admin role)

**Request Body:**

```json
{
  "name": "Updated author name",
  "description": "Updated description"
}
```

### 5. Delete Author (Admin Only)

**URL:** `DELETE /api/admin/authors/{id}`

**Authentication:** JWT Bearer Token required (Admin role)

**Success Response:** `204 No Content`

---

## User Endpoints

### 1. Get Current User

**URL:** `GET /api/users/me`

**Authentication:** JWT Bearer Token required

**Success Response (200 OK):**

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "johndoe@example.com",
  "fullName": "John Doe",
  "phoneNumber": "0123456789",
  "roles": ["ROLE_USER"],
  "enabled": true,
  "accountNonLocked": true,
  "createdAt": "2024-04-06T16:23:31.718Z",
  "updatedAt": "2024-04-06T16:23:31.718Z",
  "avatar": null,
  "address": null,
  "dateOfBirth": null,
  "gender": null
}
```

### 2. Update Current User

**URL:** `PATCH /api/users/me`

**Authentication:** JWT Bearer Token required

**Request Body:**

```json
{
  "fullName": "John Doe",
  "phoneNumber": "0123456789",
  "avatar": "https://example.com/avatar.jpg",
  "address": "123 Main St",
  "dateOfBirth": "2000-01-01",
  "gender": "Male"
}
```

### 3. Get All Users (Admin Only)

**URL:** `GET /api/users/admin`

**Authentication:** JWT Bearer Token required (Admin role)

**Success Response (200 OK):** `UserResponse[]`

---

## Admin Dashboard Endpoints

### 1. Get Dashboard Summary (Admin Only)

**URL:** `GET /api/admin/dashboard`

**Authentication:** JWT Bearer Token required (Admin role)

**Success Response (200 OK):**

```json
{
  "totalActiveUsers": 150,
  "weeklyRevenue": 1200.50,
  "orderInWeek": 45,
  "orderToday": 8,
  "alertBook": {},
  "dailyRevenue": [120.5, 95.0, 180.0],
  "recentOrders": [],
  "topSellerBooks": [],
  "numberOfBooksInWeek": [10, 12, 8],
  "topCategories": [],
  "percentOfTopCategories": [45.5, 30.0, 24.5]
}
```

---

## File Upload Endpoints

### 1. Upload Image

**Description:** Upload an image file (e.g., book cover) to cloud storage.

**URL:** `POST /api/files/upload`

**Authentication:** JWT Bearer Token required

**Content-Type:** `multipart/form-data`

**Request Body:**

Form data with file field:
- `file` (required): The image file to upload

**Example Request (using FormData in JavaScript):**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>'
  },
  body: formData
});
```

**Success Response (200 OK):**

```json
{
  "url": "https://cloudinary.com/your-image-url.jpg"
}
```

**Error Responses:**

- **400 Bad Request:** No file provided or invalid file format
- **401 Unauthorized:** No token provided or invalid token
- **500 Internal Server Error:** Server error or upload failed

---

## Error Response Format

All error responses follow this standard format:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Book with id 123 not found",
  "timestamp": "2024-04-06T16:23:31.718Z"
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request succeeded but no content to return |
| 400 | Bad Request - Invalid request body or parameters |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

---

## Authentication Flow

### How to Use JWT Tokens

1. **Register or Login** to receive `accessToken` and `refreshToken`
2. **Include the access token** in the `Authorization` header for all protected endpoints:
   ```
   Authorization: Bearer <accessToken>
   ```
3. **When access token expires**, use the `/api/auth/refresh` endpoint with the `refreshToken` to get a new `accessToken`
4. **Store tokens securely** (e.g., httpOnly cookies or secure storage)

### Token Expiration

- **Access Token:** Typically expires in 1 hour (3600000 ms)
- **Refresh Token:** Longer expiration (check your backend configuration)

---

## Important Notes for Frontend Integration

### 1. Data Types

- **Long/Integer:** JavaScript numbers, but sent as numbers in JSON
- **BigDecimal:** Sent as numbers in JSON (e.g., `15.99`)
- **String:** Standard strings
- **LocalDateTime:** ISO 8601 format string (e.g., `"2024-04-06T16:23:31.718Z"`)
- **Set/List:** Arrays in JSON (e.g., `[1, 2, 3]`)

### 2. Pagination

For paginated endpoints, the response includes:
- `content`: Array of items
- `pageNo`: Current page number (0-indexed)
- `pageSize`: Number of items per page
- `totalElements`: Total number of items
- `totalPages`: Total number of pages
- `last`: Boolean indicating if this is the last page

### 3. Role-Based Access

- **Public endpoints:** Auth, books (read/search), categories (read), authors (read)
- **User endpoints:** Profile (`/api/users/me`), cart, own orders
- **Admin endpoints:** Book/category/author management, user list, all orders management, dashboard

### 4. File Upload

When uploading files:
- Use `multipart/form-data` content type
- Include the JWT token in Authorization header
- The response contains the URL of the uploaded image
- Use this URL when creating/updating books

### 5. Search and Filtering

The book search endpoint supports multiple filters that can be combined:
- All parameters are optional
- Filters are applied with AND logic
- Pagination parameters control the result set

### 6. Order Status Enum Values

Valid order status values:
- `PENDING` - Order placed, awaiting processing
- `PROCESSING` - Order is being prepared
- `SHIPPED` - Order has been shipped
- `DELIVERED` - Order delivered to customer
- `CANCELLED` - Order cancelled

---

## Example Integration Code (React/Next.js)

### Setting up Axios with interceptors:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### Example API calls:

```javascript
// Login
const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data;
};

// Get books
const getBooks = async (page = 0, size = 10) => {
  const { data } = await api.get('/books', { params: { page, size } });
  return data;
};

// Add to cart
const addToCart = async (bookId, quantity) => {
  const { data } = await api.post('/cart/add', { bookId, quantity });
  return data;
};

// Place order
const placeOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

// Upload file
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return data.url;
};
```

---

**Document Version:** 1.0  
**Last Updated:** 2024-04-06  
**Backend Framework:** Spring Boot 3.x  
**Contact:** Backend Team
