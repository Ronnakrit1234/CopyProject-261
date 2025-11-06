(() => {
  const LS_KEY = 'courseReviews';

  const historyList = document.getElementById('historyList');
  const usernameEl = document.getElementById('username');

  // ดึงข้อมูลจาก localStorage
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

  const renderHistory = () => {
    const reviews = getReviews().sort((a, b) => b.createdAt - a.createdAt);

    if (reviews.length === 0) {
      historyList.innerHTML = `<p style="text-align:center; color:#777;">ยังไม่มีรีวิวที่คุณเขียนไว้</p>`;
      return;
    }

    historyList.innerHTML = reviews
      .map(
        (r) => `
        <div class="history-card">
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
              &nbsp;&nbsp; Object : <strong>${r.course || '-'}</strong>
              &nbsp;&nbsp; Section : <strong>${r.id.slice(-6)}</strong>
            </div>
            <div class="footer-buttons">
              <button>😊 Helpful (7)</button>
              <button>🙃 Not Helpful (2)</button>
            </div>
          </div>
        </div>
      `
      )
      .join('');
  };

  // โหลดชื่อผู้ใช้ (mock)
  const username = sessionStorage.getItem('username') || 'John Smith';
  usernameEl.textContent = username;

  renderHistory();
})();
