# Forever Storefront

React 19 and Vite storefront. Use Node.js 24 LTS, set `VITE_BACKEND_URL` to the public API base URL, then run `npm ci`, `npm run dev`, or `npm run build` from this directory. See the repository [README](../README.md) for environment and deployment configuration.

The storefront supports account favorites, product reviews, persisted device/light/dark appearance, and paged order history. Product listings are cached for the browser session and refreshed from the API when the app opens. Guest cart items are saved locally and merged into the signed-in account after login, so checkout can continue without losing the cart. The profile menu closes when clicking outside it or pressing Escape.
