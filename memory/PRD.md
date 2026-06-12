# প্রকৃতির ঘ্রাণ (Organic Shop) — PRD

## Original problem statement (verbatim)
> ওয়েব অ্যাপটির ডিজাইন আরো সুন্দর মসৃণ করতে হবে। ইউজারের প্রোফাইল অপশনে একটি অ্যাড্রেস সেকশন থাকবে যেখানে ইউজাররা অ্যাড্রেস যোগ করতে পারবে এবং সেই একই অ্যাড্রেসটা বারবার চেকআউট করার সময় ওখানে সে সেভ করা অ্যাড্রেসটি দ্বারা অর্ডার করতে পারবে। অ্যাডমিন লগিনের সিক্রেট লিঙ্কটা আমাকে দিবে এখানে। আরো যে সকল ফিচার যোগ করতে হবে সবগুলো সুন্দরভাবে যোগ করতে হবে। অ্যাডমিন প্যানেল থেকে যাতে পুরোপুরি ওয়েব অ্যাপটাকে সুন্দরভাবে কন্ট্রোল করা যায় এবং তার পরিবর্তন, পরিবর্ধন সবকিছু করা যায় সেই অনুযায়ী শক্তিশালী ঐ অ্যাডমিন ড্যাশবোর্ড সেভাবে তৈরি করতে হবে।

## Stack
- Frontend: React + Tailwind, react-router-dom, Context (Auth, Cart)
- Backend: FastAPI (Python) + Motor (MongoDB)
- Hot reload via supervisor (backend port 8001, frontend 3000)

## Secret admin link
`{REACT_APP_BACKEND_URL}/portal-7x9k2m4p8q3z6n1v`

## What's implemented (this session — 12 Jun 2026)
### Customer
- **Address book** (`/profile/addresses`) with Bangladesh-style fields (label, fullName, phone, address, area, city, district, division, postalCode, note, isDefault)
- Add/edit/delete addresses, default address management
- **Checkout** uses saved addresses (card selector) and falls back to one-time entry with "Save for next time"
- **Coupon code** field at checkout — applies discount line item
- Smooth animations (in/out modals, scale on press, hover transitions)

### Admin (`/portal-7x9k2m4p8q3z6n1v`)
- New nav items: **Banners**, **Coupons**
- **Banners** CRUD with image upload (base64), CTA label/link, active flag, ordering
- **Coupons** CRUD (flat / percent, minOrder, maxDiscount, usageLimit, expiry, active)
- **Settings tabs**: Payment / Site info (brand, contact, social, about) / Delivery (fee, free delivery threshold)
- Existing pages: Dashboard, Analytics, Products, Categories, Orders, Customers, Messages

### Backend APIs added
- `GET/POST/PUT/DELETE /api/auth/me/addresses[/{id}]`
- `GET /api/settings/site` (public) · `PUT /api/admin/settings/site`
- `GET /api/banners` (public) · `GET/POST/PUT/DELETE /api/admin/banners[/{id}]`
- `GET/POST/PUT/DELETE /api/admin/coupons[/{id}]` · `POST /api/coupons/apply`
- `POST /api/orders` now accepts `couponCode`, `discount` and increments coupon `usedCount`
- Cart delivery rules now read from site settings (deliveryFee, freeDeliveryAbove)

### Seeded data
- Default site settings, one hero banner, **SOBUJ100** welcome coupon (flat ৳100 off, min ৳500)
- Admin: `admin@organicshop.com` / `admin123`

## Test status
- Backend: 19/19 pytest pass (auth, address CRUD, site/banner/coupon, order+coupon)
- Frontend: 100% — signup, address add/edit/default badge, product add-to-cart, checkout with saved address + coupon + COD, view order, delete address

## Roadmap (P1/P2 backlog)
- P1: Banner carousel (multiple active banners) on Home; site name/footer rendered from settings
- P1: Order export (CSV), bulk product import, low-stock alerts
- P2: Customer reviews/ratings, wishlists, push notifications
- P2: SMS OTP login, Google/FB social login
- P2: Refactor `/app/backend/server.py` into `routers/{auth,products,orders,admin}.py`
- P2: Dark mode toggle for storefront

## Files of reference
- `/app/backend/server.py`
- `/app/frontend/src/pages/Addresses.jsx`, `Checkout.jsx`, `Profile.jsx`, `Auth.jsx`, `Home.jsx`
- `/app/frontend/src/pages/admin/{Dashboard,Settings,Banners,Coupons}.jsx`
- `/app/frontend/src/contexts/CartContext.jsx`
- `/app/frontend/src/components/ProductCard.jsx`
- `/app/frontend/src/lib/admin-path.js`
