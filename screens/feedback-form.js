import { getState, update } from "../state/store.js";
import { showToast } from "../lib/toast.js";

export const id = "feedback-form";
export const label = "5. Feedback Capture";
export const title = "Post-Meal Feedback Form";
export const description = "Right after completion, customers rate experience and flag service issues while context is fresh.";

export function render(state) {
  const deliveredOrders = state.orders.filter((o) => o.status === "DELIVERED");
  const feedbackOrderIds = new Set(state.feedback.map((f) => f.orderId));
  const eligibleOrders = deliveredOrders.filter((o) => !feedbackOrderIds.has(o.id));
  const pf = state.pendingFeedback;

  const isLowRating = pf.rating && pf.rating <= 2;

  return `
    <div class="layout-2">
      <section class="card">
        <h3>Quick Feedback</h3>
        ${
          eligibleOrders.length === 0 && !pf.orderId
            ? `<div class="empty-state">
                <strong>No orders to review</strong>
                <p>Complete an order and have it delivered to leave feedback.</p>
              </div>`
            : `
              <article class="list-item" style="margin-bottom:0.8rem">
                <p><strong>Select order</strong></p>
                <div class="row" style="flex-wrap:wrap;gap:0.4rem">
                  ${eligibleOrders
                    .map(
                      (o) =>
                        `<button class="cta ${pf.orderId === o.id ? "active" : "soft"}" data-action="select-feedback-order" data-order-id="${o.id}">${o.id}</button>`
                    )
                    .join("")}
                  ${eligibleOrders.length === 0 ? `<span class="screen-meta">No more orders to review</span>` : ""}
                </div>
              </article>
              <article class="list-item" style="margin-bottom:0.8rem">
                <p><strong>How was your order today?</strong></p>
                <div class="row" style="gap:0.4rem">
                  ${["great", "okay", "needs-work"]
                    .map(
                      (val) =>
                        `<button class="cta ${pf.sentiment === val ? "active" : "soft"}" data-action="select-sentiment" data-value="${val}">${val === "needs-work" ? "Needs work" : val.charAt(0).toUpperCase() + val.slice(1)}</button>`
                    )
                    .join("")}
                </div>
              </article>
              <article class="list-item" style="margin-bottom:0.8rem">
                <p><strong>Rate service speed</strong></p>
                <div class="rating-row">
                  ${[1, 2, 3, 4, 5]
                    .map(
                      (n) =>
                        `<button class="rating-btn ${pf.rating && n <= pf.rating ? "selected" : ""}" data-action="select-rating" data-value="${n}">${n}</button>`
                    )
                    .join("")}
                </div>
              </article>
              <article class="list-item" style="margin-bottom:0.8rem">
                <p><strong>Any notes for our team?</strong></p>
                <textarea class="textarea-field" data-field="feedback-comment" placeholder="Optional: tell us more...">${pf.comment || ""}</textarea>
              </article>
              <button class="cta" data-action="submit-feedback">Submit Feedback</button>
            `
        }
      </section>
      <aside class="card">
        <h3>Recovery Trigger</h3>
        <article class="list-item">
          <p>Rule: if rating is 1\u20132 stars, notify shift lead immediately.</p>
          <span class="tag ${isLowRating ? "danger" : "ok"}">${isLowRating ? "Will Alert" : "No Alert"}</span>
        </article>
      </aside>
    </div>`;
}

export const actions = {
  "select-feedback-order": (el) => {
    update({ pendingFeedback: { ...getState().pendingFeedback, orderId: el.dataset.orderId } });
  },
  "select-sentiment": (el) => {
    update({ pendingFeedback: { ...getState().pendingFeedback, sentiment: el.dataset.value } });
  },
  "select-rating": (el) => {
    update({ pendingFeedback: { ...getState().pendingFeedback, rating: parseInt(el.dataset.value) } });
  },
  "submit-feedback": () => {
    const s = getState();
    const pf = s.pendingFeedback;
    if (!pf.orderId) return showToast("Please select an order", "warn");
    if (!pf.sentiment && !pf.rating) return showToast("Please rate your experience", "warn");
    const commentEl = document.querySelector("[data-field='feedback-comment']");
    const comment = commentEl ? commentEl.value : "";
    const feedbackId = `FB-${String(s.feedback.length + 1).padStart(4, "0")}`;
    const isLowRating = pf.rating && pf.rating <= 2;
    const entry = {
      id: feedbackId,
      orderId: pf.orderId,
      sentiment: pf.sentiment,
      rating: pf.rating,
      comment,
      assignedTo: null,
      resolved: false,
      createdAt: new Date().toISOString(),
    };
    update({
      feedback: [...s.feedback, entry],
      pendingFeedback: { orderId: null, sentiment: null, rating: null, comment: "" },
    });
    showToast("Feedback submitted. Thank you!");
    if (isLowRating) {
      setTimeout(() => showToast("Low rating alert sent to shift lead", "danger"), 400);
    }
  },
};
