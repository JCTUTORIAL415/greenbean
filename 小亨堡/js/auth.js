// ═══ Storage Keys ═══
const LS_USERS = 'momtrip_users';
const LS_SESSION = 'momtrip_session';
const LS_REMEMBER = 'momtrip_remember';

// ═══ Tab 切換 ═══
const tabs = document.getElementById('tabs');
const tabBtns = tabs.querySelectorAll('.tab');
const panels = {
    login: document.getElementById('loginPanel'),
    register: document.getElementById('registerPanel')
};
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.panel));
});
function switchTab(name) {
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    Object.entries(panels).forEach(([k, p]) => p.classList.toggle('active', k === name));
    tabs.classList.toggle('register', name === 'register');
}

// ═══ 顯示密碼切換 ═══
document.querySelectorAll('.toggle-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        const icon = btn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

// ═══ 工具：雜湊（非安全用途，純前端 Demo）═══
async function hashPwd(text) {
    const enc = new TextEncoder().encode(text + '|momtrip_salt');
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUsers() {
    try { return JSON.parse(localStorage.getItem(LS_USERS)) || {}; }
    catch { return {}; }
}
function saveUsers(users) {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
}
function genToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ═══ Toast ═══
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
function showToast(msg, type = 'ok') {
    toastMsg.textContent = msg;
    toast.className = 'toast ' + type + ' show';
    const icon = toast.querySelector('i');
    icon.className = type === 'ok' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ═══ 密碼強度 ═══
const regPwd = document.getElementById('regPwd');
const pwdStrength = document.getElementById('pwdStrength');
const pwdLabel = document.getElementById('pwdLabel');
regPwd.addEventListener('input', () => {
    const v = regPwd.value;
    if (!v) { pwdStrength.classList.remove('show'); return; }
    pwdStrength.classList.add('show');
    const score = calcStrength(v);
    pwdStrength.classList.remove('weak', 'medium', 'strong');
    if (score <= 1) { pwdStrength.classList.add('weak'); pwdLabel.textContent = '強度：弱（建議加入英文數字混合）'; }
    else if (score === 2) { pwdStrength.classList.add('medium'); pwdLabel.textContent = '強度：中等'; }
    else { pwdStrength.classList.add('strong'); pwdLabel.textContent = '強度：強 ✓'; }
});
function calcStrength(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Za-z]/.test(p) && /[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
    return s;
}

// ═══ 註冊：即時檢查 ═══
const regEmail = document.getElementById('regEmail');
const regEmailHint = document.getElementById('regEmailHint');
regEmail.addEventListener('blur', () => {
    const v = regEmail.value.trim().toLowerCase();
    if (!v) { regEmailHint.style.display = 'none'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        regEmailHint.className = 'hint error';
        regEmailHint.textContent = '請輸入正確的 Email 格式';
        regEmailHint.style.display = 'flex';
        return;
    }
    const users = getUsers();
    if (users[v]) {
        regEmailHint.className = 'hint error';
        regEmailHint.textContent = '此 Email 已被註冊，請直接登入';
        regEmailHint.style.display = 'flex';
    } else {
        regEmailHint.className = 'hint ok';
        regEmailHint.innerHTML = '<i class="fas fa-check-circle"></i> Email 可使用';
        regEmailHint.style.display = 'flex';
    }
});

const regPwd2 = document.getElementById('regPwd2');
const regPwd2Hint = document.getElementById('regPwd2Hint');
regPwd2.addEventListener('input', () => {
    if (!regPwd2.value) { regPwd2Hint.style.display = 'none'; return; }
    if (regPwd2.value === regPwd.value) {
        regPwd2Hint.className = 'hint ok';
        regPwd2Hint.innerHTML = '<i class="fas fa-check-circle"></i> 密碼一致';
    } else {
        regPwd2Hint.className = 'hint error';
        regPwd2Hint.textContent = '兩次輸入的密碼不一致';
    }
    regPwd2Hint.style.display = 'flex';
});

// ═══ 註冊提交 ═══
document.getElementById('registerPanel').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = regEmail.value.trim().toLowerCase();
    const pwd = regPwd.value;
    const pwd2 = regPwd2.value;
    const remember = document.getElementById('regRemember').checked;

    if (!name) return showToast('請輸入媽咪暱稱', 'err');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('Email 格式不正確', 'err');
    if (pwd.length < 8) return showToast('密碼至少 8 碼', 'err');
    if (!(/[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd))) return showToast('密碼需含英文與數字', 'err');
    if (pwd !== pwd2) return showToast('兩次密碼不一致', 'err');

    const users = getUsers();
    if (users[email]) return showToast('此 Email 已被註冊', 'err');

    const btn = e.target.querySelector('.submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 註冊中...';

    try {
        const pwdHash = await hashPwd(pwd);
        users[email] = {
            name, email, pwdHash,
            createdAt: new Date().toISOString()
        };
        saveUsers(users);
        establishSession(email, name, remember);
        showToast('註冊成功！歡迎加入 🎉', 'ok');
        setTimeout(() => { window.location.href = 'index.html'; }, 900);
    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> 建立帳號';
        showToast('註冊失敗，請重試', 'err');
    }
});

// ═══ 登入提交 ═══
document.getElementById('loginPanel').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pwd = document.getElementById('loginPwd').value;
    const remember = document.getElementById('rememberMe').checked;

    if (!email || !pwd) return showToast('請輸入 Email 與密碼', 'err');

    const btn = e.target.querySelector('.submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登入中...';

    try {
        const users = getUsers();
        const user = users[email];
        const pwdHash = await hashPwd(pwd);
        if (!user || user.pwdHash !== pwdHash) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-right-to-bracket"></i> 登入';
            return showToast('Email 或密碼錯誤', 'err');
        }
        establishSession(email, user.name, remember);
        showToast('登入成功，歡迎回來 ' + user.name, 'ok');
        setTimeout(() => { window.location.href = 'index.html'; }, 800);
    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-right-to-bracket"></i> 登入';
        showToast('登入失敗，請重試', 'err');
    }
});

// ═══ 建立 Session ═══
// 短期：sessionStorage；長期「記住我」：localStorage（30 天）
function establishSession(email, name, remember) {
    const token = genToken();
    const session = { email, name, token, loginAt: Date.now() };
    sessionStorage.setItem(LS_SESSION, JSON.stringify(session));
    if (remember) {
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem(LS_REMEMBER, JSON.stringify({ ...session, expiresAt }));
    } else {
        localStorage.removeItem(LS_REMEMBER);
    }
}

// ═══ 自動登入：檢查 remember token ═══
(function autoLogin() {
    try {
        const saved = localStorage.getItem(LS_REMEMBER);
        if (!saved) return;
        const data = JSON.parse(saved);
        if (!data.expiresAt || data.expiresAt < Date.now()) {
            localStorage.removeItem(LS_REMEMBER);
            return;
        }
        // 預填 Email、取消聚焦以防誤觸
        document.getElementById('loginEmail').value = data.email;
        // 若已有 sessionStorage 就視為已登入，可自動前往首頁
        const hasSession = sessionStorage.getItem(LS_SESSION);
        if (!hasSession) {
            // 回寫 session 方便下游使用
            sessionStorage.setItem(LS_SESSION, JSON.stringify({
                email: data.email, name: data.name, token: data.token, loginAt: Date.now()
            }));
        }
    } catch {}
})();

// ═══ 其他動作 ═══
function forgotPwd(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    if (!email) return showToast('請先輸入 Email', 'err');
    showToast('密碼重設信已寄出（Demo）', 'ok');
}
