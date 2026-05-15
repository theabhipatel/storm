# Day 9 — Frontend Polish, Static Pages, India-Specific UX, Admin Dashboard

**Goal:** Both apps feel finished: full responsive UX, legal pages, error states, India-specific formatting and validation, accessibility pass, admin dashboard with KPIs and exports. Golden-path E2E test passes.

**Depends on:** Days 2–8 (all customer + admin functionality in place).

---

## `apps/web` — Static & Legal Pages

| Route | Content |
|---|---|
| `/about` | Placeholder content describing Storm — single page, server-rendered |
| `/contact` | Placeholder contact form (logs to console / dummy endpoint; real form is Stage 2) + email + phone (placeholder) |
| `/privacy-policy` | Static markdown — placeholder noting "to be reviewed by legal" |
| `/terms` | Same |
| `/shipping-policy` | Flat ₹50, free over ₹500, 3–7 business days (placeholder) |
| `/returns-policy` | "Returns will be available in upcoming release" placeholder |
| `/faq` | Top 10 FAQ placeholders |

All linked from footer.

---

## `apps/web` — Error & Empty State Pages

| Route / state | Behavior |
|---|---|
| `not-found.tsx` | Branded 404 page with search bar + back-to-home CTA |
| `error.tsx` | Branded 500 page with retry button + "go to home" CTA |
| Empty cart | "Your cart is empty" + popular categories + CTA |
| Empty wishlist | "No wishlist items" + browse CTA |
| Empty orders | "No orders yet" + browse CTA |
| No search results | "No matches for 'foo'" + suggested categories + clear filters |
| No addresses (on checkout) | Inline "Add your first address" form |
| Filter combo with no results | "Try different filters" + clear filters |

---

## `apps/web` — Layout, Navigation, Footer

### Header
- Logo (left)
- Search bar (center, with autocomplete dropdown from Day 5)
- Right cluster: Wishlist icon (count badge), Cart icon (count badge), Account dropdown (Login/Signup if anonymous; Account / Orders / Logout if authenticated)
- Mobile: hamburger menu opens left drawer with same items

### Top category menu
- Horizontal strip of top-level categories below header (desktop) / inside drawer (mobile)
- Hover shows submenu with subcategories (depth 2)

### Footer
- 4 columns: Storm (About, Contact), Help (FAQ, Shipping, Returns), Legal (Privacy, Terms), Stay in touch (placeholder email signup — visual only)
- Bottom strip: copyright + payment icons (Visa, Mastercard, UPI, Rupay placeholders)

---

## `apps/web` — Loading & Feedback

### Skeleton loaders on
- Product detail page (image grid + text blocks)
- Listing/search results (12 product cards)
- Cart page (4 row skeletons)
- Order history (5 row skeletons)
- Order detail (sections)
- Account / profile pages

### Toast notifications
- Library: `sonner` or `react-hot-toast`
- Used for: cart add/remove, wishlist toggle, address actions, profile changes, error fallbacks
- Auto-dismiss 4s; click to dismiss

### Confirmation dialogs
- Delete address, cancel order, delete account, remove from wishlist (optional — Stage 2 polish)
- Built with shadcn/ui `AlertDialog`

### Image fallbacks
- `<ProductImage>` component with fallback to placeholder SVG if image fails to load or src missing
- alt-text from media-service `altText` field; default to product name

---

## India-Specific UX & Validation

### Currency formatting
- `formatINR(paise)` utility in `packages/contracts/format` — outputs `₹1,00,000.00` (Indian numbering with lakhs/crores separators)
- Used everywhere a price is displayed

### Date / time formatting
- Display in IST always: `28 May 2026, 3:45 PM IST`
- `formatDateIST(iso)` utility

### Phone validation (UI + API)
- Pattern: 10 digits, starts with 6–9; UI prepends `+91` visual; storage normalized

### Pincode validation
- Pattern: 6 digits, first digit 1–9

### Cookie consent banner
- Sticky bottom bar on first visit: "We use essential cookies for login and your cart. By continuing you accept." with "Accept" + "Learn more" (links to privacy page)
- Sets a consent cookie (`cookie_consent=accepted`, 1y) on accept
- Banner hidden once cookie set
- Stage 1 = essential-only; analytics consent is Stage 2 with DPDP

---

## Accessibility Pass

