// review-detail.js (เวอร์ชัน Spring Boot-ready)
(() => {
  const LS_REVIEW_KEY = "courseReviews";
  const LS_COMMENT_KEY = "reviewComments";

  const qs = (sel, el = document) => el.querySelector(sel);

  const params = new URLSearchParams(window.location.search);
  const reviewId = params.get("id");

  if (!reviewId) {
    document.body.innerHTML = `<p style="padding:40px;text-align:center;">❌ ไม่พบรีวิวที่ต้องการ</p>`;
    return;
  }

  const safeParse = (raw) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const readReviews = () => safeParse(localStorage.getItem(LS_REVIEW_KEY)) || [];
  const readComments = () => safeParse(localStorage.getItem(LS_COMMENT_KEY)) || {};
  const writeComments = (data) =>
    localStorage.setItem(LS_COMMENT_KEY, JSON.stringify(data));

  const renderReview = (review) => {
    const container = qs(".frame-box-detail");
    if (!container) return;

    const stars = "⭐".repeat(review.rating) + "☆".repeat(5 - review.rating);

    container.innerHTML = `
      <div class="box-detail">
        <div class="box-content">
          <div class="left-side">
            <h2 style="margin-top:0;">${review.course}</h2>
            <p style="color:#777;">Professor: ${review.professor || "-"}</p>
            <div class="stars">${stars}</div>
            <div class="rating-number">${review.rating}/5</div>
            <p class="review-text">${review.comment}</p>
            <div class="footer-buttons">
              <button>💬 Helpful (7)</button>
              <button>🙃 Not Helpful (2)</button>
            </div>
          </div>

          <div class="divider"></div>

          <div class="right-side">
            <div class="comment-input">
              <input type="text" id="commentInput" placeholder="Add a comment..." />
              <button id="submitComment">submit</button>
            </div>
            <div id="commentList"></div>
          </div>
        </div>
      </div>
    `;
  };

  const renderComments = () => {
    const allComments = readComments();
    const list = allComments[reviewId] || [];
    const listEl = qs("#commentList");

    if (!listEl) return;
    listEl.innerHTML = "";

    if (list.length === 0) {
      listEl.innerHTML = `<p style="color:#888;">No comments yet.</p>`;
      return;
    }

    list.forEach((c) => {
      const el = document.createElement("div");
      el.className = "comment-item";
      el.innerHTML = `
        <img src="/avatar/anonymous.png" alt="Anonymous">
        <div class="comment-body">
          <p class="name">Anonymous</p>
          <p class="text">${c.text}</p>
          <p class="time">${c.time}</p>
        </div>
      `;
      listEl.appendChild(el);
    });
  };

  const addComment = (text) => {
    if (!text.trim()) return;

    const all = readComments();
    const list = all[reviewId] || [];

    const now = new Date();
    const time = now.toLocaleString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });

    list.unshift({ text, time });
    all[reviewId] = list;
    writeComments(all);
    renderComments();
  };

  const init = () => {
    const reviews = readReviews();
    const review = reviews.find((r) => r.id === reviewId);

    if (!review) {
      document.body.innerHTML = `<p style="padding:40px;text-align:center;">❌ ไม่พบข้อมูลรีวิว</p>`;
      return;
    }

    renderReview(review);
    renderComments();

    document.addEventListener("click", (e) => {
      if (e.target.id === "submitComment") {
        const input = qs("#commentInput");
        if (!input) return;
        const text = input.value.trim();
        if (text) {
          addComment(text);
          input.value = "";
        }
      }
    });
  };

  document.addEventListener("DOMContentLoaded", init);
})();
