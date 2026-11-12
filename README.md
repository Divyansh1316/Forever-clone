# Forever Store

Forever Store has three separately managed npm applications:

- `backend`: Express API, MongoDB, Cloudinary uploads, and PayPal checkout.
- `frontend`: customer storefront built with React and Vite.
- `admin`: product and order dashboard built with React and Vite.

Use Node.js 24 LTS for local development and deployment. The root `.nvmrc` pins the verified local patch (24.22.3); each app's `engines.node` and the Vercel runtime target Node.js 24.x so deployment can receive current patch updates.

## Local development

Install dependencies with `npm ci` from each app directory. Start each app in a separate terminal with `npm run server` in `backend` and `npm run dev` in `frontend` and `admin`.

The API listens on port 4000, the storefront on 5173, and the admin app on 5174. Run `npm run build` and `npm run lint` in either frontend app to validate its production build and lint rules.

## Environment configuration

Keep `.env` files local and configure the same variables in the deployment platform's secret settings. Never put secret values in frontend `VITE_` variables; Vite embeds those values in public browser assets.

Backend variables:

- `JWT_SECRET`: random secret of at least 32 characters. For local development, create one in a terminal with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"` and add it to `backend/.env` as `JWT_SECRET=<generated value>`. Keep the value private and do not commit it. If `backend/.env` already exists, add only the missing setting instead of replacing the file.
- `MONGODB_URI`: standard MongoDB connection URI, including any query options supplied by your provider; the API selects the `e-commerce` database separately.
- `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`: Cloudinary account settings.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: admin login credentials.
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`: PayPal application credentials.
- `PAYPAL_MODE`: optional `live` to select PayPal production; defaults to Sandbox.
- `CORS_ORIGINS`: comma-separated exact origins for the deployed storefront and admin app, including scheme and host (no path). Local Vite origins are allowed outside production.
- `PORT`: optional local API port; defaults to 4000.

Frontend variables:

- `VITE_BACKEND_URL`: public base URL of the deployed API, without a trailing slash.

To check whether the effective local value is long enough without displaying it, run this from `backend`: `node --input-type=module -e "import 'dotenv/config'; console.log(process.env.JWT_SECRET?.length >= 32 ? 'JWT_SECRET is valid' : 'JWT_SECRET is missing or too short')"`. A shell-level `JWT_SECRET` takes precedence over the value in `.env`.

Set deployment variables separately for each Vercel project. The backend's `vercel.json` serves the Express API; the `frontend` and `admin` directories deploy as static Vite apps with SPA rewrites.

## Security and operational notes

Admin and user tokens expire after eight hours and seven days, respectively. Changing `JWT_SECRET` invalidates existing tokens. Product uploads accept JPEG, PNG, and WebP images up to 2 MB each. Public product responses use a short cache lifetime.

On deployment, existing sessions must sign in again because older tokens did not carry the new role and expiry claims. Finish or allow any PayPal checkouts already in progress to expire before deploying; those older pending orders did not store the PayPal order ID needed for secure verification.

Payment totals and product prices are calculated from the product catalog on the server. PayPal completion is confirmed through the PayPal API and matched to the authenticated user's pending order. Configure and verify live PayPal credentials before accepting live payments.
