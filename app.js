import { getState, update, subscribe } from "./state/store.js";
import { initToasts } from "./lib/toast.js";

import * as menuScreen from "./screens/menu.js";
import * as cartScreen from "./screens/cart.js";
import * as statusScreen from "./screens/status.js";
import * as kitchenScreen from "./screens/kitchen.js";
import * as feedbackFormScreen from "./screens/feedback-form.js";
import * as feedbackInboxScreen from "./screens/feedback-inbox.js";
import * as insightsScreen from "./screens/insights.js";

const screens = [
  menuScreen,
  cartScreen,
  statusScreen,
  kitchenScreen,
  feedbackFormScreen,
  feedbackInboxScreen,
  insightsScreen,
];

const actionHandlers = {};
for (const screen of screens) {
  if (screen.actions) Object.assign(actionHandlers, screen.actions);
}

const root = document.getElementById("screenRoot");
const nav = document.getElementById("screenNav");

function renderNav(state) {
  const cartCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  nav.innerHTML = screens
    .map((s) => {
      const badge =
        s.id === "cart-checkout" && cartCount > 0
          ? `<span class="cart-badge">${cartCount}</span>`
          : "";
      return `<button class="nav-btn ${s.id === state.activeScreen ? "active" : ""}" data-screen="${s.id}">${s.label}${badge}</button>`;
    })
    .join("");
}

function preserveFormValues(state) {
  // Save textarea/input values before re-render so they survive DOM replacement
  const comment = document.querySelector("[data-field='feedback-comment']");
  if (comment && state.activeScreen === "feedback-form") {
    state.pendingFeedback = { ...state.pendingFeedback, comment: comment.value };
  }
}

function renderScreen(state) {
  const screen = screens.find((s) => s.id === state.activeScreen);
  if (!screen) return;
  preserveFormValues(state);
  root.innerHTML = `
    <section class="screen">
      <header class="screen-header">
        <div>
          <h2 class="screen-title">${screen.title}</h2>
          <p class="screen-meta">${screen.description}</p>
        </div>
      </header>
      ${screen.render(state)}
    </section>`;
}

function render() {
  const state = getState();
  renderNav(state);
  renderScreen(state);
}

// Delegated click handler for all data-action buttons
root.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const handler = actionHandlers[el.dataset.action];
  if (handler) handler(el, event);
});

// Delegated change handler for select elements with data-action
root.addEventListener("change", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const handler = actionHandlers[el.dataset.action];
  if (handler) handler(el, event);
});

// No input listener needed — form values are read from DOM on submit

// Sidebar navigation
nav.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-screen]");
  if (!btn) return;
  update({ activeScreen: btn.dataset.screen });
});

subscribe(render);
initToasts();
render();
