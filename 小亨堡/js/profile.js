/* ═════════════════════════════════════════════
   Profile 頁面（個人版面 · 3 tab）
   ═════════════════════════════════════════════ */

const ProfileState = {
    tab: 'posts',     // posts | reposts | products
    userId: 'u_me',   // 從 ?u= 取，預設自己
};

document.addEventListener('DOMContentLoaded', initProfile);

async function initProfile() {
    const params = new URLSearchParams(location.search);
    ProfileState.userId = params.get('u') || 'u_me';

    injectBottomNav('profile');

    const ok = await loadPlatformData();
    if (!ok) {
        document.getElementById('profileInfo').innerHTML = `<div class="empty-state"><div class="ic">⚠️</div><h4>載入失敗</h4><p>請重新整理</p></div>`;
        return;
    }

    renderProfileInfo();
    bindTabs();
    renderTab(ProfileState.tab);
}

/* ── 上半 Profile 資訊 ── */
function renderProfileInfo() {
    const u = getUser(ProfileState.userId);
    const root = document.getElementById('profileInfo');
    if (!u) {
        root.innerHTML = `<div class="empty-state"><div class="ic">😶</div><h4>找不到使用者</h4></div>`;
        return;
    }

    document.getElementById('profileTitle').textContent = u.handle || ('@' + u.id);

    const isMe = !!u.isMe;
    const followed = isFollowing(u.id);
    const myPostCount = Platform.posts.filter(p => p.author === u.id).length;
    const myProductCount = Platform.products.filter(p => p.seller === u.id).length;

    root.innerHTML = `
        <div class="profile-top">
            ${renderAvatar(u, 'lg')}
            <div class="profile-stats">
                <div class="profile-stat" data-tab="posts" role="button">
                    <strong>${formatNum(u.postCount || myPostCount)}</strong>
                    <span>貼文</span>
                </div>
                <div class="profile-stat">
                    <strong>${formatNum(u.followers || 0)}</strong>
                    <span>追蹤者</span>
                </div>
                <div class="profile-stat">
                    <strong>${formatNum(u.following || 0)}</strong>
                    <span>追蹤中</span>
                </div>
            </div>
        </div>
        <div class="profile-name">
            ${esc(u.name)}
            <span class="handle">${esc(u.handle || '')}</span>
        </div>
        ${u.bio ? `<div class="profile-bio">${esc(u.bio)}</div>` : ''}
        ${u.location ? `<div class="profile-loc"><i class="fas fa-location-dot"></i> ${esc(u.location)}</div>` : ''}
        <div class="profile-actions">
            ${isMe
                ? `<button class="pa-btn ghost" data-act="edit"><i class="fas fa-pen"></i> 編輯個人檔</button>
                   <button class="pa-btn ghost" data-act="share"><i class="fas fa-share-nodes"></i> 分享</button>`
                : `<button class="pa-btn ${followed?'followed':'primary'}" data-act="follow">
                       <i class="fas ${followed?'fa-check':'fa-plus'}"></i> ${followed?'追蹤中':'追蹤'}
                   </button>
                   <a class="pa-btn ghost" href="chat.html?to=${esc(u.id)}">
                       <i class="far fa-paper-plane"></i> 訊息
                   </a>`
            }
        </div>
    `;

    // 綁定按鈕
    root.querySelectorAll('[data-act]').forEach(btn => {
        btn.addEventListener('click', () => {
            const act = btn.dataset.act;
            if (act === 'follow') {
                const v = toggleFollow(u.id);
                renderProfileInfo();
                toast(v ? `已追蹤 ${u.name}` : `已取消追蹤`);
            } else if (act === 'edit') {
                toast('編輯個人檔即將推出');
            } else if (act === 'share') {
                toast('分享個人版面（即將推出）');
            }
        });
    });
    // 點貼文 stat 跳到 posts tab
    root.querySelectorAll('[data-tab]').forEach(s => {
        s.addEventListener('click', () => switchTab(s.dataset.tab));
    });
}

/* ── Tab 切換 ── */
function bindTabs() {
    document.querySelectorAll('.ptab').forEach(t => {
        t.addEventListener('click', () => switchTab(t.dataset.tab));
    });
}

function switchTab(key) {
    document.querySelectorAll('.ptab').forEach(t => t.classList.toggle('active', t.dataset.tab === key));
    ProfileState.tab = key;
    renderTab(key);
}

