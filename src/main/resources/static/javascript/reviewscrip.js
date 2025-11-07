/* CSTU Pantip — Review form saver (writes to localStorage "courseReviews")
   Schema ที่ Dashboard อ่าน:
   {
     id, course, professor, rating(1..5), comment, createdAt,
     author:{ username, name, avatar }
   }
*/
;(() => {
  const LS_KEY = 'courseReviews'
  const LIMIT = 220 // ✅ จำกัดความยาวรีวิว

  // ---------- helpers ----------
  const qs  = (sel, el=document) => el.querySelector(sel)
  const qsa = (sel, el=document) => Array.from(el.querySelectorAll(sel))
  const getVal = (selectors) => {
    for (const s of selectors) {
      const el = qs(s)
      if (el && 'value' in el) return String(el.value).trim()
    }
    return ''
  }
  const readLS = () => {
    try {
      const j = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
      return Array.isArray(j) ? j : []
    } catch {
      return []
    }
  }
  const writeLS = (rows) => localStorage.setItem(LS_KEY, JSON.stringify(rows || []))
  const rid = () => {
    if (crypto?.getRandomValues) {
      const b = new Uint32Array(2)
      crypto.getRandomValues(b)
      return `r-${b[0].toString(16)}${b[1].toString(16)}`
    }
    return `r-${Math.random().toString(16).slice(2)}`
  }

  // ---------- rating ----------
  function parseRatingFromText(txt = '') {
    const n = Number(String(txt).replace(/[^\d]/g, ''))
    return n >= 1 && n <= 5 ? n : NaN
  }

  function getRating() {
    const activeBtn = qs('[data-rating].is-active, [data-rating].selected')
    if (activeBtn) {
      const v = Number(activeBtn.dataset.rating || parseRatingFromText(activeBtn.textContent))
      if (v >= 1 && v <= 5) return v
    }
    return NaN
  }

  function bindRatingClicks() {
    const container = qs('#ratingBox')
    if (!container) return
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-rating]')
      if (!btn) return
      const val = Number(btn.dataset.rating || parseRatingFromText(btn.textContent))
      if (!(val >= 1 && val <= 5)) return
      qsa('[data-rating]', container).forEach((el) => el.classList.remove('is-active', 'selected'))
      btn.classList.add('is-active', 'selected')
    })
  }

  // ---------- avatar ----------
  function bindAvatarPicker() {
    const preview = qs('#avatarPreview')
    const options = qsa('.avatar-option')
    if (!options.length) return

    options.forEach((img) => {
      img.addEventListener('click', () => {
        qsa('.avatar-option').forEach((i) => i.classList.remove('is-active', 'selected'))
        img.classList.add('is-active', 'selected')
        if (preview) preview.src = img.src
      })
    })
  }

  function getAvatar() {
    const el = qs('.avatar-option.is-active, .avatar-option.selected')
    return el ? el.getAttribute('src') || '' : qs('#avatarPreview')?.getAttribute('src') || ''
  }

  // ---------- text limit feedback ----------
  function setupTextLimiter() {
    const ta = qs('#reviewText')
    const fb = qs('#charCount')
    const render = () => {
      const len = (ta?.value || '').length
      if (!fb) return
      const ok = len <= LIMIT
      fb.textContent = `${len}/${LIMIT} — ${ok ? 'OK' : 'Too long'}`
      fb.classList.toggle('ok', ok)
      fb.classList.toggle('too-long', !ok)
    }
    if (fb) fb.textContent = `0/${LIMIT}`
    render()
    ta?.addEventListener('input', render)
  }

  // ---------- SAVE ----------
  function saveReview(ev) {
    ev?.preventDefault?.()

    const form = ev.target.closest('form') || qs('form')
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    // ✅ ดึงข้อมูลผู้ใช้จาก TU API (เก็บใน localStorage)
    const userData = JSON.parse(localStorage.getItem('studentData') || '{}')
    if (!userData.username) {
      alert('กรุณาเข้าสู่ระบบก่อน')
      window.location.href = '/login'
      return
    }

    const course = getVal(['#subject'])
    const professor = getVal(['#professor'])
    const ta = qs('#reviewText')
    const comment = ta?.value.trim() || ''

    if (comment.length > LIMIT) {
      alert(`❌ รีวิวของคุณยาวเกิน ${LIMIT} ตัวอักษร กรุณาแก้ไขก่อนส่ง`)
      ta?.focus()
      return
    }

    const rating = getRating()
    if (!(rating >= 1 && rating <= 5)) {
      alert('⭐ กรุณาเลือก Rating ก่อนส่งรีวิวครับ')
      return
    }

    // ✅ เพิ่มข้อมูลผู้ใช้เข้าไปในรีวิว
    const row = {
      id: rid(),
      course: course || 'Untitled',
      professor: professor || '',
      rating: rating,
      comment: comment.slice(0, LIMIT),
      createdAt: Date.now(),
      author: {
        username: userData.username,
        name: userData.displayname_th || 'Anonymous',
        avatar: getAvatar() || '/Avatar/Anonymous.png'
      }
    }

    const list = readLS()
    list.push(row)
    writeLS(list)

    alert('✅ ขอบคุณสำหรับการรีวิวของคุณ!')
    try {
      // ✅ redirect ไปหน้า History เพื่อดูรีวิวของตัวเอง
      window.location.href = '/dashboard/history'
    } catch {}
  }

  // ---------- INIT ----------
  document.addEventListener('DOMContentLoaded', () => {
    bindRatingClicks()
    bindAvatarPicker()
    setupTextLimiter()

    const form = qs('form')
    const submitBtn = qs('#btnSubmit')
    const cancelBtn = qs('#btnCancel')

    submitBtn?.addEventListener('click', saveReview)
    form?.addEventListener('submit', saveReview)
    cancelBtn?.addEventListener('click', (e) => {
      e.preventDefault()
      window.location.href = '/dashboard'
    })
  })
})()
