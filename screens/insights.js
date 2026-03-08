export const id = "insights";
export const label = "7. Service Insights";
export const title = "MVP Reporting Dashboard";
export const description = "Daily pulse metrics show where operations and customer service need attention.";

export function render(state) {
  if (state.orders.length === 0 && state.feedback.length === 0) {
    return `
      <div class="card">
        <div class="empty-state">
          <strong>No data yet</strong>
          <p>Place orders and collect feedback to see insights here.</p>
        </div>
      </div>`;
  }

  const totalOrders = state.orders.length;
  const ratings = state.feedback.filter((f) => f.rating).map((f) => f.rating);
  const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "--";
  const lowRatings = ratings.filter((r) => r <= 2).length;

  const complaints = state.feedback.filter((f) => f.sentiment === "needs-work" && f.comment);
  const compliments = state.feedback.filter((f) => f.sentiment === "great" && f.comment);
  const topComplaint = complaints.length > 0 ? complaints[complaints.length - 1].comment : null;
  const topCompliment = compliments.length > 0 ? compliments[compliments.length - 1].comment : null;

  return `
    <section class="card">
      <div class="metric-grid">
        <article class="metric"><p>Orders Today</p><strong>${totalOrders}</strong></article>
        <article class="metric"><p>Digital Share</p><strong>100%</strong></article>
        <article class="metric"><p>Avg Rating</p><strong>${avgRating}</strong></article>
        <article class="metric"><p>Low Ratings</p><strong>${lowRatings}</strong></article>
      </div>

      <div class="stack" style="margin-top:1rem">
        <article class="list-item row">
          <div>
            <strong>Top complaint</strong>
            <p class="screen-meta">${topComplaint || "No complaints yet"}</p>
          </div>
          <span class="tag ${topComplaint ? "warn" : "ok"}">${topComplaint ? "Action Needed" : "All Clear"}</span>
        </article>
        <article class="list-item row">
          <div>
            <strong>Top compliment</strong>
            <p class="screen-meta">${topCompliment || "No compliments yet"}</p>
          </div>
          <span class="tag ok">${topCompliment ? "Maintain" : "Awaiting"}</span>
        </article>
      </div>
    </section>`;
}

export const actions = {};
