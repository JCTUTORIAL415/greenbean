/* ═════════════════════════════════════════════
   Feed 頁面（寶寶日常貼文流）
   ═════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', initFeed);

async function initFeed() {
    injectBottomNav('feed');
    const ok = await loadPlatformData();
    if (!ok) {
        document.getElementById('feed').innerHTML = `<div class="empty-state"><div class="ic">⚠️</div><h4>載入失敗</h4><p>請重新整理頁面</p></div>`;
        return;
    }
    renderStories();
    renderFeed();
}

/* ── Stories（限動橫條）── */
function renderStories() {
    const root = document.getElementById('stories');
    const me = getMe();
    const others = Platform.users.filter(u => !u.isMe);

    const meHtml = `
        <div class="story-item" onclick="toast('限動上傳功能即將推出')">
            <div class="story-ring muted">${renderAvatar(me)}</div>
            <span class="story-name">+ 我的</span>
        </div>`;
    const othersHtml = others.map(u => `
        <div class="story-item" onclick="viewStory('${esc(u.id)}')">
            <div class="story-ring">${renderAvatar(u)}</div>
            <span class="story-name">${esc(u.name)}</span>
        </div>`).join('');

    root.innerHTML = meHtml + othersHtml;
}

function viewStory(uid) {
    const u = getUser(uid);
    if (u) toast(`${u.name} 的限動（即將推出）`);
}

/* ── Feed 主流 ── */
function renderFeed() {
    const root = document.getElementById('feed');
    if (Platform.posts.length === 0) {
        root.innerHTML = `<div class="empty-state"><div class="ic">📭</div><h4>還沒有貼文</h4><p>追蹤其他媽咪、或自己發第一篇吧</p></div>`;
        return;
    }
    root.innerHTML = Platform.posts.map(p => renderPost(p)).join('');
    bindPostEvents();
}

function renderPost(p) {
    const author = getUser(p.author);
    const liked = isLiked(p.id);
    const saved = isSaved(p.id);
    const reposted = isReposted(p.id);
    const likeCount = (p.likes || 0) + (liked ? 1 : 0);
    const shareCount = (p.shares || 0) + (reposted ? 1 : 0);

    const multi = p.media.length > 1;
    const mediaHtml = `
        <div class="post-media" data-idx="0">
            <div class="media-track">
                ${p.media.map(m => renderMedia(m)).join('')}
            </div>
            ${multi ? `<div class="pager">1 / ${p.media.length}</div>` : ''}
            ${multi ? `<button class="nav-arrow left" data-arrow="prev" disabled><i class="fas fa-chevron-left"></i></button>` : ''}
            ${multi ? `<button class="nav-arrow right" data-arrow="next"><i class="fas fa-chevron-right"></i></button>` : ''}
            ${multi ? `<div class="dots">${p.media.map((_, i) => `<span class="dot ${i===0?'active':''}"></span>`).join('')}</div>` : ''}
        </div>`;

    const tagText = (p.tags || []).map(t => `<span class="tag" data-kw="${esc(t.replace(/^#/, ''))}">${esc(t)}</span>`).join(' ');
    const textWithBR = esc(p.text).replace(/\n/g, '<br>');
    const textBlock = textWithBR + (tagText ? `<br><br>${tagText}` : '');

    const totalCmt = (p.comments || []).length;
    const showAll = totalCmt > 2 ? `<div class="post-comments"><span class="show-all" data-act="show-all">查看全部 ${totalCmt} 則留言</span></div>` : '';
    const cmtHtml = (p.comments || []).slice(-2).map(c => {
        const cu = getUser(c.author);
        return `<div class="post-comment-line"><strong>${esc(cu ? cu.name : '匿名')}</strong>${esc(c.text)}</div>`;
    }).join('');
    const cmtBlock = totalCmt > 0 ? `<div class="post-comments">${cmtHtml}</div>` : '';

    return `
        <article class="post" data-id="${esc(p.id)}">
            <div class="post-head">
                <a href="profile.html?u=${esc(p.author)}">${renderAvatar(author)}</a>
                <div class="post-meta">
                    <div class="post-author">
                        <a href="profile.html?u=${esc(p.author)}" style="color:inherit">${esc(author ? author.name : '匿名')}</a>
                        <span class="badge-baby">${esc(babyBadge(author))}</span>
                    </div>
                    <div class="post-sub">${p.location ? esc(p.location) + ' · ' : ''}${esc(p.createdAt)}</div>
                </div>
                <button class="post-more" aria-label="更多" data-act="more"><i class="fas fa-ellipsis"></i></button>
            </div>
            ${mediaHtml}
            <div class="post-actions">
                <button class="act-btn ${liked?'liked':''}" data-act="like" aria-label="按讚"><i class="${liked?'fas':'far'} fa-heart"></i></button>
                <button class="act-btn" data-act="comment" aria-label="留言"><i class="far fa-comment"></i></button>
                <button class="act-btn ${reposted?'reposted':''}" data-act="repost" aria-label="轉發"><i class="fas fa-retweet"></i></button>
                <button class="act-btn" data-act="dm" aria-label="私訊"><i class="far fa-paper-plane"></i></button>
                <button class="act-btn save-spacer ${saved?'saved':''}" data-act="save" aria-label="收藏"><i class="${saved?'fas':'far'} fa-bookmark"></i></button>
            </div>
            <div class="post-stats">
                <span class="like-num">${formatNum(likeCount)}</span> 人按讚<span class="dim"> · </span>${formatNum(shareCount)} 轉發
            </div>
            <div class="post-text">${textBlock}</div>
            ${showAll}
            ${cmtBlock}
            <div class="post-time">${esc(p.createdAt)}前</div>
        </article>`;
}

