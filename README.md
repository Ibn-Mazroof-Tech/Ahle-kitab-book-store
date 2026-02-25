# Ahle Kitab Book Store Website

Full-stack online bookstore for **Ahle Kitab** with a modern storefront, cart, and Razorpay checkout.

## Tech Stack
- Frontend: HTML, CSS, Vanilla JS
- Backend: Node.js, Express
- Payments: Razorpay Orders API + Signature verification

## Features
- Home, Shop, Book Details, Cart, Checkout, About, Contact, Thank You pages
- Dynamic product listing via `/api/books`
- Cart with local storage persistence
- Secure Razorpay payment flow:
  - Create order on backend
  - Verify payment signature on backend
- WhatsApp and Instagram contact hooks

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   copy .env.example .env
   ```
3. Update `.env` with your Razorpay test/live keys.
4. Run:
   ```bash
   npm start
   ```
5. Open `http://localhost:5000`

## Razorpay Notes
- Keep secret key only on server.
- Use test keys during development.
- Move to live keys only after successful test transactions.

## Important Replacements
- Update WhatsApp number in:
  - `public/index.html`
  - `public/pages/contact.html`
  - `public/pages/thanks.html`
  - `public/js/contact.js`
- Update Instagram links from placeholder to actual business profile.
- Replace logo placeholder `AK` with your real brand image when ready.

## Deploy
- Deploy on Render/Railway/VPS
- Set environment variables in deployment panel
- Point custom domain to deployment
