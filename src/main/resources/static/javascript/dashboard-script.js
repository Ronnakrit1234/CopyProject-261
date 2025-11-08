;(() => {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = new Date(ts);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const escapeHTML = (s = '') =>
    s.replace(/[&<>"']/g, (m) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
    );

  const state = {
    q: '',
    stars: new Set(),
    reviews: []
  };

  // ✅ โหลดข้อมูลจาก Database ผ่าน API
  async function fetchReviewsFromDB() {
    try {
      const res = await fetch('/api/reviews/all');
      if (!res.ok) throw new Error('โหลดข้อมูลล้มเหลว');
      const data = await res.json();
      state.reviews = data;
      renderGrid();
    } catch (err) {
      console.error('❌ โหลดข้อมูลจาก DB ไม่สำเร็จ:', err);
      const grid = qs('#reviewGrid');
      grid.innerHTML = `<div class="empty">ไม่สามารถเชื่อมต่อ Database ได้ 😢</div>`;
    }
  }

  // ✅ ฟังก์ชันกรอง
  function matchFilter(r) {
    const q = state.q.trim().toLowerCase();
    const passQ =
      !q ||
      (r.course || '').toLowerCase().includes(q) ||
      (r.professor || '').toLowerCase().includes(q) ||
      (r.comment || '').toLowerCase().includes(q);
    const passStar = state.stars.size === 0 || state.stars.has(+r.rating);
    return passQ && passStar;
  }

  function updateResultBadge(n) {
    const b = qs('#resultMeta');
    if (b) b.textContent = `${n} review${n === 1 ? '' : 's'}`;
  }

  // ✅ ฟังก์ชันสร้างการ์ดรีวิว
  function renderCard(r) {
    const wrap = document.createElement('article');
    wrap.className = 'card';

    const name = escapeHTML(r.course || 'Unknown course');
    const stars = '⭐'.repeat(+r.rating || 0);
    const profText = `อาจารย์: ${escapeHTML(r.professor || '-')}`;
    const body = escapeHTML(r.comment || '— ไม่มีข้อความรีวิว —');
    const metaRight = `${formatDate(r.createdAt)}`;

    // ✅ ตรวจสอบว่า anonymous หรือไม่
    const isAnon = !!r.anonymous;

    // ✅ ใช้ avatar จากฐานข้อมูล ถ้าไม่มีให้ใช้ Anonymous
    const avatarSrc = isAnon
      ? "/Avatar/Anonymous.png"
      : escapeHTML(r.avatar || "/Avatar/Anonymous.png");

    // ✅ การ์ดแสดงผล (ไม่โชว์ชื่อจริง)
    wrap.innerHTML = `
      <header class="card__head">
        <div>
          <div class="card__course">${name}</div>
          <div class="card__meta">${profText}</div>
        </div>
        <div class="card__topRight">
          <div class="stars">${stars}</div>
        </div>
      </header>

      <div class="card__body">${body}</div>

      <footer class="card__footer">
        <div class="footer-left">
          <img src="${avatarSrc}" alt="avatar" class="card__avatar">
          ${isAnon ? `<span class="kbd">Anonymous</span>` : ""}
        </div>
        <span class="kbd">${metaRight}</span>
      </footer>
    `;

    return wrap;
  }

  // ✅ แสดงผลรีวิวทั้งหมด
  function renderGrid() {
    const grid = qs('#reviewGrid');
    grid.innerHTML = '';

    const filtered = state.reviews.filter(matchFilter);
    updateResultBadge(filtered.length);

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'ไม่พบรีวิวที่ตรงกับการค้นหา/ตัวกรอง';
      grid.appendChild(empty);
      return;
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    filtered.forEach((r) => grid.appendChild(renderCard(r)));
  }

  // ✅ จัดการ input / filter ดาว
  function bindHandlers() {
    const s = qs('#searchInput');
    if (s) {
      s.addEventListener('input', (e) => {
        state.q = e.target.value;
        renderGrid();
      });
    }

    const wrap = qs('#starFilters');
    if (wrap) {
      wrap.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        if (btn.id === 'clearFilters') {
          state.stars.clear();
          qsa('.chip[data-star]').forEach((b) => b.classList.remove('is-active'));
          renderGrid();
          return;
        }
        const star = +btn.dataset.star;
        if (state.stars.has(star)) {
          state.stars.delete(star);
          btn.classList.remove('is-active');
        } else {
          state.stars.add(star);
          btn.classList.add('is-active');
        }
        renderGrid();
      });
    }
  }

  // ✅ เริ่มต้นทำงาน
  document.addEventListener('DOMContentLoaded', () => {
    bindHandlers();
    fetchReviewsFromDB();
  });
})();