/* ── 事件綁定 ── */
function bindPostEvents() {
    document.querySelectorAll('.post .act-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const post = btn.closest('.post');
            const id = post.dataset.id;
            const act = btn.dataset.act;
            const i = btn.querySelector('i');

            if (act === 'like') {
                const v = toggleLike(id);
                btn.classList.toggle('liked', v);
                i.className = v ? 'fas fa-heart' : 'far fa-heart';
                updateStats(post);
            } else if (act === 'save') {
                const v = toggleSave(id);
                btn.classList.toggle('saved', v);
                i.className = v ? 'fas fa-bookmark' : 'far fa-bookmark';
                toast(v ? '已收藏' : '取消收藏');
            } else if (act === 'repost') {
                const v = toggleRepost(id);
                btn.classList.toggle('reposted', v);
                toast(v ? '已轉發到「我的個人版 · 轉發」' : '取消轉發');
                updateStats(post);
            } else if (act === 'comment') {
                toast('留言功能即將推出');
            } else if (act === 'dm') {
                const p = Platform.posts.find(x => x.id === id);
                if (p) location.href = `chat.html?to=${encodeURIComponent(p.author)}&post=${encodeURIComponent(id)}`;
            }
        });
    });

    // 多圖切換
    document.querySelectorAll('.post-media').forEach(media => {
        const track = media.querySelector('.media-track');
        if (!track) return;
        const total = track.children.length;
        if (total <= 1) return;

        const prev = media.querySelector('[data-arrow="prev"]');
        const next = media.querySelector('[data-arrow="next"]');
        const pager = media.querySelector('.pager');
        const dots = media.querySelectorAll('.dot');

        const go = (idx) => {
            idx = Math.max(0, Math.min(total - 1, idx));
            media.dataset.idx = idx;
            track.style.transform = `translateX(-${idx * 100}%)`;
            if (pager) pager.textContent = `${idx + 1} / ${total}`;
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            if (prev) prev.disabled = idx === 0;
            if (next) next.disabled = idx === total - 1;
        };

        if (prev) prev.addEventListener('click', () => go(parseInt(media.dataset.idx) - 1));
        if (next) next.addEventListener('click', () => go(parseInt(media.dataset.idx) + 1));

        // 觸控滑動
        let startX = 0, dragging = false;
        track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
        track.addEventListener('touchend', e => {
            if (!dragging) return;
            dragging = false;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) go(parseInt(media.dataset.idx) + (dx < 0 ? 1 : -1));
        });
    });

    // tag 點擊（之後做搜尋）
    document.querySelectorAll('.post-text .tag').forEach(t => {
        t.addEventListener('click', () => toast(`搜尋 #${t.dataset.kw}（即將推出）`));
    });

    // 「查看全部留言」
    document.querySelectorAll('.post-comments [data-act="show-all"]').forEach(b => {
        b.addEventListener('click', () => toast('完整留言串即將推出'));
    });

    // ⋯ 更多
    document.querySelectorAll('.post-more').forEach(b => {
        b.addEventListener('click', () => toast('更多選項即將推出'));
    });
}

function updateStats(postEl) {
    const id = postEl.dataset.id;
    const p = Platform.posts.find(x => x.id === id);
    if (!p) return;
    const likeCount = (p.likes || 0) + (isLiked(id) ? 1 : 0);
    const shareCount = (p.shares || 0) + (isReposted(id) ? 1 : 0);
    const stats = postEl.querySelector('.post-stats');
    if (stats) stats.innerHTML = `<span class="like-num">${formatNum(likeCount)}</span> 人按讚<span class="dim"> · </span>${formatNum(shareCount)} 轉發`;
}
