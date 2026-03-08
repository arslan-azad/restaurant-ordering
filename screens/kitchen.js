import { getState, update } from "../state/store.js";
import { formatTimeAgo } from "../lib/utils.js";
import { showToast } from "../lib/toast.js";

export const id = "kitchen";
export const label = "4. Kitchen Queue";
export const title = "Staff Order Management";
export const description = "Front-of-house and kitchen see a clear queue with prep urgency and special notes.";

const STATUS_DISPLAY = {
  ACCEPTED: { tag: "New", tone: "warn" },
  PREPARING: { tag: "Cooking", tone: "ok" },
  READY: { tag: "Ready", tone: "ok" },
};

const DELAYED_THRESHOLD_MS = 15 * 60 * 1000;

export function render(state) {
  const activeOrders = state.orders.filter((o) => o.status !== "DELIVERED");
  const deliveredOrders = state.orders.filter((o) => o.status === "DELIVERED");

  const delayedCount = activeOrders.filter(
    (o) => Date.now() - new Date(o.createdAt).getTime() > DELAYED_THRESHOLD_MS
  ).length;

  const avgPrep = computeAvgPrepTime(deliveredOrders);

  return `
    <div class="layout-2">
      <section class="card">
        <h3>Active Tickets</h3>
        ${
          activeOrders.length === 0
            ? `<div class="empty-state"><strong>No active tickets</strong><p>Orders will appear here when placed.</p></div>`
            : `<div class="stack">
                ${activeOrders.map((order) => renderTicket(order)).join("")}
              </div>`
        }
      </section>
      <aside class="card">
        <h3>Shift Snapshot</h3>
        <div class="metric-grid">
          <article class="metric"><p>Open tickets</p><strong>${activeOrders.length}</strong></article>
          <article class="metric"><p>Avg prep time</p><strong>${avgPrep}</strong></article>
          <article class="metric"><p>Delayed</p><strong>${delayedCount}</strong></article>
          <article class="metric"><p>Completed</p><strong>${deliveredOrders.length}</strong></article>
        </div>
      </aside>
    </div>`;
}

function renderTicket(order) {
  const display = STATUS_DISPLAY[order.status] || { tag: order.status, tone: "warn" };
  const itemSummary = order.items.map((i) => `${i.name} x${i.qty}`).join(", ");
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);

  return `
    <article class="list-item">
      <div class="row">
        <strong>${order.id}</strong>
        <span class="tag ${display.tone}">${display.tag}</span>
      </div>
      <p class="screen-meta">Table ${order.tableNumber} · ${itemCount} item${itemCount !== 1 ? "s" : ""} · ${formatTimeAgo(order.createdAt)}</p>
      <p class="screen-meta" style="font-size:0.82rem">${itemSummary}</p>
      <div class="row" style="margin-top:0.4rem">
        ${order.status === "ACCEPTED" ? `<button class="cta soft" data-action="mark-prep" data-order-id="${order.id}">Mark Prep</button>` : ""}
        ${order.status === "ACCEPTED" || order.status === "PREPARING" ? `<button class="cta" data-action="mark-ready" data-order-id="${order.id}">Mark Ready</button>` : ""}
        ${order.status === "READY" ? `<button class="cta" data-action="mark-delivered" data-order-id="${order.id}">Mark Delivered</button>` : ""}
      </div>
    </article>`;
}

function computeAvgPrepTime(deliveredOrders) {
  const times = deliveredOrders
    .map((o) => {
      const accepted = o.statusHistory.find((h) => h.status === "ACCEPTED");
      const ready = o.statusHistory.find((h) => h.status === "READY");
      if (accepted && ready) {
        return new Date(ready.timestamp).getTime() - new Date(accepted.timestamp).getTime();
      }
      return null;
    })
    .filter(Boolean);

  if (times.length === 0) return "--";
  const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
  const avgMin = Math.round(avgMs / 60000);
  return `${avgMin}m`;
}

function transitionOrder(orderId, newStatus) {
  const orders = getState().orders.map((o) => {
    if (o.id !== orderId) return o;
    return {
      ...o,
      status: newStatus,
      statusHistory: [...o.statusHistory, { status: newStatus, timestamp: new Date().toISOString() }],
    };
  });
  update({ orders });
  showToast(`${orderId} \u2192 ${newStatus}`);
}

export const actions = {
  "mark-prep": (el) => transitionOrder(el.dataset.orderId, "PREPARING"),
  "mark-ready": (el) => transitionOrder(el.dataset.orderId, "READY"),
  "mark-delivered": (el) => transitionOrder(el.dataset.orderId, "DELIVERED"),
};
