# CampusBid — Admin App

The internal admin console for CampusBid: approve vendors, moderate the product catalog and categories, review orders and payments, and watch platform-wide KPIs — backed by the [CampusBid backend](../campus-bid-backend-web-app).

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Radix UI primitives · Recharts

Unlike the customer and vendor apps, this one has **no TanStack Query and no Socket.IO** — data fetching is plain `useEffect`/`useState` per page, and the notification bell polls rather than listening on a socket. Keep new pages consistent with that if you add one, rather than introducing a second data-fetching pattern.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your backend
npm run dev                        # http://localhost:5001
```

There is **no admin self-registration** — accounts are `User` documents with `role: 'admin'`, created directly in the database (or promoted from an existing user) rather than through any UI in this app or the backend. Provision at least one before you can log in.

```bash
npm run lint    # eslint
npm run build   # production build
```

**No test suite exists in this app yet.** The customer app has a Vitest + Testing Library setup you can lift wholesale if you want to add one here — see its `vitest.config.mts`/`vitest.setup.ts` and `lib/api/__tests__/`, `components/pages/__tests__/` for the pattern.

## App structure

Routes live under `app/admin/*`; `app/admin/layout.tsx` renders the sidebar (`components/admin/admin-sidebar.tsx`) and redirects to `/admin/login` for anyone without a session, gated on `useUser()`'s `isLoading` flag so it doesn't flash a redirect before the persisted session has had a chance to restore.

| Route | Purpose |
| --- | --- |
| `/admin/dashboard` | Platform KPIs (revenue/orders/customers with period-over-period deltas), order-status and category charts |
| `/admin/vendors` | Vendor list, approve/reject pending vendors |
| `/admin/customers` | Customer list |
| `/admin/orders` | All orders, cross-vendor |
| `/admin/products` | Product moderation |
| `/admin/categories` | Category CRUD |
| `/admin/payments` | Payment list/filter, manual status override |
| `/admin/analytics` | Deeper platform analytics |
| `/admin/settings` | Admin account settings |
| `/admin/login`, `/admin/forgot-password`, `/admin/reset-password` | Auth |

`lib/api/*.ts` is one file per backend resource (`vendors.ts`, `payments.ts`, `categories.ts`, etc.) — each a thin `apiFetch` wrapper, no query-library hooks (see the stack note above). `components/notification-bell.tsx` + `components/notifications-panel.tsx` are shared across every admin page via the sidebar.

## Conventions worth knowing before changing things

- **Auth**: JWT access + refresh tokens in `lib/api/token-storage.ts` (`localStorage`); `lib/api/client.ts`'s `apiFetch` retries once on a 401 via refresh, then clears tokens. Same shape as the other two apps — if you're used to one, you're used to all three.
- **Styling is literal Tailwind classes** (`gray-100`, `purple-600`, etc.), not shadcn's semantic tokens (`muted-foreground`, `accent`) the way the customer and vendor apps mostly use. Match whichever convention is already in the file you're editing rather than mixing both in one component.
- **Admin notifications are a recent, narrow addition.** The backend only recognizes admins as a notification recipient for one event so far (a customer disputing a payment) — don't assume every admin-relevant event notifies yet; check `notifyAllAdmins()` call sites in the backend before relying on it.

## Known gaps

- The admin notification bell has passed a type-check but has **not been exercised in a live browser session** — verifying it required a test login, and setting one up by directly editing the shared `admin@campusbid.com` account's password in the database was deliberately not done. Get a real (or throwaway) admin credential and click through it before treating it as fully verified.
- No automated tests, as noted above — this is the highest-value gap to close next if you're hardening this app before hosting it.
