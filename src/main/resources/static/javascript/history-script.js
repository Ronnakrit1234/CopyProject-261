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

  // ✅ ฟังก์ชันอัปเดต Feedback (กด Helpful / Not Helpful)
  async function sendFeedback(reviewId, type, buttonEl) {
    try {
      const res = await fetch(`${API_BASE}/${reviewId}/feedback?type=${type}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("อัปเดต feedback ไม่สำเร็จ");

      const updated = await res.json();

      // ✅ อัปเดตตัวเลขในปุ่มแบบสด
      if (type === "helpful") {
        buttonEl.textContent = `😊 Helpful (${updated.helpfulCount || 0})`;
        const notBtn = buttonEl
          .closest(".footer-buttons")
          .querySelector(".btn-unhelpful");
        if (notBtn)
          notBtn.textContent = `🙃 Not Helpful (${
            updated.notHelpfulCount || 0
          })`;
      } else {
        buttonEl.textContent = `🙃 Not Helpful (${updated.notHelpfulCount || 0})`;
        const helpBtn = buttonEl
          .closest(".footer-buttons")
          .querySelector(".btn-helpful");
        if (helpBtn)
          helpBtn.textContent = `😊 Helpful (${updated.helpfulCount || 0})`;
      }
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

      // ✅ เรียงจากใหม่ → เก่า
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // ✅ แสดงการ์ดแต่ละรีวิว
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
              <button class="btn-helpful">😊 Helpful (${
                r.helpfulCount || 0
              })</button>
              <button class="btn-unhelpful">🙃 Not Helpful (${
                r.notHelpfulCount || 0
              })</button>
            </div>
          </div>
        </div>
      `
        )
        .join("");

      // ✅ เพิ่ม event listener ให้แต่ละการ์ด
      historyList.querySelectorAll(".history-card").forEach((card) => {
        const reviewId = card.dataset.id;

        // 🎯 คลิกเพื่อเปิดหน้า review-detail
        card.addEventListener("click", (e) => {
          if (e.target.closest("button")) return; // กันคลิกปุ่มช่วยเหลือ
          if (reviewId) {
            window.location.href = `/dashboard/review-detail?id=${reviewId}`;
          }
        });

        // 🎯 ปุ่ม feedback
        const btnHelpful = card.querySelector(".btn-helpful");
        const btnUnhelpful = card.querySelector(".btn-unhelpful");

        if (btnHelpful)
          btnHelpful.addEventListener("click", (e) => {
            e.stopPropagation();
            sendFeedback(reviewId, "helpful", btnHelpful);
          });

        if (btnUnhelpful)
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

  // ✅ เริ่มทำงาน
  document.addEventListener("DOMContentLoaded", loadHistory);
})();
