import { getState, update } from "../state/store.js";
import { MENU } from "../data/menu.js";
import { formatCurrency, formatPriceRange, findItemById } from "../lib/utils.js";
import { showToast } from "../lib/toast.js";

export const id = "menu";
export const label = "1. Customer Menu";
export const title = "Digital Menu + Quick Add";
export const description = "Customers browse categories, customize items, and place orders from table QR or pickup flow.";

const FEATURED_ID = "cs-01";

export function render(state) {
  const featured = findItemById(FEATURED_ID);
  return `
    <div class="layout-2">
      ${state.openCategory ? renderCategoryItems(state.openCategory) : renderCategoryList()}
      <aside class="card">
        <h3>Featured Item</h3>
        <article class="list-item">
          <div class="row">
            <strong>${featured.name}</strong>
            <span class="tag ok">Popular</span>
          </div>
          <p class="screen-meta">${featured.desc}</p>
          <div class="row">
            <strong>${formatCurrency(featured.price)}</strong>
            <button class="cta" data-action="add-to-cart" data-item-id="${featured.id}">Add</button>
          </div>
        </article>
        <p class="footer-note">MVP component goal: reduce manual back-and-forth and phone order mistakes.</p>
      </aside>
    </div>`;
}

function renderCategoryList() {
  return `
    <section class="card">
      <h3>Menu Categories</h3>
      <div class="stack">
        ${MENU.map(
          (cat) => `
          <article class="list-item row">
            <div>
              <strong>${cat.name}</strong>
              <p class="screen-meta">${cat.items.length} items · ${formatPriceRange(cat)}</p>
            </div>
            <button class="cta soft" data-action="open-category" data-category="${cat.id}">Open</button>
          </article>`
        ).join("")}
      </div>
    </section>`;
}

function renderCategoryItems(categoryId) {
  const cat = MENU.find((c) => c.id === categoryId);
  if (!cat) return renderCategoryList();
  return `
    <section class="card">
      <div class="row" style="margin-bottom:0.5rem">
        <h3>${cat.name}</h3>
        <button class="cta soft" data-action="close-category">All Categories</button>
      </div>
      <div class="stack">
        ${cat.items
          .map(
            (item) => `
          <article class="list-item">
            <div class="row">
              <div>
                <strong>${item.name}</strong>
                <p class="screen-meta">${item.desc}</p>
              </div>
              <div class="row" style="gap:0.5rem;flex-shrink:0">
                <strong>${formatCurrency(item.price)}</strong>
                <button class="cta" data-action="add-to-cart" data-item-id="${item.id}">Add</button>
              </div>
            </div>
          </article>`
          )
          .join("")}
      </div>
    </section>`;
}

export const actions = {
  "open-category": (el) => update({ openCategory: el.dataset.category }),
  "close-category": () => update({ openCategory: null }),
  "add-to-cart": (el) => {
    const item = findItemById(el.dataset.itemId);
    if (!item) return;
    const cart = [...getState().cart];
    const existing = cart.find((c) => c.itemId === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ itemId: item.id, name: item.name, price: item.price, qty: 1 });
    }
    update({ cart });
    showToast(`Added ${item.name} to cart`);
  },
};
