(() => {
  const API_BASE = "http://localhost:9090/api/reviews";
  const historyList = document.getElementById("historyList");
  const usernameEl = document.getElementById("username");

  // ✅ โหลดข้อมูลนักศึกษาที่ login ไว้จาก localStorage
  const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");
  if (!studentData.username) {
    alert("กรุณาเข้าสู่ระบบก่อน");
    window.location.href = "/login";
    return;
  }

  // ✅ แสดงชื่อผู้ใช้ด้านบน
  usernameEl.textContent =
    studentData.displayname_th || studentData.username || "Anonymous";

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ จัดการสถานะ feedback ที่เคยกดไว้ (เก็บใน localStorage)
  const FEEDBACK_KEY = "reviewFeedback";
  const loadFeedbackState = () =>
    JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "{}");
  const saveFeedbackState = (state) =>
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(state));

  // ✅ ส่ง Feedback ไป backend + อัปเดตสถานะใน localStorage
  async function sendFeedback(reviewId, type, buttonEl) {
    const feedbackState = loadFeedbackState();
    const current = feedbackState[reviewId]; // helpful / notHelpful / undefined
    let action = "none";

    // ✅ Logic toggle:
    if (current === type) {
      delete feedbackState[reviewId];
      action = "cancel"; // ยกเลิก
    } else {
      feedbackState[reviewId] = type;
      action = type; // เพิ่มฝั่งนี้
    }
    saveFeedbackState(feedbackState);

    try {
      const res = await fetch(
        `${API_BASE}/${reviewId}/feedback?type=${type}&action=${action}`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("อัปเดต feedback ไม่สำเร็จ");

      const updated = await res.json();

      const buttons = buttonEl.closest(".footer-buttons");
      const helpBtn = buttons.querySelector(".btn-helpful");
      const unhelpBtn = buttons.querySelector(".btn-unhelpful");

      helpBtn.textContent = `😊 Helpful (${updated.helpfulCount || 0})`;
      unhelpBtn.textContent = `🙃 Not Helpful (${updated.notHelpfulCount || 0})`;

      // ✅ ปรับ highlight
      helpBtn.classList.toggle(
        "active",
        feedbackState[reviewId] === "helpful"
      );
      unhelpBtn.classList.toggle(
        "active",
        feedbackState[reviewId] === "notHelpful"
      );
    } catch (err) {
      console.error("❌ Feedback update failed:", err);
      alert("เกิดข้อผิดพลาดในการอัปเดต Feedback");
    }
  }

  // ✅ โหลดประวัติรีวิวของผู้ใช้จาก Backend
  async function loadHistory() {
    try {
      const res = await fetch(
        `${API_BASE}/user?username=${studentData.username}`
      );
      if (!res.ok) throw new Error("โหลดรีวิวไม่สำเร็จ");
      const reviews = await res.json();

      if (!Array.isArray(reviews) || reviews.length === 0) {
        historyList.innerHTML = `<p style="text-align:center; color:#777;">ยังไม่มีรีวิวที่คุณเขียนไว้</p>`;
        return;
      }

      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const feedbackState = loadFeedbackState();

      historyList.innerHTML = reviews
        .map(
          (r) => `
        <div class="history-card" data-id="${r.id}" style="cursor:pointer;">
          <div class="top">
            <div>Date: ${formatDate(r.createdAt)}</div>
            <div>Rating : ⭐${r.rating}/5</div>
          </div>

          <div><strong>Review :</strong>
            <p class="review-text">${r.comment || "(ไม่มีข้อความ)"}</p>
          </div>

          <div class="bottom">
            <div>
              Professor: <strong>${r.professor || "-"}</strong>
              &nbsp;&nbsp; Course : <strong>${r.course || "-"}</strong>
              &nbsp;&nbsp; Review ID : <strong>${r.id}</strong>
            </div>
            <div class="footer-buttons">
              <button class="btn-helpful ${
                feedbackState[r.id] === "helpful" ? "active" : ""
              }">😊 Helpful (${r.helpfulCount || 0})</button>
              <button class="btn-unhelpful ${
                feedbackState[r.id] === "notHelpful" ? "active" : ""
              }">🙃 Not Helpful (${r.notHelpfulCount || 0})</button>
            </div>
          </div>
        </div>
      `
        )
        .join("");

      // ✅ Event
      historyList.querySelectorAll(".history-card").forEach((card) => {
        const reviewId = card.dataset.id;
        const btnHelpful = card.querySelector(".btn-helpful");
        const btnUnhelpful = card.querySelector(".btn-unhelpful");

        card.addEventListener("click", (e) => {
          if (e.target.closest("button")) return;
          window.location.href = `/dashboard/review-detail?id=${reviewId}`;
        });

        btnHelpful.addEventListener("click", (e) => {
          e.stopPropagation();
          sendFeedback(reviewId, "helpful", btnHelpful);
        });

        btnUnhelpful.addEventListener("click", (e) => {
          e.stopPropagation();
          sendFeedback(reviewId, "notHelpful", btnUnhelpful);
        });
      });
    } catch (err) {
      console.error("❌ โหลดประวัติรีวิวล้มเหลว:", err);
      historyList.innerHTML = `<p style="color:red; text-align:center;">โหลดข้อมูลไม่สำเร็จ (${err.message})</p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", loadHistory);
})();
