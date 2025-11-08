// loginscript.js (TU API version — no session, no cookie)
const REMEMBER_FLAG_KEY = "cstuRememberEnabled";
const REMEMBER_CREDS_KEY = "cstuRememberCreds";

try {
  sessionStorage.removeItem("isAdmin");
} catch (e) {}

const toggleBtn = document.getElementById("togglePassword");
const passwordInput = document.getElementById("passwordInput");
const form = document.getElementById("login-form");
const errorMsg = document.getElementById("loginError");
const loginBtn = document.querySelector(".login-btn");
const studentInput = document.getElementById("studentId");
const readModeLink = document.getElementById("readModeLink");
const rememberBox = document.getElementById("rememberMe");

// === toggle password ===
if (toggleBtn && passwordInput) {
  toggleBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleBtn.setAttribute("aria-pressed", isHidden ? "true" : "false");
  });
}

// === Remember me preload ===
(function preloadRemembered() {
  try {
    const enabled = localStorage.getItem(REMEMBER_FLAG_KEY) === "true";
    const creds = JSON.parse(localStorage.getItem(REMEMBER_CREDS_KEY) || "{}");
    if (enabled && creds.username && creds.password) {
      studentInput.value = creds.username;
      passwordInput.value = creds.password;
      rememberBox.checked = true;
    }
  } catch (e) {}
})();

function saveRemember(username, password) {
  localStorage.setItem(REMEMBER_FLAG_KEY, "true");
  localStorage.setItem(
    REMEMBER_CREDS_KEY,
    JSON.stringify({ username, password })
  );
}
function clearRemember() {
  localStorage.setItem(REMEMBER_FLAG_KEY, "false");
  localStorage.removeItem(REMEMBER_CREDS_KEY);
}

// === Form submission ===
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const studentId = studentInput.value.trim();
  const password = passwordInput.value.trim();

  errorMsg.style.display = "none";

  if (!studentId || !password) {
    errorMsg.textContent = "กรุณากรอกข้อมูลให้ครบถ้วน";
    errorMsg.style.display = "block";
    return;
  }

  loginBtn.classList.add("loading");
  loginBtn.textContent = "กำลังเข้าสู่ระบบ...";
  loginBtn.disabled = true;

  try {
    // ✅ เรียก TU API ผ่าน Backend (stateless)
    const response = await fetch(
      `http://localhost:9090/api/auth/login?username=${studentId}&password=${password}`,
      {
        method: "POST"
      }
    );

    if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");

    const data = await response.json();

    if (data.status === true) {
      // ✅ จำ username และข้อมูลผู้ใช้ไว้ใน localStorage (แทน session)
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("displayName", data.user.displayName || "");
      localStorage.setItem("studentData", JSON.stringify(data.user));

      // ✅ Remember me (ถ้าเลือก)
      if (rememberBox.checked) saveRemember(studentId, password);
      else clearRemember();

      // ✅ ไปหน้า dashboard
      window.location.href = "/dashboard";
    } else {
      throw new Error(data.message || "เข้าสู่ระบบไม่สำเร็จ");
    }
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.style.display = "block";
  } finally {
    loginBtn.classList.remove("loading");
    loginBtn.textContent = "Log in";
    loginBtn.disabled = false;
  }
});

// === Read mode ===
readModeLink?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/dashboard/guest";
});