function renderTab(key) {
    const root = document.getElementById('tabContent');
    if (key === 'posts')    return renderPostsTab(root);
    if (key === 'reposts')  return renderRepostsTab(root);
    if (key === 'products') return renderProductsTab(root);
}

/* ── Tab 1：寶寶日常（Posts grid）── */
function renderPostsTab(root) {
    const myPosts = Platform.posts.filter(p => p.author === ProfileState.userId);
    if (myPosts.length === 0) {
        const u = getUser(ProfileState.userId);
        const isMe = u && u.isMe;
        root.innerHTML = `
            <div class="empty-state">
                <div class="ic">📷</div>
                <h4>還沒有貼文</h4>
                <p>${isMe ? '記錄寶寶日常的第一個瞬間吧 ❤️' : '這位媽咪還沒分享日常'}</p>
            </div>`;
        return;
    }
    root.innerHTML = `<div class="profile-grid">
        ${myPosts.map(p => `
            <div class="pg-item" data-pid="${esc(p.id)}">
                ${renderMedia(p.media[0])}
                ${p.media.length > 1 ? `<span class="pg-multi"><i class="fas fa-images"></i></span>` : ''}
                <div class="pg-overlay">
                    <span><i class="fas fa-heart"></i>${formatNum(p.likes)}</span>
                    <span><i class="fas fa-comment"></i>${(p.comments||[]).length}</span>
                </div>
            </div>`).join('')}
    </div>`;
    bindGridClick(root);
}

/* ── Tab 2：轉發 ── */
function renderRepostsTab(root) {
    const reposted = Platform.posts.filter(p => isReposted(p.id));
    if (reposted.length === 0) {
        const u = getUser(ProfileState.userId);
        const isMe = u && u.isMe;
        root.innerHTML = `
            <div class="empty-state">
                <div class="ic">🔁</div>
                <h4>還沒有轉發</h4>
                <p>${isMe ? '到「日常」找到喜歡的貼文，按 🔁 收進來' : '這位媽咪還沒轉發過貼文'}</p>
            </div>`;
        return;
    }
    root.innerHTML = `<div class="profile-grid">
        ${reposted.map(p => {
            const author = getUser(p.author);
            return `<div class="pg-item" data-pid="${esc(p.id)}">
                ${renderMedia(p.media[0])}
                <div class="pg-overlay">
                    <span><i class="fas fa-retweet"></i>來自 ${esc(author ? author.name : '匿名')}</span>
                </div>
            </div>`;
        }).join('')}
    </div>`;
    bindGridClick(root);
}

/* ── Tab 3：我的小物（二手商品）── */
function renderProductsTab(root) {
    const myProducts = Platform.products.filter(p => p.seller === ProfileState.userId);
    if (myProducts.length === 0) {
        const u = getUser(ProfileState.userId);
        const isMe = u && u.isMe;
        root.innerHTML = `
            <div class="empty-state">
                <div class="ic">🛍</div>
                <h4>還沒上架二手物</h4>
                <p>${isMe ? '寶寶長大用不到的東西，也能換點現金 💰' : '這位媽咪目前沒有上架二手物'}</p>
            </div>`;
        return;
    }
    root.innerHTML = `<div class="products-grid">
        ${myProducts.map(p => `
            <div class="product-card" data-pid="${esc(p.id)}">
                ${renderMedia(p.media[0])}
                <div class="product-info">
                    <span class="product-cond">${esc(p.condition)}</span>
                    <div class="product-title">${esc(p.title)}</div>
                    <div class="product-price">$${p.price.toLocaleString()}<span class="orig">$${p.originalPrice.toLocaleString()}</span></div>
                    <div class="product-meta">
                        <span>${esc(p.ageTag)}</span>
                        <span><i class="fas fa-heart"></i>${formatNum(p.wants)}</span>
                    </div>
                </div>
            </div>`).join('')}
    </div>`;
    root.querySelectorAll('.product-card').forEach(c => {
        c.addEventListener('click', () => toast('商品詳情即將推出'));
    });
}

function bindGridClick(root) {
    root.querySelectorAll('.pg-item').forEach(it => {
        it.addEventListener('click', () => toast('貼文詳情即將推出'));
    });
}

/* ── Helper ── */
function goBackOrFeed() {
    if (history.length > 1) history.back();
    else location.href = 'feed.html';
}
window.goBackOrFeed = goBackOrFeed;
