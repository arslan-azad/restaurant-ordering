import { getState, update } from "../state/store.js";
import { showToast } from "../lib/toast.js";

export const id = "feedback-inbox";
export const label = "6. Feedback Inbox";
export const title = "Issue Triage Board";
export const description = "Managers review feedback by urgency and close the loop with customers fast.";

function ratingTone(rating) {
  if (!rating) return "warn";
  if (rating <= 2) return "danger";
  if (rating === 3) return "warn";
  return "ok";
}

function ratingLabel(entry) {
  if (entry.rating) return `${entry.rating}-star`;
  if (entry.sentiment) {
    const labels = { great: "Positive", okay: "Neutral", "needs-work": "Negative" };
    return labels[entry.sentiment] || entry.sentiment;
  }
  return "No rating";
}

export function render(state) {
  if (state.feedback.length === 0) {
    return `
      <div class="card">
        <div class="empty-state">
          <strong>No feedback yet</strong>
          <p>Customer feedback will appear here after submission.</p>
        </div>
      </div>`;
  }

  const sorted = [...state.feedback].reverse();

  return `
    <section class="card">
      <h3>Open Customer Issues</h3>
      <div class="stack">
        ${sorted
          .map(
            (entry) => `
          <article class="list-item">
            <div class="row">
              <strong>${entry.orderId}</strong>
              <span class="tag ${ratingTone(entry.rating)}">${ratingLabel(entry)}</span>
            </div>
            ${entry.comment ? `<p>${entry.comment}</p>` : `<p class="screen-meta">No comment</p>`}
            <div class="row" style="margin-top:0.4rem">
              ${
                entry.resolved
                  ? `<span class="tag ok">Resolved</span>`
                  : `
                    ${
                      entry.assignedTo
                        ? `<span class="screen-meta">Assigned to ${entry.assignedTo}</span>`
                        : `<button class="cta soft" data-action="assign-feedback" data-feedback-id="${entry.id}">Assign</button>`
                    }
                    <button class="cta" data-action="resolve-feedback" data-feedback-id="${entry.id}">Resolve</button>
                  `
              }
            </div>
          </article>`
          )
          .join("")}
      </div>
    </section>`;
}

export const actions = {
  "assign-feedback": (el) => {
    const feedback = getState().feedback.map((f) =>
      f.id === el.dataset.feedbackId ? { ...f, assignedTo: "Shift Lead" } : f
    );
    update({ feedback });
    showToast("Assigned to Shift Lead");
  },
  "resolve-feedback": (el) => {
    const feedback = getState().feedback.map((f) =>
      f.id === el.dataset.feedbackId ? { ...f, resolved: true } : f
    );
    update({ feedback });
    showToast("Issue resolved");
  },
};
