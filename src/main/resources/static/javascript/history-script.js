(() => {
  const LS_KEY = 'courseReviews';
  const historyList = document.getElementById('historyList');
  const usernameEl = document.getElementById('username');

  // ✅ โหลดข้อมูลนักศึกษาที่ login ไว้
  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
  if (!studentData.username) {
    alert('กรุณาเข้าสู่ระบบก่อน');
    window.location.href = '/login';
    return;
  }

  // ✅ ดึงข้อมูลรีวิวทั้งหมดจาก localStorage
  const getReviews = () => {
    try {
      const data = JSON.parse(localStorage.getItem(LS_KEY)) || [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // ✅ แสดงประวัติรีวิว
  const renderHistory = () => {
    const allReviews = getReviews();
    const userReviews = allReviews.filter(
      (r) => r.author?.username === studentData.username
    );

    if (userReviews.length === 0) {
      historyList.innerHTML = `<p style="text-align:center; color:#777;">ยังไม่มีรีวิวที่คุณเขียนไว้</p>`;
      return;
    }

    userReviews.sort((a, b) => b.createdAt - a.createdAt);

    historyList.innerHTML = userReviews
      .map(
        (r) => `
        <div class="history-card" data-id="${r.id}" style="cursor:pointer;">
          <div class="top">
            <div>Date: ${formatDate(r.createdAt)}</div>
            <div>Rating : ⭐${r.rating}/5</div>
          </div>
          <div><strong>Review :</strong>
            <p class="review-text">${r.comment}</p>
          </div>
          <div class="bottom">
            <div>
              Professor: <strong>${r.professor || '-'}</strong>
              &nbsp;&nbsp; Course : <strong>${r.course || '-'}</strong>
              &nbsp;&nbsp; Review ID : <strong>${r.id.slice(-6)}</strong>
            </div>
            <div class="footer-buttons">
              <button>😊 Helpful (${r.helpful || 0})</button>
              <button>🙃 Not Helpful (${r.unhelpful || 0})</button>
            </div>
          </div>
        </div>
      `
      )
      .join('');

    // ✅ เพิ่ม event listener ให้แต่ละการ์ด
    historyList.querySelectorAll('.history-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        // ป้องกันไม่ให้ปุ่ม helpful มีผลกับการเปิดหน้า
        if (e.target.closest('button')) return;

        const reviewId = card.dataset.id;
        if (reviewId) {
          window.location.href = `/dashboard/review-detail?id=${reviewId}`;
        }
      });
    });
  };

  // ✅ แสดงชื่อผู้ใช้
  usernameEl.textContent = studentData.displayname_th || studentData.username || 'Anonymous';

  renderHistory();
})();
