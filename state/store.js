const state = {
  activeScreen: "menu",
  openCategory: null,
  cart: [],
  orders: [],
  feedback: [],
  pendingFeedback: { orderId: null, sentiment: null, rating: null, comment: "" },
};

let listeners = [];
let renderScheduled = false;

export function getState() {
  return state;
}

export function update(partial) {
  Object.assign(state, partial);
  if (!renderScheduled) {
    renderScheduled = true;
    queueMicrotask(() => {
      renderScheduled = false;
      listeners.forEach((fn) => fn(state));
    });
  }
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
