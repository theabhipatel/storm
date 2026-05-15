# Customer Frontend Architecture (Next.js)

**Scope:** Storm's customer-facing web app. SEO matters. Built on Next.js (App Router) + TypeScript + Tailwind + Redux Toolkit + RTK Query + axios per [docs/frontend-state-management.md](../docs/frontend-state-management.md).

---

## 1. Page Inventory

| Route | Type | Purpose |
|---|---|---|
| `/` | Server Component (SSG/ISR) | Home — featured categories, top sellers, hero banners |
| `/c/[category-slug]` | Server Component (ISR, revalidate 60s) | Category listing page |
| `/p/[product-slug]` | Server Component (ISR, revalidate 60s) | Product detail (SEO-critical) |
| `/search` | Client Component | Search results with live filters |
| `/cart` | Client Component | Shopping cart |
| `/checkout` | Client Component | Multi-step checkout |
| `/orders` | Client Component | Order history |
| `/orders/[id]` | Client Component | Order detail |
| `/wishlist` | Client Component | Wishlist |
| `/account/*` | Client Component | Profile, addresses, password |
| `/auth/login` | Client Component | Login |
| `/auth/signup` | Client Component | Signup |
| `/auth/verify-email` | Client Component | Email verification |
| `/auth/forgot-password` | Client Component | Password reset request |

---

## 2. SSR vs CSR Decision

| Page | Why this choice |
|---|---|
| Home, category, product detail | Server-rendered for SEO + fast first paint; revalidate 60s via ISR |
| Search | Client — query-driven, personalized hints, no SEO value |
| Cart, checkout, orders, wishlist, account | Client — authenticated, user-specific, no SEO |

**Rule:** any page that should appear in Google → Server Component. Anything user-specific → Client Component.

---

## 3. Data Layer

| Concern | Where |
|---|---|
| Server components | Direct `fetch()` to web-bff endpoints; never go through Redux |
| Client components | RTK Query hooks via web-bff |
| Auth state | In-memory access token + httpOnly refresh cookie ([docs/authentication.md](../docs/authentication.md)) |
| Multi-step checkout draft | `createSlice` (no server state until order placed) |
| UI state (drawer, modal, theme) | `createSlice` |

---

## 4. SEO Strategy

| Concern | Approach |
|---|---|
| Title & meta | Per-page via `generateMetadata` in App Router |
| Structured data | JSON-LD `Product` schema on `/p/*`, `BreadcrumbList` on category and product pages |
| Sitemap | `/sitemap.xml` generated from catalog at build + revalidation |
| robots.txt | Standard; disallow `/cart`, `/checkout`, `/account` |
| Canonical URLs | Per product/category; reject duplicate query-string variations |
| Open Graph + Twitter cards | Per product (image, name, price) |
| Localized URLs | `/p/[product-slug]` uses kebab-case slug; redirects from old slugs preserved |

---

## 5. Image Optimization

| Concern | Approach |
|---|---|
| Loader | `next/image` with custom loader pointing at CloudFront |
| Responsive | `sizes` attribute per breakpoint; `srcset` auto-generated |
| Format | WebP with JPEG fallback |
| Priority | Above-the-fold images use `priority`; rest are lazy |
| LCP | Hero/product main image preloaded |

---

## 6. Component Architecture

| Layer | Lives in |
|---|---|
| Primitive UI (Button, Input, Card) | `apps/web/components/ui/` |
| Domain components (ProductCard, CartItem) | `apps/web/components/domain/` |
| Page components | `apps/web/app/<route>/page.tsx` |
| Shared layouts | `apps/web/app/<route>/layout.tsx` |

Tailwind utility-first. shadcn/ui base components. No CSS-in-JS.

---

## 7. Forms & Validation

| Concern | Tool |
|---|---|
| Form state | React Hook Form |
| Validation | Zod schemas (shared with API contracts where possible) |
| Server errors | Mapped to field-level errors via `error.code` from `ApiError` |

---

## 8. Performance Budgets

| Metric | Target |
|---|---|
| LCP | < 2.5 s |
| FCP | < 1.5 s |
| TTI | < 3.5 s |
| Total JS bundle (initial) | < 200 KB gzipped |
| Per-route JS | < 100 KB additional gzipped |

Enforced via Lighthouse CI on every PR.

---

## 9. Accessibility

| Concern | Approach |
|---|---|
| Standard | WCAG 2.1 AA |
| Keyboard navigation | All interactive elements reachable + visible focus |
| Screen readers | Semantic HTML; ARIA where necessary; tested with NVDA/VoiceOver |
| Color contrast | Tailwind config tuned to meet AA |
| Form labels | All inputs have associated labels |

---

## 10. Folder Structure

```
apps/web/
├── app/
│   ├── (marketing)/        # /, /c/, /p/ — server-rendered
│   ├── (shop)/             # /cart, /checkout, /orders — client
│   ├── (auth)/             # /auth/*
│   ├── (account)/          # /account/*
│   ├── api/                # Route handlers (auth proxy only)
│   └── layout.tsx
├── components/
│   ├── ui/                 # primitives
│   └── domain/             # product, cart, order, etc.
├── features/               # feature folders per [docs/frontend-state-management.md]
├── lib/                    # axios, baseQuery, tokenStore, apiError
├── store/                  # Redux store
├── public/
└── package.json
```
