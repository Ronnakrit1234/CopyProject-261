// review-detail.js (Spring Boot-ready + บันทึก comment ลง DB พร้อม username ที่ซ่อนใน frontend)
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

  // ✅ ฟังก์ชันแสดงข้อมูลรีวิว
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
              <button>💬 Helpful (${review.helpfulCount || 0})</button>
              <button>🙃 Not Helpful (${review.notHelpfulCount || 0})</button>
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

  // ✅ เพิ่มคอมเมนต์ใหม่ (บันทึกลง DB)
  const addComment = async (text) => {
    if (!text.trim()) return;

    // ดึง username จาก localStorage (หลัง login)
    const username = localStorage.getItem("username");
    if (!username) {
      alert("⚠️ กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      return;
    }

    const comment = {
      reviewId: Number(reviewId),
      text,
      author: "Anonymous" // ✅ หน้าเว็บเห็นเป็น Anonymous เสมอ
    };

    try {
      const res = await fetch(
        `${API_COMMENT}?username=${encodeURIComponent(username)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(comment)
        }
      );

      if (!res.ok) throw new Error("บันทึกคอมเมนต์ไม่สำเร็จ");
      await loadComments();
    } catch (err) {
      alert("❌ Error saving comment: " + err.message);
      console.error(err);
    }
  };

  // ✅ โหลดรีวิวจาก Backend
  const loadReview = async () => {
    try {
      const res = await fetch(`${API_REVIEW}/${reviewId}`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดรีวิวได้");
      const review = await res.json();
      renderReview(review);
      await loadComments();
    } catch (err) {
      document.body.innerHTML = `<p style="padding:40px;text-align:center;color:red;">❌ ${err.message}</p>`;
      console.error(err);
    }
  };

  // ✅ เริ่มต้นเมื่อหน้าโหลดเสร็จ
  document.addEventListener("DOMContentLoaded", async () => {
    await loadReview();

    // เมื่อกด submit comment
    document.addEventListener("click", async (e) => {
      if (e.target.id === "submitComment") {
        const input = qs("#commentInput");
        const text = input?.value.trim();
        if (text) {
          await addComment(text);
          input.value = "";
        }
      }
    });
  });
})();
