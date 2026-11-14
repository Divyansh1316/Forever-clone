# Forever Store

Forever Store is a full-stack clothing shop with a customer storefront, an administration dashboard, and an Express API.

## Features

### Shopping

- Browse the complete product catalog, search by name or details, filter by category and type, and sort by price.
- View product images, descriptions, available sizes, related items, and customer reviews.
- Save products to favorites and choose light, dark, or device-based appearance.
- Add products to a cart as a guest or signed-in customer. Guest cart items are kept between visits and merged into the account after sign-in.
- Place cash-on-delivery or PayPal orders and review order status from the account.
- Use the responsive storefront on mobile and desktop.

### Store management

- Sign in to the admin dashboard to add products, upload product images, remove listings, and review customer orders.
- Update order status as it moves through packing, shipping, delivery, and completion.
- Switch between saved light and dark themes, and reveal the password while signing in.

## Technology

- **Storefront and admin:** React, Vite, React Router, Tailwind CSS
- **API:** Node.js, Express, Mongoose, JWT
- **Data and media:** MongoDB, Cloudinary
- **Payments:** PayPal and cash on delivery

## Project layout

```text
backend/    Express API and MongoDB models
frontend/   Customer storefront
admin/      Product and order dashboard
```

## Local development

Use Node.js 24 LTS (the repository pins Node.js 24.22.3). Install and run each app in its own terminal:

```bash
cd backend
npm ci
npm run server
```

```bash
cd frontend
npm ci
npm run dev
```

```bash
cd admin
npm ci
npm run dev
```

The API uses port 4000, the storefront uses port 5173, and the admin app uses port 5174 by default. The storefront and dashboard need a reachable API and the API needs its connected data and payment services to support their respective features.

## Validation

Run these from `frontend` or `admin`:

```bash
npm run lint
npm run build
```

For the system architecture and request flows, see [TECHNICAL_OVERVIEW.md](TECHNICAL_OVERVIEW.md).
