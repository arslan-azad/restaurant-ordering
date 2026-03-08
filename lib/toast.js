let container = null;

export function initToasts() {
  container = document.createElement("div");
  container.className = "toast-container";
  document.body.appendChild(container);
}

export function showToast(message, type = "ok") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("toast-visible"));
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 3000);
}
