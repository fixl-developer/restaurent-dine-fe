# SmartDine Frontend — Masterplan

**Repo:** Cloned from `github.com/gitsamridhi/SmartDine` (already a complete UI built with mock data — our job is to wire it to the backend at `/backend`).

**Stack as cloned:** React 19 · Vite 6 · TypeScript 5.8 · Tailwind CSS v4 · motion · lucide-react · recharts.

**Stack additions in Phase 0:** TanStack Query (server cache) · socket.io-client (real-time) · react-router-dom (routing + back-button) · zustand (tiny client state, mainly auth) · sonner (toasts) · react-hook-form + zod (forms with shared validation).

**Already present in cloned repo (UI shells exist, currently using mock data):**

```
src/
├── App.tsx                              # manual page switcher → will become react-router
├── components/
│   ├── admin/                          # 13 admin pages (dashboard/orders/billing/...)
│   ├── operations/                     # KDS · TableOperations · BillingPayments
│   ├── customer/QROrderingFlow.tsx     # full guest QR flow (1,230 lines)
│   ├── marketing/                      # landing page
│   └── (shared) Header · Hero · CartDrawer · CheckoutModal · ComboConstructor · etc.
├── mockData.ts                          # the in-memory data we replace with API calls
├── foodData.ts                          # static menu mock
└── types.ts                             # TS interfaces — we'll align to backend DTOs
```

**Phase pattern (same as backend):** each phase is bite-sized, ends with a concrete demo, you confirm `"go phase N"`, and we move on.

---

## Phase 0 — Frontend Bootstrap & Cleanup

**Goal:** Clean repo, install fresh deps, set up the cross-cutting layers every other phase needs (HTTP client, query cache, socket, router, env config).

**Deliverables:**
- Strip unused deps from `package.json`: `@google/genai`, `express` (leftover from the AI Studio template).
- Add `@tanstack/react-query`, `socket.io-client`, `react-router-dom`, `zustand`, `sonner`, `react-hook-form`, `zod`.
- New `.env`:
  ```
  VITE_API_BASE_URL=http://localhost:4000/api/v1
  VITE_PUBLIC_BASE_URL=http://localhost:4000
  VITE_SOCKET_URL=http://localhost:4000
  ```
- `src/lib/api.ts` — fetch wrapper with: token attachment, refresh on 401, error normalization, response unwrapping (`{ success, data }` → `data`)
- `src/lib/queryClient.ts` — TanStack Query client with sensible defaults (retry once, 30s staleTime for list endpoints)
- `src/lib/socket.ts` — Socket.IO factory keyed by namespace, auto-reconnect, hot-reload safe
- `src/lib/types.ts` — shared backend DTO types (mirrored from backend schemas)
- `src/main.tsx` — wrap App with `<QueryClientProvider>`, `<BrowserRouter>`, `<Toaster>`
- Switch `App.tsx` to `react-router-dom` routes — keeps deep-linking and browser back/forward
- Replace `console.log`/`alert` calls with `sonner` toasts

---

## Phase 1 — Auth + RBAC client

**Goal:** Real staff login that calls our backend, token persistence, route guards.

