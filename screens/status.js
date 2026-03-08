import { getState, update } from "../state/store.js";
import { formatTime } from "../lib/utils.js";

export const id = "status";
export const label = "3. Live Order Status";
export const title = "Order Timeline";
export const description = "Customers can track order progress without asking staff, reducing interruption load.";

const ORDER_STAGES = [
  { status: "CREATED", label: "Order created" },
  { status: "ACCEPTED", label: "Order accepted" },
  { status: "PREPARING", label: "In kitchen" },
  { status: "READY", label: "Ready for pickup" },
  { status: "DELIVERED", label: "Delivered to table" },
];

export function render(state) {
  if (state.orders.length === 0) {
    return `
      <div class="card">
        <div class="empty-state">
          <strong>No orders yet</strong>
          <p>Place an order from the menu to track its progress here.</p>
          <button class="cta" data-action="go-to-menu" style="margin-top:0.8rem">Go to Menu</button>
        </div>
      </div>`;
  }

  const selectedId = state.selectedOrderId || state.orders[state.orders.length - 1].id;
  const order = state.orders.find((o) => o.id === selectedId) || state.orders[state.orders.length - 1];
  const currentIdx = ORDER_STAGES.findIndex((s) => s.status === order.status);

  return `
    <section class="card">
      <div class="row" style="margin-bottom:0.8rem">
        <h3>Order ${order.id}</h3>
        ${
          state.orders.length > 1
            ? `<select class="order-select" data-action="select-order">
                ${state.orders
                  .map(
                    (o) =>
                      `<option value="${o.id}" ${o.id === order.id ? "selected" : ""}>${o.id} \u2014 Table ${o.tableNumber}</option>`
                  )
                  .join("")}
               </select>`
            : `<span class="tag ok">Table ${order.tableNumber}</span>`
        }
      </div>
      <div class="stack">
        ${ORDER_STAGES.map((stage, i) => {
          const historyEntry = order.statusHistory.find((h) => h.status === stage.status);
          const timeStr = historyEntry ? formatTime(historyEntry.timestamp) : "\u2014";
          let tone, tagLabel;
          if (i < currentIdx) {
            tone = "ok";
            tagLabel = "Done";
          } else if (i === currentIdx) {
            tone = "warn";
            tagLabel = "Active";
          } else {
            tone = "";
            tagLabel = "";
          }
          return `
            <article class="list-item row ${i > currentIdx ? "muted" : ""}">
              <div>
                <strong>${stage.label}</strong>
                <p class="screen-meta">${timeStr}</p>
              </div>
              ${tagLabel ? `<span class="tag ${tone}">${tagLabel}</span>` : ""}
            </article>`;
        }).join("")}
      </div>
      <p class="footer-note">MVP component goal: less "where is my order" friction.</p>
    </section>`;
}

export const actions = {
  "select-order": (el) => update({ selectedOrderId: el.value }),
  "go-to-menu": () => update({ activeScreen: "menu" }),
};
