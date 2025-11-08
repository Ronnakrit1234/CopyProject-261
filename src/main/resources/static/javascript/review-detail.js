// review-detail.js (ปุ่มค้างสีส้มถาวร)
(() => {
  const API_REVIEW = "http://localhost:9090/api/reviews";
  const API_COMMENT = "http://localhost:9090/api/comments";
  const qs = (sel, el = document) => el.querySelector(sel);

  const params = new URLSearchParams(window.location.search);
  const reviewId = params.get("id");

  if (!reviewId) {
    document.body.innerHTML = `<p style="padding:40px;text-align:center;">❌ ไม่พบรีวิวที่ต้องการ</p>`;
    return;
  }

  // ✅ ดึงข้อมูลผู้ใช้จาก localStorage
  const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");
  const username = studentData.username || "guest";

  // ✅ key สำหรับจำ feedback ของ user คนนี้
  const FEEDBACK_KEY = "userFeedbackRecords";
  const allFeedback = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "{}");
  const userFeedbackKey = `${username}_${reviewId}`;

  const getFeedback = () => allFeedback[userFeedbackKey] || null;
  const setFeedback = (val) => {
    allFeedback[userFeedbackKey] = val;
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
  };

  // ✅ แสดงข้อมูลรีวิว
  const renderReview = (review) => {
    const container = qs(".frame-box-detail");
    if (!container) return;

    const stars = "⭐".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const userFeedback = getFeedback(); // <<-- อ่าน feedback เดิม

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
              <button id="btnHelpful"
                class="${userFeedback === "helpful" ? "myvote" : ""}">
                💬 Helpful (${review.helpfulCount || 0})
              </button>
              <button id="btnNotHelpful"
                class="${userFeedback === "notHelpful" ? "myvote" : ""}">
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

  // ✅ โหลดคอมเมนต์
  const loadComments = async () => {
    const listEl = qs("#commentList");
    if (!listEl) return;

    try {
      const res = await fetch(`${API_COMMENT}/${reviewId}`);
      if (!res.ok) throw new Error("โหลดคอมเมนต์ล้มเหลว");
      const comments = await res.json();

      listEl.innerHTML = "";
      if (comments.length === 0) {
        listEl.innerHTML = `<p style="color:#888;">No comments yet.</p>`;
        return;
      }

      comments.forEach((c) => {
        const time = new Date(c.createdAt).toLocaleString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "short",
        });

        const el = document.createElement("div");
        el.className = "comment-item";
        el.innerHTML = `
          <img src="/Avatar/Anonymous.png" alt="Anonymous">
          <div class="comment-body">
            <p class="name">${c.author || "Anonymous"}</p>
            <p class="text">${c.text}</p>
            <p class="time">${time}</p>
          </div>
        `;
        listEl.appendChild(el);
      });
    } catch (err) {
      console.error("❌ โหลดคอมเมนต์ล้มเหลว:", err);
    }
  };

  // ✅ เพิ่มคอมเมนต์ใหม่
  const addComment = async (text) => {
    if (!text.trim()) return;
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

  // ✅ ส่ง feedback (ให้สีค้างถาวร)
  const sendFeedback = async (type) => {
    if (getFeedback()) {
      alert("⚠️ คุณได้ให้ Feedback แล้ว");
      return;
    }

    setFeedback(type); // บันทึกว่า user เคยกดแล้ว

    const btnHelpful = qs("#btnHelpful");
    const btnNotHelpful = qs("#btnNotHelpful");

    // อัปเดตสีในทันที
    if (type === "helpful") {
      btnHelpful.classList.add("myvote");
      btnNotHelpful.classList.remove("myvote");
    } else {
      btnNotHelpful.classList.add("myvote");
      btnHelpful.classList.remove("myvote");
    }

    try {
      const res = await fetch(
        `${API_REVIEW}/${reviewId}/feedback?type=${type}&action=${type}`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("อัปเดต feedback ไม่สำเร็จ");

      const updated = await res.json();
      btnHelpful.innerHTML = `💬 Helpful (${updated.helpfulCount || 0})`;
      btnNotHelpful.innerHTML = `🙃 Not Helpful (${updated.notHelpfulCount || 0})`;
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

  // ✅ bind ปุ่ม
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