**Deliverables:**
- `src/stores/auth.store.ts` (Zustand) — `accessToken`, `refreshToken`, `user`, `permissions`, `login()`, `logout()`, hydrate from localStorage
- `src/lib/api.ts` — auto-attach `Authorization: Bearer <token>`, on 401 try `/auth/staff/refresh` once, fail → logout
- `<Login />` component (replaces the placeholder we'll need to add — currently the cloned app has no login)
- `<RequireAuth>` wrapper for `/admin/*` routes; redirects to `/login` if missing token
- `<RequirePermission perm="...">` wrapper to hide UI by RBAC
- `/auth/me` rehydrate on app start so refresh preserves session
- Logout button in `AdminPortal` topbar
- Toast on login error

**Backend endpoints:** `POST /auth/staff/login`, `POST /auth/staff/refresh`, `POST /auth/staff/logout`, `GET /auth/me`

---

## Phase 2 — Restaurant Settings

**Goal:** `<AdminSettings>` reads + writes the real Restaurant singleton.

**Deliverables:**
- React-query hook `useRestaurant()` (GET /restaurant)
- Edit form: brand (name, color, contact, address, hours), tax (GSTIN, tax lines, service charge %, rounding), receipt template, currency, payment methods, operating modes
- Logo upload via multipart to `POST /restaurant/logo`
- Optimistic updates + revalidation on save

**Backend endpoints:** `GET /restaurant`, `PATCH /restaurant`, `POST /restaurant/logo`

---

## Phase 3 — Menu Management

**Goal:** Full live menu editing — biggest single phase on this side.

**Deliverables:**
- `<AdminMenuManagement>` wired:
  - Categories tab: list + drag-reorder (`POST /categories/reorder`) + CRUD + translations
  - Items tab: list (filter by category, food type, 86, station), CRUD, variants editor, modifier-group attach, availability windows
  - Modifier Groups tab: CRUD with embedded modifier rows + min/max selection validators
  - Combos tab: CRUD with item picker
- **Instant 86 toggle** with optimistic UI + `inventory:low_stock`-aware visual (red dot if recipe ingredients low)
- Image upload via `POST /items/:id/image` and `POST /combos/:id/image`
- **CSV import/export** modal: drag-and-drop file → POST `/menu/import`, returns row-by-row error table
- Real-time refresh — subscribe to Socket.IO `/menu` namespace; `item:86_changed` invalidates the relevant query

**Backend endpoints:** `/categories[/:id]`, `/items[/:id][/86, /image]`, `/modifier-groups[/:id]`, `/combos[/:id][/86, /image]`, `/menu/import`, `/menu/export`

---

## Phase 4 — Tables & QR Codes

**Goal:** Floor plan editor + QR generator/downloader.

**Deliverables:**
- `<AdminTables>`:
  - Grid/list view colored by status (vacant / seated / ordered / awaiting_bill / cleaning)
  - Bulk-add modal (rows of {number, zone, capacity})
  - Status transition buttons enforce the state machine
  - Merge / split / move modals
- `<AdminQR>`:
  - List QR codes (table + window)
  - **Download buttons** for PNG / SVG / PDF (just `<a href="/api/v1/qr-codes/:id/png" download>` after auth header set)
  - Bulk-generate for selected tables
  - Per-QR analytics card (scans, orders, avg bill, conversion)
- `<TableOperations>` (kitchen/floor-staff view) wired with live status via Socket.IO `/staff`

**Backend endpoints:** `/tables[/:id][/status, /merge, /split, /move]`, `/tables/bulk`, `/table-sessions[/open, /:id/close]`, `/qr-codes[/:id][/png, /svg, /pdf, /analytics, /regenerate]`, `/qr-codes/bulk`

---

## Phase 5 — Orders + KDS + Real-time (the big one)

**Goal:** This is the live operational heart — must be tight.

**Deliverables:**
- `<AdminOrders>`:
  - Live order pipeline: 4 columns (placed → accepted → preparing → ready/served) with cards
  - Filters: channel, table, waiter, status, date
  - Click a card → detail drawer: items, modifiers, notes, timeline, guest requests
  - Actions: accept, void item (manager PIN dialog), cancel, serve, mark picked-up (window token scan)
- `<KitchenDisplaySystem>` (the kitchen tablet UI):
  - Station selector (joins `/kds` socket → `station:<name>` room on select)
  - Large cards, color-coded by age (green <5min, amber 5–10, red >10)
  - Status flow buttons per card (accept → preparing → ready)
  - **Audio alert** on `order:new` event (HTML5 Audio)
  - "Recall last completed" button — opens dialog from `GET /kds/orders/:orderId/recall`
  - Offline tolerance: queue local status changes in IndexedDB, replay on reconnect
- `useSocket()` hook with namespace + room support
- Guest requests panel (`order:guest_request` events) with one-click resolve

**Backend endpoints + sockets:** `/orders[/:id][/accept, /serve, /cancel, /items, /items/:itemId/void, /requests/:reqId/resolve]`, `/orders/window/token-scan`, `/kds[/queue, /snapshot, /orders/:orderId/items/:itemId/status, /orders/:orderId/recall]`, Socket `/staff`, `/kds`

---

## Phase 6 — Billing, Payments, Invoices

**Goal:** Cashier flow + invoice viewer.

**Deliverables:**
- `<AdminBilling>` + `<BillingPayments>` (operations):
  - Open orders ready to bill → "Generate Bill" button with promo input row (discount/coupon/loyalty)
  - Promotion preview before commit (call `/coupons/validate`, `/loyalty/redeem-preview`)
  - Split bill UI: equal / by item / custom amounts
  - Record payment row: mode picker (cash/upi/card/wallet), amount, cashTendered+change for cash
  - **Dynamic UPI QR**: button → `POST /payments/upi/qr` → display QR image (we can render the `upi://` deeplink as a QR client-side with `qrcode.react`, or use the backend response)
  - Invoice list with status filter
  - **Invoice PDF**: open `/invoices/:id/pdf` in new tab
  - Refund modal
- Cash session sidebar widget:
  - Open / Close session
  - Live expected vs actual cash + variance
  - Denomination input on close

**Backend endpoints:** `/billing/orders/:id/bill`, `/invoices[/:id, /:id/pdf, /:id/split, /:id/discount, /:id/void]`, `/payments[/, /invoices/:invoiceId, /upi/qr, /:id/refund]`, `/cash-sessions[/open, /current, /:id/close]`

---

## Phase 7 — Inventory & Recipes

**Goal:** Track raw materials + author recipes.

**Deliverables:**
- `<AdminInventory>` wired:
  - Inventory list with low-stock filter, value column (currentStock × costPerUnit)
  - Per-item drawer: details, stock-in form, stock-out form, adjustment form, movements timeline
  - Snapshot card (item count, low-stock count, total value)
- Recipe builder modal (link recipe to item + variant, ingredient picker with unit conversion preview)
- Low-stock toast subscription via `/staff` socket `inventory:low_stock`

**Backend endpoints:** `/inventory[/, /low-stock, /snapshot, /:id, /:id/stock-in, /:id/stock-out, /:id/adjust, /:id/movements]`, `/recipes[/:id]`

---

## Phase 8 — Customers & Feedback

**Goal:** Customer DB + feedback inbox.

**Deliverables:**
- `<AdminCustomers>`:
  - Searchable list (q, tag, hasPhone)
  - Quick lookup by phone (`POST /customers/lookup`) used by cashier
  - Detail view: visit history, LTV, favorites, tag editor, allergen tags, notes, marketing opt-in
- Feedback inbox (we'll add as a new `<AdminFeedback>` section since it's separate):
  - Filterable list (rating, sentiment, channel, replied, ack'd)
  - Reply modal: text + via picker (sms/whatsapp/email)
  - Live feed of new feedback via `/staff` socket `feedback:new` + special toast on `feedback:negative_alert`
  - Tag distribution chart

**Backend endpoints:** `/customers[/, /lookup, /:id, /:id/history, /:id/tags[/:tag]]`, `/feedback[/, /summary, /:id, /:id/acknowledge, /:id/reply]`

---

## Phase 9 — Discounts, Coupons, Loyalty

**Goal:** Pricing-rule authoring.

**Deliverables:**
- `<AdminLoyalty>` covers all three (UI may need 3 tabs):
  - Discounts tab: list + create/edit form (type, value, scope, channels, time windows, min bill, max uses)
  - Coupons tab: list + create (auto-uppercase code), per-user limit input, usage progress bar
  - Loyalty tab:
    - Config form (earn rate, redeem rate, min redeem, max %, welcome bonus, etc.)
    - Per-customer account viewer (history timeline, adjust-points modal)
- Promotion preview in the billing flow (Phase 6) already uses these — this phase just adds the authoring UI

**Backend endpoints:** `/discounts[/:id]`, `/coupons[/:id, /validate]`, `/loyalty[/config, /accounts/:customerId, /accounts/:customerId/adjust, /redeem-preview]`

---

## Phase 10 — Notification Templates + Logs

**Goal:** Manager-editable templates with variable hints.

**Deliverables:**
- New `<AdminNotifications>` page (similar pattern to AdminSettings):
  - Events catalog from `GET /notifications/events` (left rail)
  - Template editor: code-mirror-style textarea with variable autocomplete (suggest tokens from event's variable list), live preview pane that renders against sample payload
  - Test-send modal (`POST /notifications/test`)
  - Delivery log table (filter by event, channel, status, recipient)

**Backend endpoints:** `/notifications[/events, /templates[/:id, /preview], /test, /logs]`

---

## Phase 11 — Reports & KPI Dashboard

**Goal:** This is mostly visual — recharts is already in deps.

**Deliverables:**
- `<AdminDashboard>` (home):
  - 7 KPI cards from `/reports/kpi-dashboard`
  - Today's sales sparkline (use `/reports/sales?groupBy=day&from=<7d ago>`)
  - Top-5 items chart
  - Live `feedback:new` ticker
- `<AdminReports>` tabs (each report gets a tab):
  - Sales (group-by switcher)
  - Items (top vs slow)
  - Tax (CGST/SGST breakup)
  - Payments (mode pie chart)
  - Staff
  - Footfall (hourly heatmap)
  - Inventory (consumption + wastage)
  - Feedback (sentiment + tag cloud)
  - Profitability
- Export buttons (CSV / XLSX / PDF) — just hit `/reports/:type/export?format=...` and let the browser download

**Backend endpoints:** `/reports[/kpi-dashboard, /sales, /items, /tax, /payments, /staff, /footfall, /inventory, /feedback, /profitability, /:type/export]`

---

## Phase 12 — Guest QR Ordering Flow

**Goal:** Replace the mock-data QR flow with real backend calls.

**Deliverables:**
- `<QROrderingFlow>`:
  - Auto-load menu from `GET /menu/public?lang=...&channel=dine_in`
  - Cart calculation client-side, matches our pricing
  - Place order: `POST /guest/orders/dine-in` with `{qrSlug, items[], guestPhone?, guestName?}`
  - Live status via Socket.IO `/guest` namespace joined with `?orderId=...`
  - "Order more" button: `POST /guest/orders/:id/items`
  - Guest requests: call waiter / water / bill
  - Feedback form post-served (`POST /guest/orders/:id/feedback`)
- **Window/takeaway flow** (new screen — cloned repo doesn't have this; we'll add it):
  - Phone entry → `POST /auth/guest/otp/request`
  - OTP entry → `POST /auth/guest/otp/verify` → stash guest token
  - Same cart flow → `POST /guest/orders/window` with `X-Guest-Token`
  - Pickup token display + countdown
- **Now-serving public board** (new tiny page `/now-serving`):
  - Big live tokens listed by status, driven by Socket.IO `/now-serving`

**Backend endpoints:** `/menu/public`, `/auth/guest/otp/*`, `/guest/orders[/dine-in, /window, /:id, /:id/items, /:id/requests, /:id/feedback]`, Socket `/guest`, `/now-serving`

---

## Phase 13 — Users, Roles, Audit Logs, RBAC polish

**Goal:** Owner-level admin surfaces + permission-aware UI.

**Deliverables:**
- `<AdminUsers>`:
  - List staff with role filter, search
  - Invite/create form
  - Edit role assignment, password reset, 2FA disable button
- Roles editor:
  - List built-in + custom roles
  - Custom-role form with permission checkbox tree (from `GET /roles/permissions`)
- `<AdminAuditLogs>`:
  - Filterable timeline (actor, entity, action, date range)
  - Before/after diff viewer for each entry
- **Apply RBAC throughout**: every sidebar item / button / form is wrapped in `<RequirePermission>`. Cashier doesn't see "Menu Management" etc.

**Backend endpoints:** `/users[/:id]`, `/roles[/:id, /permissions]`, `/audit-logs`

---

## Phase 14 — Deploy

**Goal:** Live frontend talking to live backend.

**Deliverables:**
- `frontend/vercel.json` — single-page-app rewrites, env var mapping
- Set `VITE_API_BASE_URL`, `VITE_SOCKET_URL`, `VITE_PUBLIC_BASE_URL` to point at the Render-deployed backend (or wherever)
- Commit → push to GitHub
- Vercel **New Project** → import from GitHub → autodetected as Vite → deploy
- Adjust backend `CORS_ORIGIN` to include the Vercel URL
- Verify the full QR flow on a real phone:
  1. Open `/admin/qr-codes` → download the PDF for Table AC-1
  2. Print or open on screen
  3. Scan with phone → guest menu loads
  4. Place order → see it land on `/admin/orders` and `/admin/kds` in real time

---

## Suggested folder additions (we'll layer onto the existing repo)

```
src/
├── lib/
│   ├── api.ts                  # fetch wrapper + token + 401 refresh
│   ├── socket.ts               # Socket.IO factory
│   ├── queryClient.ts
│   └── types.ts                # backend DTO mirrors
├── stores/
│   └── auth.store.ts           # Zustand
├── hooks/
│   ├── useAuth.ts
│   ├── useSocket.ts
│   ├── useRestaurant.ts
│   ├── useMenu.ts
│   ├── useOrders.ts
│   ├── useKds.ts
│   ├── useInventory.ts
│   ├── useCustomers.ts
│   ├── useFeedback.ts
│   ├── usePromotions.ts
│   ├── useNotifications.ts
│   ├── useReports.ts
│   ├── useGuestOrder.ts
│   └── ...one per feature module
├── routes/                     # if we keep manual routing, otherwise replace App.tsx switch
└── components/                 # existing — gets wired up phase by phase
```

---

## Open decisions (please confirm before Phase 0)

1. **Switch to react-router-dom or keep the manual `activePage` switcher?**
   I strongly recommend `react-router-dom` — URL-driven deep linking, browser back/forward, and we need real route paths for `/admin/menu`, `/kds`, `/qr/:slug`, etc. Confirm.

2. **Login UI** — the cloned repo doesn't have one. I'll create a `<LoginPage>` in Phase 1. Match the cottagecore aesthetic of the rest of the app?

3. **Window/takeaway flow** — the cloned repo doesn't have it (only dine-in). I'll add a new screen in Phase 12. OK?

4. **Now-serving public board** — same, doesn't exist. Add as a new minimal `/now-serving` page?

5. **Deploy target** — Vercel for the frontend (free, ideal for Vite)? Or Render alongside the backend?

Drop "go phase 0" once decisions are settled, and we begin.