| Standard | Action |
|---|---|
| WCAG 2.1 AA | Color contrast verified in Tailwind config |
| Keyboard navigation | All interactive elements reachable via Tab; focus indicators visible |
| Skip-to-content link | Top of page |
| ARIA labels | On icon-only buttons (cart, wishlist, menu) |
| Form labels | Every input has associated `<label>` |
| Headings | Proper h1 → h6 hierarchy per page |
| Images | alt-text on every image; decorative images get `alt=""` |
| Lighthouse a11y score | ≥ 90 on home + product detail |

---

## Performance Budget Enforcement

- Lighthouse CI in pipeline running against home + product detail
- Budgets per `design/customer-frontend.md` §8:
  - LCP < 2.5 s
  - FCP < 1.5 s
  - Total JS < 200 KB gzipped (initial)
  - Per-route JS < 100 KB additional
- Pipeline fails if budget exceeded

---

## `apps/admin` — Dashboard

### `/dashboard` (post-login landing)
- Date range picker (default: last 7 days; presets: today, 7d, 30d, custom)
- Tiles (all filtered by date range):
  - Orders count (with comparison vs prior period)
  - Revenue (₹ Indian formatted)
  - Average order value
  - New users
  - Low-stock SKUs (count, links to inventory alerts)
  - Failed payments (count, links to admin payments)
- Recent activity feed (latest 10 audit log entries across services)
- Quick links: "Recent orders", "Pending shipments", "Low stock"

### Exports
- Orders CSV: filtered list export → background job → S3 → email link to admin (use existing notification path)
- Users CSV: same pattern
- Streamed for large result sets to avoid memory issues
- Endpoint: `POST /admin/orders/export` returns `{ exportId }`; admin gets email with download link when ready

### Notification log page (`/notifications`)
- Paginated list of recent sends (last 7 days)
- Filters: channel (email/sms), status (sent/failed), templateId, dateRange
- Click row → detail with full payload + provider response
- "Retry" button on failed (calls `POST /admin/notifications/:id/retry`)

### Audit log page (`/audit`)
- Cross-service audit feed (user changes, order changes, admin actions)
- Filters: actor, action type, date range
- Read-only

---

## End-to-End Test (Playwright)

### Golden path test
1. Sign up as new customer
2. Verify email (intercept Mailhog API to grab token)
3. Add address
4. Browse home → click product → product detail
5. Add to cart
6. Open cart → checkout
7. Select address → place order
8. Razorpay test payment success (use Razorpay test SDK / mock interaction)
9. Verify confirmation page
10. Receive confirmation email (Mailhog)
11. Admin logs in → sees order
12. Admin transitions to processing → shipped → delivered
13. Customer sees status updates on `/orders/:id`

### Additional smoke tests
- Anonymous browse + search + login + cart merge
- Wishlist add → move to cart
- Failed payment path
- Customer cancel before processing
- Admin blocks user → blocked user denied
- Image upload + product publish flow (admin)

### Test infra
- `pnpm test:e2e` runs against `docker-compose` stack
- Snapshot/screenshot on failure stored to `e2e-artifacts/`
- Zero retries on flaky tests; flakes get fixed not retried

---

## Bug-Fix Buffer
- Half of Day 9 (afternoon) reserved for fixing bugs surfaced during Days 2–8 end-to-end testing.

---

## Execution Order
1. Static pages + routing
2. 404 + error pages + all empty states
3. Layout: header, mobile menu, top category menu, footer
4. Loading skeletons across pages
5. Toast + confirmation dialog primitives
6. Currency / date / phone / pincode utilities + apply across UI
7. Cookie consent banner
8. Accessibility pass + Lighthouse CI
9. Admin dashboard with tiles + date filters
10. Admin notifications + audit pages
11. CSV export pipeline (orders, users)
12. Playwright golden path + smoke tests
13. Bug-fix buffer

---

## Definition of Done

| Check |
|---|
| All static pages render and are linked from footer |
| 404 and 500 pages branded; consistent navigation |
| All empty states implemented with helpful CTAs |
| Mobile menu works on small viewports |
| Toasts appear for cart, wishlist, profile actions |
| Currency renders as `₹1,00,000.00`; dates as `28 May 2026, 3:45 PM IST` |
| Pincode + phone validation enforced on every form |
| Cookie consent banner appears for new visitors; hidden after accept |
| Lighthouse a11y ≥ 90; performance budgets pass in CI |
| Admin dashboard tiles show correct numbers for date range |
| CSV export of orders works end-to-end (export → email → download) |
| Notification log + retry works |
| Playwright golden path passes consistently (zero flakes) |
| Known bugs from Days 2–8 closed |

---

## Out of scope today
- Production deployment (Day 10)
- Observability instrumentation (Day 10)
- GST/DPDP compliance (deferred)
- Reviews, refunds (Stage 2)
