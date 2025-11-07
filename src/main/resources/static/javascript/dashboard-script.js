/* CSTU Pantip — Dashboard logic (Spring Boot Ready)
   Handles admin / guest review listing
*/
;(() => {
  const LS_KEY = 'courseReviews';

  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  const formatDate = (ts) => {
    const d = new Date(ts || Date.now());
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const safeParse = (raw) => { try { return JSON.parse(raw); } catch (e) { return null; } };

  const readLS = () => {
    const raw = localStorage.getItem(LS_KEY);
    const arr = safeParse(raw);
    if (!Array.isArray(arr)) return [];
    const { rows, changed } = normalizeRows(arr);
    if (changed) writeLS(rows);
    return rows;
  };

  const writeLS = (rows) => {
    localStorage.setItem(LS_KEY, JSON.stringify(rows || []));
  };

  function normalizeRows(arr) {
    let changed = false;
    const rows = arr.map((r) => {
      const n = { ...r };

      if (n.subject && !n.course) { n.course = String(n.subject).trim(); changed = true; }
      if (n.title && !n.course) { n.course = String(n.title).trim(); changed = true; }

      if (n.teacher && !n.professor) { n.professor = String(n.teacher).trim(); changed = true; }
      if (n.lecturer && !n.professor) { n.professor = String(n.lecturer).trim(); changed = true; }

      if (n.review && !n.comment) { n.comment = String(n.review).trim(); changed = true; }
      if (n.text && !n.comment) { n.comment = String(n.text).trim(); changed = true; }

      const rate = Number(n.rating);
      if (!Number.isFinite(rate) || rate < 1 || rate > 5) {
        n.rating = Math.max(1, Math.min(5, rate || 3)); changed = true;
      }

      if (!n.id) { n.id = cryptoRandom(); changed = true; }
      if (!n.createdAt) { n.createdAt = Date.now(); changed = true; }

      if (!n.author) { n.author = { name: n.name || 'anonymous', avatar: n.avatar || '' }; changed = true; }
      if (!n.author.name) { n.author.name = 'anonymous'; changed = true; }

      if (typeof n.course === 'string') n.course = n.course.trim();
      if (typeof n.professor === 'string') n.professor = n.professor.trim();
      if (typeof n.comment === 'string') n.comment = n.comment.trim();

      return n;
    });
    return { rows, changed };
  }

  const debounce = (fn, wait = 180) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  const showToast = (msg = 'Saved') => {
    const el = qs('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-show');
    setTimeout(() => el.classList.remove('is-show'), 1600);
  };

  const escapeHTML = (s = '') =>
    s.replace(/[&<>"']/g, (m) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
    );

  const state = {
    isAdmin: false,
    q: '',
    stars: new Set(),
    rows: []
  };

  const matchFilter = (r) => {
    const q = state.q.trim().toLowerCase();
    const passQ =
      !q ||
      (r.course || '').toLowerCase().includes(q) ||
      (r.professor || '').toLowerCase().includes(q) ||
      (r.comment || '').toLowerCase().includes(q);
    const passStar = state.stars.size === 0 || state.stars.has(+r.rating);
    return passQ && passStar;
  };

  const updateResultBadge = (n) => {
    const b = qs('#resultMeta');
    if (!b) return;
    b.textContent = `${n} review${n === 1 ? '' : 's'}`;
  };

  const renderCard = (r) => {
    const wrap = document.createElement('article');
    wrap.className = 'card';

    const name = escapeHTML(r.course || 'Unknown course');
    const stars = '⭐'.repeat(+r.rating || 0);
    const metaRight = `${formatDate(r.createdAt)}`;
    const profText = `Professor: ${escapeHTML(r.professor || '-')}`;

    // ✅ ใช้ path static ของ Spring Boot
    const defaultAvatar = '/Avatar/Anonymous.png';
    const avatarSrc = (r?.author?.avatar || '').trim() || defaultAvatar;
    const avatarHTML = `<img class="card__avatar" src="${escapeHTML(avatarSrc)}" alt="reviewer avatar">`;

    const body = r.comment
      ? escapeHTML(r.comment)
      : '<span style="color:#9c8b70">— no review text —</span>';

    wrap.innerHTML = `
      <header class="card__head">
        <div>
          <div class="card__course">${name}</div>
          <div class="card__meta">${profText}</div>
        </div>
        <div class="card__topRight">
          <div class="stars" aria-label="${r.rating} stars">${stars}</div>
          ${avatarHTML}
        </div>
      </header>

      <div class="card__body">${body}</div>

      <footer class="card__footer">
        <span class="kbd">${metaRight}</span>
        <div class="act">
          ${
            state.isAdmin
              ? `<button class="btn btn--danger btn--sm" data-act="delete" data-id="${r.id}">Delete</button>`
              : ``
          }
        </div>
      </footer>
    `;

    // ✅ ใช้ path สมบูรณ์ (Spring Boot)
    wrap.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="delete"]')) return;
      window.location.href = `/dashboard/review-detail?id=${encodeURIComponent(r.id)}`;
    });

    return wrap;
  };

  const renderGrid = () => {
    const grid = qs('#reviewGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const rows = readLS();
    state.rows = rows;

    const filtered = rows.filter(matchFilter).sort((a, b) => b.createdAt - a.createdAt);
    updateResultBadge(filtered.length);

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = `ไม่มีรีวิวที่ตรงกับการค้นหา/ตัวกรองในตอนนี้`;
      grid.appendChild(empty);
      return;
    }

    filtered.forEach((r) => grid.appendChild(renderCard(r)));
  };

  const bindHandlers = () => {
    const s = qs('#searchInput');
    if (s) {
      s.addEventListener('input', debounce((e) => {
        state.q = e.target.value || '';
        renderGrid();
      }, 120));
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
        if (!star) return;
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

    const grid = qs('#reviewGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const bt = e.target.closest('[data-act="delete"]');
        if (!bt) return;
        const id = bt.dataset.id;
        if (!id) return;
        const next = readLS().filter((r) => String(r.id) !== String(id));
        writeLS(next);
        showToast('Deleted review');
        renderGrid();
      });
    }

    // ✅ ปุ่มเขียนรีวิว
    const w1 = qs('#linkWrite'), w2 = qs('#writeCTA2');
    [w1, w2].forEach((x) => {
      if (!x) return;
      x.addEventListener('click', (ev) => {
        ev.preventDefault();
        window.location.href = '/dashboard/review';
      });
    });

    // ✅ ปุ่ม logout/back
    const back = qs('#btnBack');
    if (back) {
      back.addEventListener('click', () => {
        history.length > 1 ? history.back() : (window.location.href = '/login');
      });
    }

    const lo = qs('#btnLogout');
    if (lo) {
      lo.addEventListener('click', (e) => {
        e.preventDefault();
        try { sessionStorage.removeItem('isAdmin'); } catch (e) {}
        showToast('Logged out');
        setTimeout(() => (window.location.href = '/login'), 400);
      });
    }
  };

  function seedIfEmpty() {
    if (readLS().length) return;
    const now = Date.now();
    const demo = [];
    writeLS(demo);
  }

  function cryptoRandom() {
    if (window.crypto?.getRandomValues) {
      const b = new Uint32Array(2);
      crypto.getRandomValues(b);
      return `r-${b[0].toString(16)}${b[1].toString(16)}`;
    }
    return `r-${Math.random().toString(16).slice(2)}`;
  }

  window.CSTU = window.CSTU || {};
  window.CSTU.initDashboard = function initDashboard() {
    try {
      state.isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    } catch (e) { state.isAdmin = false; }
    seedIfEmpty();
    bindHandlers();
    renderGrid();
  };

  // ✅ ให้เรียก initDashboard() อัตโนมัติเมื่อหน้าโหลดเสร็จ
  document.addEventListener('DOMContentLoaded', () => {
    if (window.CSTU?.initDashboard) window.CSTU.initDashboard();
  });

})();
