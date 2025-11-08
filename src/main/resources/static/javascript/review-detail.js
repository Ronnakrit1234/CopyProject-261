// review-detail.js (Spring Boot-ready + Feedback toggle + Comment System)
(() => {
  const API_REVIEW = "http://localhost:9090/api/reviews";
  const API_COMMENT = "http://localhost:9090/api/comments";
  const qs = (sel, el = document) => el.querySelector(sel);

  // ✅ อ่านค่า id จาก URL เช่น ?id=3
  const params = new URLSearchParams(window.location.search);
  const reviewId = params.get("id");
  if (!reviewId) {
    document.body.innerHTML = `<p style="padding:40px;text-align:center;">❌ ไม่พบรีวิวที่ต้องการ</p>`;
    return;
  }

  // ======== FEEDBACK TOGGLE SYSTEM ========
  const FEEDBACK_KEY = "reviewFeedbacks"; // เก็บสถานะ feedback ของ user
  const feedbackState = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "{}");
  const getFeedback = () => feedbackState[reviewId] || null;
  const setFeedback = (val) => {
    feedbackState[reviewId] = val;
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackState));
  };

  let currentReview = null;

  // ✅ แสดงข้อมูลรีวิว
  const renderReview = (review) => {
    currentReview = review;
    const container = qs(".frame-box-detail");
    if (!container) return;

    const stars = "⭐".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const userFeedback = getFeedback();

    container.innerHTML = `
      <div class="box-detail">
        <div class="box-content">
          <div class="left-side">
            <h2>${review.course}</h2>
            <p style="color:#777;">Professor: ${review.professor || "-"}</p>
            <div class="stars">${stars}</div>
            <div class="rating-number">${review.rating}/5</div>
            <p class="review-text">${review.comment}</p>

            <div class="footer-buttons">
              <button id="btnHelpful" class="${userFeedback === "helpful" ? "active" : ""}">
                💬 Helpful (${review.helpfulCount || 0})
              </button>
              <button id="btnNotHelpful" class="${userFeedback === "notHelpful" ? "active" : ""}">
                🙃 Not Helpful (${review.notHelpfulCount || 0})
              </button>
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

  // ✅ โหลดคอมเมนต์จาก backend
  const loadComments = async () => {
    const listEl = qs("#commentList");
    if (!listEl) return;
    try {
      const res = await fetch(`${API_COMMENT}/${reviewId}`);
      if (!res.ok) throw new Error("โหลดคอมเมนต์ล้มเหลว");
      const comments = await res.json();
      listEl.innerHTML = comments.length
        ? comments
            .map(
              (c) => `
          <div class="comment-item">
            <img src="/Avatar/Anonymous.png" alt="Anonymous">
            <div class="comment-body">
              <p class="name">${c.author || "Anonymous"}</p>
              <p class="text">${c.text}</p>
              <p class="time">${new Date(c.createdAt).toLocaleString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
              })}</p>
            </div>
          </div>`
            )
            .join("")
        : `<p style="color:#888;">No comments yet.</p>`;
    } catch (err) {
      console.error("❌ โหลดคอมเมนต์ล้มเหลว:", err);
    }
  };

  // ✅ เพิ่มคอมเมนต์
  const addComment = async (text) => {
    if (!text.trim()) return;
    const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");
    const username = studentData.username;
    if (!username) {
      alert("⚠️ กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      return;
    }

    const comment = {
      reviewId: Number(reviewId),
      text,
      author: "Anonymous",
    };

    try {
      const res = await fetch(`${API_COMMENT}?username=${encodeURIComponent(username)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment),
      });
      if (!res.ok) throw new Error("บันทึกคอมเมนต์ไม่สำเร็จ");
      await loadComments();
    } catch (err) {
      alert("❌ Error saving comment: " + err.message);
      console.error(err);
    }
  };

  // ✅ อัปเดต Feedback (มีระบบ toggle)
  const sendFeedback = async (type) => {
    const current = getFeedback();
    let action = "";

    // 🔁 toggle logic
    if (current === type) {
      action = "cancel"; // ยกเลิกการกด
      setFeedback(null);
    } else if (current && current !== type) {
      action = type; // สลับจากอีกฝั่ง
      setFeedback(type);
    } else {
      action = type; // กดครั้งแรก
      setFeedback(type);
    }

    try {
      const res = await fetch(`${API_REVIEW}/${reviewId}/feedback?type=${type}&action=${action}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("อัปเดต feedback ไม่สำเร็จ");

      const updated = await res.json();
      currentReview = updated;
      renderReview(updated);
      await loadComments();
      bindButtons();
    } catch (err) {
      console.error("❌ Feedback update failed:", err);
      alert("เกิดข้อผิดพลาดในการอัปเดต Feedback");
    }
  };

  // ✅ โหลดรีวิว
  const loadReview = async () => {
    try {
      const res = await fetch(`${API_REVIEW}/${reviewId}`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดรีวิวได้");
      const review = await res.json();
      renderReview(review);
      await loadComments();
      bindButtons();
    } catch (err) {
      document.body.innerHTML = `<p style="padding:40px;text-align:center;color:red;">❌ ${err.message}</p>`;
      console.error(err);
    }
  };

  // ✅ bind event ปุ่ม
  const bindButtons = () => {
    const btnHelpful = qs("#btnHelpful");
    const btnNotHelpful = qs("#btnNotHelpful");
    const btnSubmit = qs("#submitComment");

    if (btnHelpful) btnHelpful.addEventListener("click", () => sendFeedback("helpful"));
    if (btnNotHelpful) btnNotHelpful.addEventListener("click", () => sendFeedback("notHelpful"));
    if (btnSubmit)
      btnSubmit.addEventListener("click", async () => {
        const input = qs("#commentInput");
        const text = input?.value.trim();
        if (text) {
          await addComment(text);
          input.value = "";
        }
      });
  };

  document.addEventListener("DOMContentLoaded", loadReview);
})();
