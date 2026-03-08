import { MENU } from "../data/menu.js";

export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

export function generateOrderId(existingOrders) {
  const num = existingOrders.length + 1;
  return `TF-${String(num).padStart(4, "0")}`;
}

export function computeTotals(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const serviceFee = Math.round(subtotal * 0.039 * 100) / 100;
  const tax = Math.round(subtotal * 0.09 * 100) / 100;
  const total = Math.round((subtotal + serviceFee + tax) * 100) / 100;
  return { subtotal, serviceFee, tax, total };
}

export function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatTimeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff === 1) return "1m ago";
  return `${diff}m ago`;
}

export function formatPriceRange(category) {
  const prices = category.items.map((i) => i.price);
  return `${formatCurrency(Math.min(...prices))}\u2013${formatCurrency(Math.max(...prices))}`;
}

export function findItemById(itemId) {
  for (const cat of MENU) {
    const item = cat.items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return null;
}
