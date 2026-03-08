# TableFlow MVP

A functional front-end **prototype** of a restaurant ordering + feedback system. All 7 screens are fully interactive with client-side state management — browse a menu, build a cart, place orders, manage kitchen tickets, submit feedback, and view computed insights. No backend; state resets on page refresh.

## Project Status

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed build status, gap analysis, architecture diagrams, and the roadmap.

## System Design

See [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) for the target backend architecture (not yet implemented).

## Screens

1. **Customer Menu** — browse categories, drill into items, add to cart
2. **Cart + Checkout** — adjust quantities, live totals, enter table number, place order
3. **Live Order Status** — real-time order timeline driven by state
4. **Kitchen Queue (Staff)** — ticket management with Mark Prep / Ready / Delivered
5. **Feedback Capture** — sentiment, 1–5 star rating, comments, submit with auto-escalation alerts
6. **Feedback Inbox (Manager)** — triage, assign, and resolve customer issues
7. **Service Insights Dashboard** — metrics computed live from orders and feedback

## Run

```
npx serve
```

Then open http://localhost:3000.

> **Note:** ES modules require a local server. `npx serve` works in all browsers. Opening `index.html` directly via `file://` works in Chrome/Firefox/Edge but not Safari.

## Architecture

```
app.js              ← orchestrator: imports, event delegation, render loop
state/store.js      ← reactive state: getState(), update(), subscribe()
data/menu.js        ← 29 menu items across 4 categories
screens/*.js        ← 7 screen modules (render + action handlers)
lib/utils.js        ← formatting and computation helpers
lib/toast.js        ← toast notification system
styles.css          ← design system: tokens, components, responsive layout
```

All interactivity is client-side. No npm dependencies are required at runtime (puppeteer is dev-only for screenshots).
