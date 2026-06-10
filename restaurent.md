Restaurant Management System — PRD
SmartDine: Single Restaurant, Single Vendor
Fixl Solutions
22 May 2026
Contents
Restaurant Management System 1
Product Requirements Document (PRD) . . . . . . . . . . . . . . . 1
1. Document Control . . . . . . . . . . . . . . . . . . . . . . . . . 2
2. Executive Summary . . . . . . . . . . . . . . . . . . . . . . . . 2
3. Product Vision & Goals . . . . . . . . . . . . . . . . . . . . . . . 3
4. Scope . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3
5. Stakeholders & User Personas . . . . . . . . . . . . . . . . . . . 4
6. System Architecture (High Level) . . . . . . . . . . . . . . . . . 5
7. Functional Modules . . . . . . . . . . . . . . . . . . . . . . . . 5
8. Non-Functional Requirements . . . . . . . . . . . . . . . . . . . 13
9. Key User Flows . . . . . . . . . . . . . . . . . . . . . . . . . . . 14
10. High-Level Data Model . . . . . . . . . . . . . . . . . . . . . . 15
11. Integrations . . . . . . . . . . . . . . . . . . . . . . . . . . . . 15
12. Acceptance Criteria (V1.0) . . . . . . . . . . . . . . . . . . . . 16
13. Assumptions & Constraints . . . . . . . . . . . . . . . . . . . . 16
14. Future Enhancements (Roadmap) . . . . . . . . . . . . . . . . 17
15. Glossary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 17
16. Sign-Off . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 17
Restaurant Management System
Product Requirements Document (PRD)
Product Name: SmartDine — Single-Restaurant, Single-Vendor Management Platform Document Version: 1.0 Prepared For: Fixl Solutions Pre1
pared By: Product Engineering Team Date: 22 May 2026 Status: Approved for Build
1. Document Control
Version Date Author Change Summary
0.1 05 May 2026 Product Team Initial outline
0.5 14 May 2026 Product Team Module-level features added
0.9 19 May 2026 Product + UX User flows, data model, NFRs added
1.0 22 May 2026 Product Team Baseline release for engineering build
Distribution List: Vendor / Owner, Engineering Lead, UI/UX Lead, QA
Lead, DevOps, Customer Success.
2. Executive Summary
SmartDine is a focused, single-tenant restaurant management platform designed for an owner-operated restaurant (“single vendor”) that runs one
outlet (“single restaurant”). It digitizes the entire guest journey — from
table seating and QR-based ordering, through kitchen execution, to billing
and feedback — and gives the vendor a single dashboard to operate the
business.
The platform is built around four primary touchpoints:
1. A dine-in self-service QR ordering experience for guests at the table.
2. A window / takeaway QR ordering experience for walk-in pickup
customers.
3. A kitchen display & order management console for staff.
4. A vendor admin dashboard for menu, pricing, inventory, reports, and
configuration.
2
The system reduces order-taking errors, lowers staff dependency, accelerates table turnover, and gives the vendor real-time visibility into sales, top
items, and operating costs.
3. Product Vision & Goals
Vision. Enable a single-outlet restaurant to operate at the efficiency of a
chain — with paperless ordering, real-time kitchen coordination, and datadriven decisions — without needing a large IT team.
Primary Goals.
• Eliminate paper menus and manual KOT slips.
• Reduce average order capture time from ~4 minutes to under 60 seconds.
• Provide guests a contactless, multilingual ordering experience.
• Give the kitchen a clear, prioritized queue with real-time status.
• Give the vendor one consolidated view of sales, inventory, and customer behavior.
Success Metrics (first 90 days post-launch).
• 80% of dine-in orders captured through the QR self-service flow.
• 95% of orders reaching the kitchen within 5 seconds of placement.
• < 1% order-mismatch complaints.
• Daily-active use of the vendor dashboard ≥ 90% of operating days.
• Average bill settlement time reduced by 40%.
4. Scope
In Scope (v1.0).
• Single restaurant, single vendor (owner) account.
• Multi-role staff accounts (manager, cashier, waiter, kitchen).
• QR-based dine-in self-ordering, QR-based window/takeaway ordering,
and assisted (waiter) ordering.
3
• Menu, category, modifier, and availability management.
• Real-time kitchen display (KDS) and order management.
• Billing, GST-compliant invoicing, split bills, and digital payments.
• Basic inventory deduction per recipe, low-stock alerts.
• Customer database, feedback capture, and loyalty points.
• Reports: sales, items, taxes, payments, staff, footfall.
• Notifications via SMS, Email, WhatsApp, and in-app push.
Out of Scope (v1.0).
• Multi-outlet / franchise management.
• Marketplace aggregator integrations (Swiggy/Zomato/UberEats) —
planned for v1.1.
• Reservation/table-booking calendar — planned for v1.2.
• Full accounting / payroll modules.
• Native mobile apps for guests (guest flow is web-based via QR).
5. Stakeholders & User Personas
Vendor / Owner (Priya, 38). Owns and operates the restaurant. Wants
real-time visibility into sales, costs, and staff performance from her phone.
Not technical.
Restaurant Manager (Arjun, 32). Runs the floor day-to-day. Configures
menus, monitors orders, handles refunds and discounts, closes the day.
Cashier (Ravi, 26). Generates bills, accepts payments, prints receipts.
Needs a fast, error-proof billing screen.
Waiter / Captain (Sunita, 24). Assists guests, helps with QR scanning,
takes assisted orders for guests who prefer to dictate, serves food when
KDS marks ready.
Kitchen Staff / Chef (Raj, 40). Reads incoming KOTs on the kitchen display, updates status (accepted → preparing → ready). Needs large, readable
cards and audio alerts.
Dine-in Guest (Aisha, 29). Scans the table QR, browses the menu in her
4
preferred language, places an order, pays in-app or at counter. Expects the
flow to “just work” in under 2 minutes.
Window / Takeaway Guest (Karan, 35). Scans the QR on the takeaway
window, places and pre-pays for an order, gets a token, and is notified when
ready for pickup.
6. System Architecture (High Level)
The platform is a cloud-hosted, multi-surface system:
• Backend. Stateless API service, relational database, async job queue,
and a real-time websocket layer for KDS and order status updates.
• Vendor Dashboard. Responsive web app accessible from desktop,
tablet, and mobile browsers.
• KDS Console. Browser-based, optimized for a kitchen-mounted
tablet/TV in landscape mode.
• Guest Web App. Lightweight progressive web app loaded via QR —
no install required. Works on slow networks.
• Printer Bridge. Local print agent that connects the cloud platform to
the on-premise thermal printer for KOT and bill printing.
• Integrations Layer. Payment gateway, SMS, WhatsApp Business, and
email service providers.
A more detailed technical design will live in the System Architecture Document (SAD) maintained by Engineering.
7. Functional Modules
7.1 Vendor / Admin Dashboard
The home of the system for the owner and manager. Key capabilities:
• Live sales counter (today / week / month) with trend indicators.
• Order pipeline widget (new / preparing / ready / served / settled).
5
• Top-selling items, slowest-moving items, peak hours heatmap.
• Quick actions: add menu item, generate QR, mark item out-of-stock,
close day.
• Notifications inbox (low stock, refund requests, negative feedback,
payment failures).
• Role-aware visibility: cashier and waiter see only their relevant widgets.
7.2 Restaurant Profile & Settings
A single-restaurant configuration screen for:
• Brand identity: name, logo, brand color, contact details, location, opening hours.
• Tax profile: GSTIN, CGST/SGST/IGST rates, service charge %, rounding rules.
• Currency, time zone, and language (primary + supported guest languages).
• Receipt template: header, footer, FSSAI license, return policy text.
• Payment methods accepted (cash, UPI, card, wallet, online prepay).
• Operating modes toggle: dine-in ON/OFF, takeaway ON/OFF, online
prepay ON/OFF.
7.3 User & Role Management
Role-based access control for all staff users:
• Built-in roles: Owner, Manager, Cashier, Waiter, Kitchen, ReadOnly.
• Custom roles with granular permissions (view orders, edit menu, issue
refunds, apply discounts above ₹X, close day, etc.).
• Login via email + password with optional OTP-based 2FA.
• Session limits per role (e.g., kitchen sessions auto-extend; cashier sessions lock on idle).
• Activity log for every user action that affects price, stock, or refunds.
6
7.4 Menu Management
The menu is the system’s most-edited entity, so editing must be fast and
forgiving.
• Categories. Ordered, draggable list (e.g., Starters, Main Course,
Breads, Beverages, Desserts).
• Items. Name, description, image, price, prep-time estimate, food type
tag (Veg / Non-Veg / Egg / Vegan), spice level, calories (optional), allergens.
• Variants. Half / Full, Small / Medium / Large, with independent prices
and stock.
• Add-ons & Modifiers. Required vs. optional groups (e.g., choose-1
sauce, choose-up-to-3 toppings) with price deltas.
• Combos. Bundle multiple items at a fixed price.
• Availability windows. Item shows only during defined hours (e.g.,
breakfast 7–11 AM).
• 86 / Out-of-stock toggle. Instantly hides item from all guest surfaces.
• Multi-language captions. Per-item translations for guest-facing
menus.
• Bulk operations. CSV/Excel import-export for menu setup and bulk
price changes.
7.5 QR Code Management
The QR module is the bridge between physical space and digital ordering.
Two QR types are supported:
Table QR (dine-in). One unique QR per table — encodes the table number
/ zone so the order is automatically routed and seated.
Window / Takeaway QR (online order). One or more QRs printed at the
takeaway window or storefront. Encodes a takeaway context (no table);
guest enters or confirms name and mobile.
Capabilities:
• Bulk generate QRs for N tables with table numbers and zones (e.g.,
AC-1, Garden-3).
7
• Choose QR style: plain, branded (logo in center), or designed (printable A5/A6 table tent).
• Download as PNG, SVG, or print-ready PDF sheet.
• Per-QR analytics: scans, orders, average bill, abandonment rate.
• Reassign / disable / regenerate a QR if one is damaged or stolen.
• Optional dynamic QR (server-side redirect) so destination URL can
change without reprinting.
7.6 Self-Service Ordering (Dine-In Guest Flow)
The dine-in guest experience must work on any phone, in poor network, in
under 2 minutes.
Flow.
1. Guest scans the table QR; web app loads with the table pre-bound.
2. Guest optionally selects language (English, Hindi, regional).
3. Browses categorized menu with images, prices, veg/non-veg markers,
and search.
4. Adds items to cart, configures variants / add-ons, leaves item-level
notes (e.g., “less spicy”).
5. Reviews cart, applies a coupon (if any), and places the order.
6. Optionally prepays via UPI / card; or chooses “Pay at counter”.
7. Receives a live order status (Placed → Accepted → Preparing → Ready
→ Served).
8. Can place additional rounds on the same table session (“Order
more”).
9. Requests bill in-app; cashier closes session.
Guest-side features.
• Bill split: by item, equal split, or custom split.
• Call waiter / request water / request bill — sent to the staff app as a
soft notification.
• Tip option at payment.
• Feedback prompt after settlement (1–5 stars + optional text + tag
chips).
8
7.7 Window / Online Order (Takeaway Flow)
For walk-up takeaway windows and storefront pickup.
Flow.
1. Guest scans the window QR or visits the public order URL.
2. Enters / confirms name and mobile (OTP-verified for first-time customers).
3. Browses the takeaway menu (which can differ from the dine-in menu
— e.g., excludes plated-only items).
4. Selects pickup time (ASAP or scheduled within operating hours).
5. Prepays mandatorily (configurable) via UPI / card / wallet.
6. Receives an order token (e.g., #T-042) on screen and via SMS / WhatsApp.
7. Kitchen prepares; KDS marks “Ready”.
8. Guest receives a “Ready for pickup” SMS / WhatsApp with token.
9. Cashier scans the token QR (sent to guest) at handover to mark “Picked
up”.
Window-mode-only features.
• Promised time estimator based on current kitchen load and item prep
times.
• Live “Now Serving” board (web URL) that the restaurant can display
on a screen at the window.
• Auto-refund flow if the kitchen cancels an item (out of stock after order
placed).
7.8 Order Management & Kitchen Display (KOT / KDS)
The operations heart of the system.
Order Management (staff view).
• Unified queue of all orders across channels (dine-in / window / assisted), with channel badges.
• Filters: by status, channel, table, waiter, time window.
• Order detail panel: items, modifiers, notes, guest info, payment status,
9
timeline.
• Actions: accept, reject (with reason), modify (with manager PIN), apply discount, void item, refund.
• Real-time updates via websocket — no manual refresh needed.
Kitchen Display System (KDS).
• Large card layout, color-coded by age (green < 5 min, amber 5–10 min,
red > 10 min).
• Audio alert on new order.
• Status flow on the card: New → Accepted → Preparing → Ready.
• Per-station routing (e.g., tandoor, grill, beverages) — items appear only
on the station they belong to.
• “Recall” the last completed order in case of dispute.
• Offline tolerance: KDS keeps last-known queue if internet drops, syncs
on reconnect.
KOT printing. Optional thermal printer integration — KOT auto-prints to
the right station printer when the order is accepted.
7.9 Table Management
• Floor plan / list view of all tables, color-coded by status: Vacant, Seated,
Ordered, Awaiting Bill, Cleaning.
• Move / merge / split tables (e.g., merge T-4 and T-5 for a group of 8).
• Table-level dwell time and average ticket size.
• Reservation hold (manual block for v1.0; calendar-based booking in
v1.2).
7.10 Billing & Payments
Billing.
• Auto-generated bill from order items with applied taxes and charges.
• Edit before settlement (with manager PIN): apply discount, remove
item, change quantity.
• Split bill: by guest, by item, equal, or custom.
• Print on thermal printer, share via WhatsApp / SMS / Email.
10
Payments.
• Cash: open cash drawer, change calculation, denomination tracking.
• UPI: dynamic QR per bill with auto-reconciliation when payment is confirmed.
• Card: integrated with EDC (where supported) or manual entry of transaction ID.
• Wallets and online prepay (Razorpay / PhonePe / Stripe — vendor configurable).
• Split tender: part cash + part UPI on a single bill.
• End-of-day cash reconciliation report.
7.11 Inventory Management (Basic)
• Raw material master with units (kg, L, pcs) and supplier mapping.
• Recipe-based deduction: each menu item maps to ingredients consumed per unit sold.
• Manual stock-in (purchase entry) and stock-out (wastage, transfer).
• Low-stock alerts with configurable thresholds.
• Daily inventory snapshot for variance analysis.
Full procurement, PO, and supplier ledgers are deferred to a future inventory module.
7.12 Customer Management & Feedback
• Auto-created customer record from order phone/email.
• Visit history, lifetime value, favorite items, last visit date.
• Tags (regular, VIP, allergic, do-not-contact).
• Feedback inbox with star rating, free text, and tag chips (Service, Food,
Speed, Cleanliness).
• Manager-side reply to feedback via SMS / WhatsApp.
7.13 Discounts, Coupons & Loyalty
• Flat % or flat ₹ discounts.
• Item / category-specific discounts.
11
• Time-bound offers (Happy Hour 4–7 PM, Weekend Brunch).
• Coupon codes with usage limits, expiry, min-bill rules.
• Loyalty points: earn per ₹ spent, redeem in increments — fully configurable.
• BOGO and bundle offers.
7.14 Tax & Compliance
• GSTIN configuration with CGST + SGST or IGST split as applicable.
• HSN/SAC code per item or per category.
• Round-off rule (nearest ₹1) configurable.
• GST-compliant invoice with sequential invoice number.
• Daily / monthly GST summary export (CSV).
• FSSAI license number on receipt.
7.15 Notifications
A single notifications module powering every channel.
• SMS — transactional (order placed, ready, OTP, bill).
• WhatsApp Business — same as SMS plus media (digital bill PDF).
• Email — bills, daily summary to owner, weekly reports.
• In-app push / web push — staff notifications, KDS alerts.
• Templates editable in the dashboard with variable placeholders.
7.16 Reports & Analytics
Standard reports, exportable as CSV / PDF, with date-range filters and channel filters.
• Sales Report. Day / week / month, by channel, by category, by item.
• Item Performance. Top sellers, slowest movers, profitability per
item.
• Tax Report. GST collected and split, ready for filing.
• Payment Report. Breakdown by mode, refunds, voided bills.
• Staff Report. Orders handled, discounts applied, voids — flag anomalies.
12
• Footfall & Channel Mix. Dine-in vs. takeaway, peak hours, table
dwell time.
• Inventory Report. Consumption, wastage, variance.
• Feedback Report. Average rating, tag distribution, complaint trends.
A KPI dashboard summarizes the seven most important numbers on the
home screen.
7.17 Audit Logs & Activity History
Every sensitive action is logged with user, timestamp, before/after snapshot:
• Price changes, discounts, voids, refunds.
• Role and permission changes.
• Menu publish events.
• KDS overrides.
Logs are retained for at least 12 months and exportable on demand.
8. Non-Functional Requirements
Performance. Guest menu loads in under 2 seconds on a 3G connection.
Order-place to KDS appearance in under 3 seconds at the 95th percentile.
Dashboard reports render in under 5 seconds for a 30-day window.
Availability. Target uptime of 99.5% measured monthly. Planned maintenance windows scheduled outside operating hours.
Scalability. Architected to comfortably handle 1,000 orders per day per
outlet with headroom up to 5,000 — sufficient for a busy single restaurant.
Security. TLS for all traffic; passwords hashed with a modern algorithm;
sensitive PII (mobile, email) encrypted at rest. Role-based access control
on every API. PCI-DSS handled by the payment gateway — no card data
stored.
13
Reliability. KDS and guest order app degrade gracefully on intermittent
connectivity. Offline queue on KDS with auto-sync on reconnect.
Auditability. All financial actions are logged immutably for at least 12
months.
Accessibility. Guest web app conforms to WCAG 2.1 AA where practical
— sufficient color contrast, keyboard navigation, screen-reader-friendly labels.
Localization. UI strings extracted for translation; right-to-left layouts not
required for v1.0 but architected to be supported.
Compliance. Indian GST and FSSAI labeling on receipts. Customer consent captured before marketing communications.
9. Key User Flows
Dine-in Guest Flow. Guest scans table QR → menu loads → browses →
adds to cart → places order → kitchen confirms → guest sees live status →
after meal requests bill → pays (in-app or counter) → leaves feedback.
Window / Takeaway Flow. Guest scans window QR → enters phone (OTP)
→ selects items → schedules pickup → prepays → receives token → kitchen
prepares → guest gets “Ready” SMS → cashier scans token → order marked
picked up.
Staff Order Flow. New order alert on staff console → manager accepts
→ KDS displays order at relevant stations → kitchen marks Preparing →
kitchen marks Ready → waiter serves → order marked Served → cashier
settles bill.
Menu Update Flow. Manager opens menu → edits item (price, availability,
image) → preview → publish → change is reflected on all live QR menus
within seconds. Activity log captures the change.
Day-Close Flow. Manager opens day-close → system shows day totals,
payment-mode breakdown, cash reconciliation, voids, refunds, top items →
14
manager enters cash counted → variance computed → day closes → reports
emailed to owner.
10. High-Level Data Model
The primary entities and their key relationships:
• Vendor (1) — one record (the owner of the system).
• Restaurant (1) — single outlet, belongs to Vendor.
• User (N) — staff accounts, belong to Restaurant, have one Role.
• Role (N) — permission bundles.
• Table (N) — physical tables; each has one Table QR.
• QRCode (N) — table or window context, encodes a target URL.
• Category (N) → Item (N) → Variant (N), ModifierGroup (N) → Modifier (N).
• Customer (N) — created on first order.
• Order (N) → OrderItem (N) with applied Modifiers; belongs to Table or Window context; tied to a Customer (optional for cash counter
orders).
• Payment (N) — belongs to Order; supports multiple payments per order (split tender).
• Invoice (1 per Order) — GST-compliant bill snapshot.
• InventoryItem (N) and Recipe mapping to Item.Variant.
• Discount / Coupon / LoyaltyAccount entities.
• Notification and AuditLog as cross-cutting tables.
A formal ER diagram is maintained in the SAD.
11. Integrations
• Payment Gateway. Razorpay, PhonePe, Stripe (vendor selects one at
setup).
• WhatsApp Business API. Via a BSP for transactional templates.
• SMS Gateway. DLT-compliant transactional sender for India.
15
• Email. SMTP or a transactional provider (e.g., SendGrid, AWS SES).
• Thermal Printer. Via local print agent supporting ESC/POS over USB
and LAN.
• EDC / Card Machine. Optional integration with vendor-supplied
EDC.
• Analytics / Crash Reporting. Internal observability stack — not exposed to the vendor.
12. Acceptance Criteria (V1.0)
The release is considered acceptance-complete when:
• A guest can scan a table QR, place an order, and the order appears on
the KDS within 3 seconds at the 95th percentile.
• A guest at the takeaway window can scan, prepay, and receive a token,
and is notified when the order is ready.
• Staff can manage menu, QR codes, orders, billing, and reports without
engineering intervention.
• All financial transactions produce a GST-compliant invoice with a sequential number.
• Day-close reconciliation matches across orders, payments, and reports
with zero discrepancy on test data.
• All P0 and P1 defects are closed; no critical or high-severity security
issues open.
13. Assumptions & Constraints
Assumptions.
• The restaurant has stable broadband and a backup mobile hotspot.
• Tables have visible, durable QR placements (tent cards, table stickers,
or laminated standees).
• A tablet or TV is mounted in the kitchen for the KDS.
• The owner has a registered GSTIN and FSSAI license.
16
Constraints.
• Single-restaurant, single-vendor architecture — multi-outlet is explicitly out of scope.
• Aggregator integrations (Swiggy / Zomato) are deferred.
• Native guest mobile apps are out of scope; guest UX is web-only via
QR.
14. Future Enhancements (Roadmap)
• v1.1 — Aggregator integrations (Swiggy, Zomato, UberEats) with unified order queue.
• v1.2 — Reservation and table-booking calendar with deposits.
• v1.3 — Multi-outlet expansion path with centralized menu and roll-up
reports.
• v1.4 — Advanced procurement (POs, supplier ledger, vendor payouts).
• v1.5 — AI-driven demand forecasting and dynamic pricing.
• v2.0 — Multi-tenant SaaS positioning for independent restaurants.
15. Glossary
KOT — Kitchen Order Ticket. The instruction sent from the order system to
the kitchen. KDS — Kitchen Display System. The digital screen replacing
paper KOTs. 86 — Restaurant slang for “item is out of stock”. Window
Order — A takeaway / pickup order placed at the storefront window, typically via QR. Dine-in — Order consumed at a table inside the restaurant.
EDC — Electronic Data Capture device (card-swipe machine). GSTIN —
Goods and Services Tax Identification Number. FSSAI — Food Safety and
Standards Authority of India.
16. Sign-Off
17
Role Name Signature Date
Vendor / Owner
Product Lead
Engineering Lead
QA Lead
End of Document — SmartDine PRD v1.0
18