/* ═════════════════════════════════════════════
   小亨堡QA Platform 共用 JS
   ═════════════════════════════════════════════ */

const Platform = {
    users: null,
    posts: null,
    products: null,
    state: {
        likes: new Set(),
        saves: new Set(),
        reposts: new Set(),
        following: new Set(),
    },
};

/* ── 載入資料 ── */
async function loadPlatformData() {
    try {
        const [u, p, pr] = await Promise.all([
            fetch('data/users.json').then(r => r.json()),
            fetch('data/posts.json').then(r => r.json()),
            fetch('data/products.json').then(r => r.json()),
        ]);
        Platform.users = u;
        Platform.posts = p;
        Platform.products = pr;
        loadStateFromLocalStorage();
        return true;
    } catch (err) {
        console.error('資料載入失敗', err);
        return false;
    }
}

function loadStateFromLocalStorage() {
    ['likes', 'saves', 'reposts', 'following'].forEach(key => {
        try {
            const v = JSON.parse(localStorage.getItem('xhb.' + key) || '[]');
            Platform.state[key] = new Set(v);
        } catch {
            Platform.state[key] = new Set();
        }
    });
}

function persistState(key) {
    try {
        localStorage.setItem('xhb.' + key, JSON.stringify([...Platform.state[key]]));
    } catch {}
}

/* ── User helper ── */
function getMe() {
    return Platform.users && Platform.users.find(u => u.isMe);
}

function getUser(id) {
    return Platform.users && Platform.users.find(u => u.id === id);
}

/* ── Like / Save / Repost / Follow ── */
function isLiked(postId)    { return Platform.state.likes.has(postId); }
function isSaved(postId)    { return Platform.state.saves.has(postId); }
function isReposted(postId) { return Platform.state.reposts.has(postId); }
function isFollowing(uid)   { return Platform.state.following.has(uid); }

function toggleLike(id) {
    if (isLiked(id)) Platform.state.likes.delete(id);
    else Platform.state.likes.add(id);
    persistState('likes');
    return isLiked(id);
}
function toggleSave(id) {
    if (isSaved(id)) Platform.state.saves.delete(id);
    else Platform.state.saves.add(id);
    persistState('saves');
    return isSaved(id);
}
function toggleRepost(id) {
    if (isReposted(id)) Platform.state.reposts.delete(id);
    else Platform.state.reposts.add(id);
    persistState('reposts');
    return isReposted(id);
}
function toggleFollow(uid) {
    if (isFollowing(uid)) Platform.state.following.delete(uid);
    else Platform.state.following.add(uid);
    persistState('following');
    return isFollowing(uid);
}

/* ── Avatar 渲染（漸層+emoji 或真圖） ── */
function renderAvatar(user, size = '') {
    const sz = size ? `size-${size}` : '';
    if (!user) return `<div class="avatar ${sz}"></div>`;
    if (user.avatar) {
        return `<div class="avatar ${sz}"><img src="${esc(user.avatar)}" alt="${esc(user.name)}"></div>`;
    }
    const style = `--g1:${user.color1 || '#E8F8F5'};--g2:${user.color2 || '#EBF5FB'}`;
    return `<div class="avatar ${sz} with-gradient" style="${style}"><span class="av-emoji">${esc(user.emoji || '👶')}</span></div>`;
}

/* ── Media 渲染（漸層+emoji 佔位） ── */
function renderMedia(m, mods = '') {
    if (!m) {
        return `<div class="media ${mods}" style="--g1:#E8F8F5;--g2:#EBF5FB"><span class="m-emoji">🍼</span></div>`;
    }
    const style = `--g1:${m.color1 || '#E8F8F5'};--g2:${m.color2 || '#EBF5FB'}`;
    return `<div class="media ${mods}" style="${style}"><span class="m-emoji">${esc(m.emoji || '🍼')}</span></div>`;
}

/* ── 底部 5 tab Nav ── */
function renderBottomNav(active) {
    return `
        <nav class="bottom-nav">
            <div class="nav-grid">
                <a href="feed.html" class="nav-item ${active==='feed'?'active':''}">
                    <span class="nav-ic">🍼</span><span class="nav-label">日常</span>
                </a>
                <a href="market.html" class="nav-item ${active==='market'?'active':''}">
                    <span class="nav-ic">🛍</span><span class="nav-label">二手</span>
                </a>
                <div class="nav-item nav-add">
                    <button class="nav-add-btn" onclick="openCompose()" aria-label="發文">+</button>
                </div>
                <a href="index.html" class="nav-item ${active==='qa'?'active':''}">
                    <span class="nav-ic">🍔</span><span class="nav-label">QA</span>
                </a>
                <a href="profile.html" class="nav-item ${active==='profile'?'active':''}">
                    <span class="nav-ic">👤</span><span class="nav-label">我</span>
                </a>
            </div>
        </nav>`;
}

function injectBottomNav(active) {
    const holder = document.getElementById('navHolder');
    if (holder) holder.outerHTML = renderBottomNav(active);
}

function openCompose() {
    toast('發文 / 上架功能即將推出 ✏️');
}

/* ── 文字工具 ── */
function formatNum(n) {
    n = Number(n) || 0;
    if (n < 1000) return String(n);
    if (n < 10000) return (n/1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return Math.floor(n/1000) + 'k';
}

function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function babyBadge(user) {
    if (!user) return '';
    const g = user.babyGender === '男' ? '男寶'
            : user.babyGender === '女' ? '女寶'
            : user.babyGender === '女女' ? '雙女寶'
            : user.babyGender === '男男' ? '雙男寶'
            : '';
    const age = user.babyAge ? user.babyAge : '';
    return [age, g].filter(Boolean).join(' ');
}

/* ── Toast ── */
let toastTimer = null;
function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}
