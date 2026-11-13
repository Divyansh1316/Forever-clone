# Technical Overview

This document describes how the Forever Store applications exchange data and how the main shopping flows work. The source code remains the authoritative implementation.

## System architecture

```mermaid
flowchart LR
    Shopper[Customer browser]
    Admin[Admin browser]
    Store[React storefront<br/>Vite]
    Dashboard[React admin<br/>Vite]
    API[Express API<br/>Node.js]
    Mongo[(MongoDB<br/>products, users, reviews, orders)]
    Media[Cloudinary<br/>product images]
    PayPal[PayPal Orders API]

    Shopper --> Store
    Admin --> Dashboard
    Store -->|REST /api| API
    Dashboard -->|REST /api| API
    API --> Mongo
    API -->|upload images| Media
    API -->|create and capture payment| PayPal
```

The three applications can be deployed independently. The storefront and admin dashboard are browser clients. The API owns authorization, persistence, image upload coordination, and payment verification.

## Catalog loading and shopping

```mermaid
sequenceDiagram
    actor Shopper
    participant Store as React storefront
    participant Cache as Browser local storage
    participant API as Express API
    participant DB as MongoDB

    Shopper->>Store: Open a page with products
    Store->>Cache: Read the last public catalog
    Cache-->>Store: Cached products, when available
    Store-->>Shopper: Render cached products immediately
    Store->>API: GET /api/product/list
    API->>DB: Read product catalog
    DB-->>API: Product documents
    API-->>Store: Product list
    Store->>Cache: Refresh cached catalog
    Store-->>Shopper: Render current catalog
```

Search, category/type filters, sorting, favorites, and related-product selection run in the storefront against the catalog data. Favorite changes and reviews are persisted by authenticated API requests. A guest cart is stored locally; after sign-in, the storefront merges its quantities into the user's server cart.

## Authentication and authorization

```mermaid
flowchart TD
    Browser[Storefront or admin client] -->|login or register| UserAPI[User API]
    UserAPI -->|signed token| Browser
    Browser -->|token header| Guard{Route guard}
    Guard -->|valid user token| UserRoutes[Cart, favorites, reviews, profile, customer orders]
    Guard -->|valid admin role| AdminRoutes[Product administration, all orders, status updates]
    Guard -->|missing, invalid, or wrong role| Reject[401 response]
    UserRoutes --> DB[(MongoDB)]
    AdminRoutes --> DB
```

User and admin routes verify signed tokens in backend middleware. Admin routes additionally require the admin role. Product listing and review reading are public; review submission requires a signed-in user.

## Order and payment flow

```mermaid
sequenceDiagram
    actor Shopper
    participant Store as Storefront
    participant API as Order API
    participant DB as MongoDB
    participant PayPal

    Shopper->>Store: Submit delivery details and cart
    Store->>API: POST /api/order/place or /api/order/paypal
    API->>DB: Load products and validate IDs, sizes, and quantities
    API->>API: Calculate total from catalog prices and delivery charge
    alt Cash on delivery
        API->>DB: Save pending COD order
        API-->>Store: Order placed
    else PayPal
        API->>DB: Save pending order
        API->>PayPal: Create checkout using server-calculated total
        PayPal-->>API: Approval link and PayPal order ID
        API->>DB: Associate PayPal ID with pending order
        API-->>Store: Return approval link
        Store-->>Shopper: Redirect to PayPal
        Shopper->>PayPal: Approve payment
        PayPal-->>Store: Return to verification page
        Store->>API: POST /api/order/verifyPaypal
        API->>PayPal: Capture payment
        PayPal-->>API: Capture result
        API->>API: Verify order, account, status, currency, and amount
        API->>DB: Mark order paid and clear server cart
        API-->>Store: Verified result
    end
```

The browser's submitted price is not trusted for checkout totals. The API reloads product records and calculates the order amount itself. PayPal orders are marked paid only after capture is confirmed against the stored order and expected amount.

## Main API routes

| Area | Routes | Access |
| --- | --- | --- |
| Accounts | `POST /api/user/register`, `POST /api/user/login`, `GET /api/user/profile` | Public for sign-in and registration; profile requires a user token |
| Products | `GET /api/product/list`, `GET /api/product/:productId/reviews` | Public |
| Reviews | `POST /api/product/:productId/reviews` | User token |
| Cart | `POST /api/cart/get`, `/add`, `/update` | User token |
| Favorites | `GET /api/favorites`, `POST /api/favorites` | User token |
| Customer orders | `POST /api/order/place`, `/paypal`, `/userorders`, `/verifyPaypal` | User token |
| Store administration | `POST /api/product/add`, `/remove`; `POST /api/order/list`, `/status` | Admin token |

The API defaults to port 4000. The Vite development servers default to 5173 for the storefront and 5174 for admin. The repository pins Node.js 24.22.3 in `.nvmrc` and declares Node.js 24 compatibility in each app.
