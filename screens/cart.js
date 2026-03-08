import { getState, update } from "../state/store.js";
import { formatCurrency, generateOrderId, computeTotals } from "../lib/utils.js";
import { showToast } from "../lib/toast.js";

export const id = "cart-checkout";
export const label = "2. Cart + Checkout";
export const title = "Review Order + Pay";
export const description = "Customers confirm quantities, table number/contact details, and payment in one short flow.";

export function render(state) {
  if (state.cart.length === 0) {
    return `
      <div class="card">
        <div class="empty-state">
          <strong>Your cart is empty</strong>
          <p>Browse the menu to add items.</p>
          <button class="cta" data-action="go-to-menu" style="margin-top:0.8rem">Go to Menu</button>
        </div>
      </div>`;
  }

  const { subtotal, serviceFee, tax, total } = computeTotals(state.cart);

  return `
    <div class="layout-2">
      <section class="card">
        <h3>Cart Items</h3>
        <div class="stack">
          ${state.cart
            .map(
              (item) => `
            <article class="list-item row">
              <div>
                <strong>${item.name}</strong>
                <p class="screen-meta">${formatCurrency(item.price)} each</p>
              </div>
              <div class="row" style="gap:0.5rem;flex-shrink:0">
                <div class="qty-controls">
                  <button class="qty-btn" data-action="decrement-qty" data-item-id="${item.itemId}">&minus;</button>
                  <span style="min-width:1.5rem;text-align:center;font-weight:700">${item.qty}</span>
                  <button class="qty-btn" data-action="increment-qty" data-item-id="${item.itemId}">+</button>
                </div>
                <strong>${formatCurrency(item.price * item.qty)}</strong>
                <button class="cta soft" data-action="remove-from-cart" data-item-id="${item.itemId}" style="padding:0.4rem 0.6rem;font-size:0.8rem">Remove</button>
              </div>
            </article>`
            )
            .join("")}
        </div>
      </section>
      <aside class="card">
        <h3>Checkout Summary</h3>
        <div class="stack">
          <div class="row"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
          <div class="row"><span>Service fee (3.9%)</span><strong>${formatCurrency(serviceFee)}</strong></div>
          <div class="row"><span>Tax (9%)</span><strong>${formatCurrency(tax)}</strong></div>
          <hr />
          <div class="row"><span>Total</span><strong>${formatCurrency(total)}</strong></div>
          <div class="row">
            <label for="table-number-input">Table / Pickup</label>
            <input id="table-number-input" class="input-field" type="text"
                   inputmode="numeric" pattern="[0-9]*"
                   placeholder="Table #" />
          </div>
          <button class="cta" data-action="place-order">Place Order</button>
        </div>
        <p class="footer-note">MVP component goal: fewer cashier interactions for standard orders.</p>
      </aside>
    </div>`;
}

export const actions = {
  "increment-qty": (el) => {
    const cart = getState().cart.map((item) =>
      item.itemId === el.dataset.itemId ? { ...item, qty: item.qty + 1 } : item
    );
    update({ cart });
  },
  "decrement-qty": (el) => {
    const cart = getState()
      .cart.map((item) =>
        item.itemId === el.dataset.itemId ? { ...item, qty: item.qty - 1 } : item
      )
      .filter((item) => item.qty > 0);
    update({ cart });
  },
  "remove-from-cart": (el) => {
    const cart = getState().cart.filter((item) => item.itemId !== el.dataset.itemId);
    update({ cart });
    showToast("Item removed");
  },
  "place-order": () => {
    const s = getState();
    const tableInput = document.getElementById("table-number-input");
    const tableNum = tableInput ? tableInput.value.trim() : "";
    if (s.cart.length === 0) return showToast("Cart is empty", "warn");
    if (!tableNum || isNaN(tableNum) || +tableNum < 1 || +tableNum > 99) {
      return showToast("Enter a valid table number (1\u201399)", "warn");
    }
    const orderId = generateOrderId(s.orders);
    const { subtotal, serviceFee, tax, total } = computeTotals(s.cart);
    const now = new Date().toISOString();
    const order = {
      id: orderId,
      tableNumber: tableNum,
      items: [...s.cart],
      subtotal,
      serviceFee,
      tax,
      total,
      status: "ACCEPTED",
      statusHistory: [
        { status: "CREATED", timestamp: now },
        { status: "ACCEPTED", timestamp: now },
      ],
      createdAt: now,
    };
    update({
      orders: [...s.orders, order],
      cart: [],
      activeScreen: "status",
    });
    showToast(`Order ${orderId} placed!`);
  },
  "go-to-menu": () => update({ activeScreen: "menu" }),
};
