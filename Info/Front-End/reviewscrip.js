/* CSTU Pantip — Review form saver (writes to localStorage "courseReviews")
   Schema ที่ Dashboard อ่าน:
   { id, course, professor, rating(1..5), comment, createdAt, author:{name,avatar} }
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
    try { const j = JSON.parse(localStorage.getItem(LS_KEY)||'[]'); return Array.isArray(j)?j:[] }
    catch{ return [] }
  }
  const writeLS = (rows) => localStorage.setItem(LS_KEY, JSON.stringify(rows||[]))
  const rid = () => {
    if (crypto?.getRandomValues) {
      const b = new Uint32Array(2); crypto.getRandomValues(b)
      return `r-${b[0].toString(16)}${b[1].toString(16)}`
    }
    return `r-${Math.random().toString(16).slice(2)}`
  }

  // ---------- rating ----------
  function parseRatingFromText(txt=''){
    const n = Number(String(txt).replace(/[^\d]/g,''))
    return (n>=1 && n<=5) ? n : NaN
  }

  function getRating(){
    const activeBtn = qs('[data-rating].is-active, [data-rating].selected')
    if (activeBtn) {
      const v = Number(activeBtn.dataset.rating || parseRatingFromText(activeBtn.textContent))
      if (v>=1 && v<=5) return v
    }
    return NaN
  }

  function bindRatingClicks(){
    const container = qs('#ratingBox')
    container.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-rating]')
      if (!btn) return
      const val = Number(btn.dataset.rating || parseRatingFromText(btn.textContent))
      if (!(val>=1 && val<=5)) return
      qsa('[data-rating]', container).forEach(el => el.classList.remove('is-active','selected'))
      btn.classList.add('is-active','selected')
    })
  }

  // ---------- avatar ----------
  function bindAvatarPicker(){
    const preview = qs('#avatarPreview')
    const options = qsa('.avatar-option')
    if (!options.length) return

    options.forEach(img => {
      img.addEventListener('click', ()=>{
        qsa('.avatar-option').forEach(i => i.classList.remove('is-active','selected'))
        img.classList.add('is-active','selected')
        if (preview) preview.src = img.src
      })
    })
  }

  function getAvatar(){
    const el = qs('.avatar-option.is-active, .avatar-option.selected')
    return el ? (el.getAttribute('src') || '') : (qs('#avatarPreview')?.getAttribute('src') || '')
  }

  // ---------- author mode ----------
  function getAuthorName(){
    const isProfile = qs('#profileMode')?.classList.contains('active')
                   || qs('#profileMode')?.getAttribute('aria-pressed') === 'true'
    if (isProfile) {
      return getVal(['#displayName','input[name="displayName"]']) || 'profile'
    }
    return 'anonymous'
  }

  function bindAuthorModeToggle(){
    const profBtn = qs('#profileMode')
    const anonBtn = qs('#anonymousMode')
    if (!profBtn || !anonBtn) return
    const setActive = (mode) => {
      if (mode === 'profile') {
        profBtn.classList.add('active'); profBtn.setAttribute('aria-pressed','true')
        anonBtn.classList.remove('active'); anonBtn.setAttribute('aria-pressed','false')
      } else {
        anonBtn.classList.add('active'); anonBtn.setAttribute('aria-pressed','true')
        profBtn.classList.remove('active'); profBtn.setAttribute('aria-pressed','false')
      }
    }
    profBtn.addEventListener('click', ()=> setActive('profile'))
    anonBtn.addEventListener('click', ()=> setActive('anonymous'))
  }

  // ---------- text limit feedback ----------
  function setupTextLimiter(){
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
  function saveReview(ev){
    ev?.preventDefault?.()

    const form = ev.target.closest('form') || qs('form')

    // ✅ ตรวจว่า required ผ่านไหม
    if (!form.checkValidity()) {
      form.reportValidity() // ให้ browser เตือน "Please fill out this field."
      return
    }

    const course    = getVal(['#subject'])
    const professor = getVal(['#professor'])
    const ta        = qs('#reviewText')
    const comment   = ta?.value.trim() || ''

    // ✅ ความยาวเกิน limit → alert
    if (comment.length > LIMIT) {
      alert(`❌ รีวิวของคุณยาวเกิน ${LIMIT} ตัวอักษร กรุณาแก้ไขก่อนส่ง`)
      ta?.focus()
      return
    }

    // ✅ ต้องเลือก rating
    const rating = getRating()
    if (!(rating >= 1 && rating <= 5)) {
      alert("⭐ กรุณาเลือก Rating ก่อนส่งรีวิวครับ")
      return
    }

    const row = {
      id: rid(),
      course: course || 'Untitled',
      professor: professor || '',
      rating: rating,
      comment: comment.slice(0, LIMIT),
      createdAt: Date.now(),
      author: { name: getAuthorName(), avatar: getAvatar() }
    }

    const list = readLS()
    list.push(row)
    writeLS(list)

    alert("✅ ขอบคุณสำหรับการรีวิวของคุณ!")
    try { window.location.href = 'dashboard.html' } catch {}
  }

  // ---------- INIT ----------
  document.addEventListener('DOMContentLoaded', () => {
    bindRatingClicks()
    bindAvatarPicker()
    bindAuthorModeToggle()
    setupTextLimiter()

    const form = qs('form')
    const submitBtn = qs('#btnSubmit')

    // ✅ ผูก event ปุ่ม submit
    submitBtn?.addEventListener('click', saveReview)
    form?.addEventListener('submit', saveReview)

    // ✅ ปุ่ม cancel
    const cancelBtn = qs('#btnCancel')
    cancelBtn?.addEventListener('click', (e)=>{
      e.preventDefault()
      try { window.location.href = 'dashboard.html' } catch {}
    })
  })
})()
