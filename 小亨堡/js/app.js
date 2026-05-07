/* ═════════════════════════════════════════════
   小亨堡QA App
   首頁 + 結果（完整 QA 卡 + 字卡）+ SOS + 5-tab nav
   ═════════════════════════════════════════════ */

const App = {
    data: null,
    busy: false,
    qrGroupId: 0,
    voiceRec: null,
    voiceTarget: null,
    voiceBtn: null,
    ctx: {
        flow: 'idle',  // idle | form
        formStep: 0,
        formData: {},
    },
};

/* ── 紅旗關鍵字偵測 ── */
const RED_FLAG_PATTERNS = [
    { kw: ['嘴唇紫', '嘴唇發紫', '發紺', '臉色發白', '臉色蒼白'],     note: '可能缺氧或循環異常' },
    { kw: ['不哭', '叫不醒', '不出聲', '昏迷', '昏厥', '失去意識', '無反應'], note: '意識改變或可能哽塞' },
    { kw: ['抽搐', '癲癇', '熱痙攣', '抽筋'],                        note: '抽搐可能需要緊急處置' },
    { kw: ['噎到', '哽塞', '異物吞', '異物嗆', '吞下', '吃進'],        note: '可能哽塞，需立即急救' },
    { kw: ['誤食', '吃下藥', '吃了藥', '吞了電池', '吞磁鐵', '吞錢幣'], note: '誤食可能中毒或腸阻塞' },
    { kw: ['吐血', '便血', '血便', '吐黃綠', '吐膽汁'],               note: '消化道出血或腸阻塞' },
    { kw: ['呼吸困難', '凹胸', '喘鳴', '無呼吸', '呼吸急促', '胸口凹'], note: '呼吸窘迫，可能缺氧' },
    { kw: ['8小時沒尿', '8h沒尿', '一天沒尿', '24小時沒尿', '整天沒尿', '尿很少'], note: '嚴重脫水徵兆' },
    { kw: ['燙傷', '熱水燙', '湯燙', '油濺'],                        note: '燙傷需立即降溫處置' },
    { kw: ['撞到頭', '頭撞', '頭部撞到', '頭部摔', '從床上摔', '從沙發摔'], note: '頭部外傷需密切觀察' },
    { kw: ['溺水', '掉到水', '泡水太久'],                            note: '溺水必立即急救' },
    { kw: ['過敏腫', '嘴腫', '臉腫', '蕁麻疹全身'],                   note: '嚴重過敏可能引發休克' },
];
const RED_FLAG_DISPLAY = ['嘴唇紫', '抽搐', '噎到', '誤食', '陷食', '吐血', '撞到頭', '8h 沒尿', '呼吸困難', '叫不醒'];

/* ── 緊急電話 / 兒童急診 ── */
const EMERGENCY = [
    { name: '119 救護車',    tel: '119',        note: '生命緊急狀況、需要緊急醫療運送', urgent: true },
    { name: '110 警察',      tel: '110',        note: '意外事故、家庭暴力、人身安全' },
    { name: '113 保護專線',  tel: '113',        note: '兒少 / 家暴 / 性侵保護通報' },
    { name: '毒物諮詢 24h',  tel: '0228717121', display: '02-2871-7121', note: '誤食藥物 / 清潔劑 / 植物 / 蛇蟲咬傷諮詢' },
];
const HOSPITALS = [
    { name: '台大兒童醫院 急診',     tel: '0223123456', display: '02-2312-3456', note: '台北市中正區' },
    { name: '林口長庚兒童醫院 急診', tel: '033281200',  display: '03-328-1200',  note: '桃園市龜山區' },
    { name: '馬偕兒童醫院 急診',     tel: '0225433535', display: '02-2543-3535', note: '台北市中山區' },
    { name: '台中榮總兒童醫學部',    tel: '0423592525', display: '04-2359-2525', note: '台中市西屯區' },
    { name: '高雄長庚兒童醫院 急診', tel: '077317123',  display: '07-731-7123',  note: '高雄市鳥松區' },
];

/* ── 問診清單（簡版 8 題） ── */
const FORM_QUESTIONS = [
    { key: 'age',     ask: '寶寶現在幾個月？',           hint: '例：8M、1Y3M（早產者註明矯正月齡）',  qr: ['<3M', '3M', '6M', '9M', '1Y', '1Y6M', '2Y'] },
    { key: 'gender',  ask: '性別＋體重？',               hint: '例：女, 7.5kg',                       qr: ['男寶', '女寶'] },
    { key: 'symptom', ask: '主要症狀是什麼？',           hint: '可寫多個，例：發燒+咳嗽',              qr: ['發燒', '吐奶', '腹瀉', '紅疹', '咳嗽', '便祕'] },
    { key: 'start',   ask: '從什麼時候開始的？',         hint: '例：今天早上、昨晚 8 點',              qr: ['1 小時內', '今天', '昨天', '2-3 天'] },
    { key: 'temp',    ask: '體溫多少？（沒發燒打「無」）', hint: '例：38.5、無',                      qr: ['無', '37.5–38', '38–39', '39–40', '>40'] },
    { key: 'spirit',  ask: '精神 / 活力如何？',          hint: '會玩會笑＝好；嗜睡無力＝差',          qr: ['很好', '尚可', '較差', '嗜睡叫不醒'] },
    { key: 'feeding', ask: '喝奶 / 吃飯狀況？',          hint: '比平常多/差不多/少多少%',             qr: ['正常', '少 30%', '少 50%', '幾乎不喝'] },
    { key: 'action',  ask: '已經做了什麼處置？',         hint: '例：餵退燒藥、補水、看過診所',         qr: ['尚未處置', '已退燒', '已補水', '看過診所'] },
];

/* ── 月齡選項（限縮範圍用） ── */
const AGE_OPTIONS = [
    { key: 'lt3m', label: '<3M',   range: [0, 3] },
    { key: '3m',   label: '3-6M',  range: [3, 6] },
    { key: '6m',   label: '6-9M',  range: [6, 9] },
    { key: '9m',   label: '9-12M', range: [9, 12] },
    { key: '1y',   label: '1-1.5Y', range: [12, 18] },
    { key: '1y6m', label: '1.5-2Y', range: [18, 24] },
    { key: '2y',   label: '2Y+',    range: [24, 240] },
];

function getAgeLabel(key) {
    const o = AGE_OPTIONS.find(a => a.key === key);
    return o ? o.label : '';
}

/* 解析 qa.age 字串成 [minMonth, maxMonth] 範圍 */
function parseAgeRange(ageStr) {
    if (!ageStr) return [0, 240];
    const s = String(ageStr).trim();
    if (s === '全' || s === '媽媽' || s === '男寶' || s === '女寶') return [0, 240];

    const months = [];
    const lt = s.match(/[<＜]\s*(\d+)\s*[Mm]/);
    if (lt) { months.push(0, parseInt(lt[1], 10)); }

    const re = /(\d+)\s*([MmYy])/g;
    let m;
    while ((m = re.exec(s)) !== null) {
        const n = parseInt(m[1], 10);
        months.push(m[2].toLowerCase() === 'y' ? n * 12 : n);
    }

    if (months.length === 0) return [0, 240];
    const hasPlus = /\+|前|以上|以後/.test(s);
    const min = Math.min(...months);
    const max = hasPlus ? 240 : Math.max(...months);
    return [min, max];
}

function ageMatches(qaAge, key) {
    if (!key) return true;
    const opt = AGE_OPTIONS.find(a => a.key === key);
    if (!opt) return true;
    const [qMin, qMax] = parseAgeRange(qaAge);
    const [oMin, oMax] = opt.range;
    return qMin <= oMax && qMax >= oMin;
}

function renderAgeFilterChips(opts = {}) {
    const chips = AGE_OPTIONS.map(a => ({
        label: a.label,
        ghost: opts.current && opts.current !== a.key,
        action: () => opts.onPick(a.key),
    }));
    chips.push({ icon: '🌐', label: '全部月齡', ghost: !!opts.current, action: () => opts.onPick(null) });
    return `<div class="age-filter-h">📅 選月齡縮小範圍：</div>${renderQuickReplies(chips)}`;
}

function guessHeadEmoji(qa) {
    const c = (qa.category || '') + (qa.q || '');
    if (/發燒|體溫/.test(c)) return '🌡';
    if (/吐|溢奶/.test(c)) return '🍼';
    if (/疹|皮膚|紅/.test(c)) return '🌸';
    if (/睡/.test(c)) return '😴';
    if (/哭/.test(c)) return '😢';
    if (/便|大便|排便/.test(c)) return '💩';
    if (/牙/.test(c)) return '🦷';
    if (/呼吸|咳嗽|感冒/.test(c)) return '🤧';
    if (/副食|餵食/.test(c)) return '🥣';
    if (/急症|哽|噎|誤食|119/.test(c)) return '🚨';
    return '👶';
}

/* ═════════════════════════════════════════════
   啟動
   ═════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        const res = await fetch('js/qa-data.json');
        if (!res.ok) throw new Error('資料載入失敗');
        App.data = await res.json();
    } catch (err) {
        console.error(err);
        toast('資料載入失敗，請重新整理');
        return;
    }
    bindUI();
    setupVoiceInput();
    showWelcome();
}

function showWelcome() {
    document.getElementById('welcomeOverlay').classList.add('show');
}
function closeWelcome() {
    document.getElementById('welcomeOverlay').classList.remove('show');
}
window.closeWelcome = closeWelcome;

function bindUI() {
    // Home 搜尋
    const homeInput = document.getElementById('homeSearch');
    const homeSend = document.getElementById('homeSendBtn');
    const doHomeSearch = () => {
        const v = homeInput.value.trim();
        if (!v) return;
        homeInput.value = '';
        enterResultWithText(v);
    };
    homeSend.addEventListener('click', doHomeSearch);
    homeInput.addEventListener('keydown', e => { if (e.key === 'Enter') doHomeSearch(); });

    // Light cards
    document.querySelectorAll('.light-card').forEach(card => {
        card.addEventListener('click', () => enterResultByLevel(card.dataset.lv));
    });

    // 熱搜 chip
    document.querySelectorAll('.hot-chip').forEach(b => {
        b.addEventListener('click', () => enterResultWithText(b.dataset.kw));
    });

    // 分類大項 chip
    document.querySelectorAll('.cat-chip').forEach(b => {
        b.addEventListener('click', () => enterResultByCategory(b.dataset.cat));
    });

    // Result 輸入
    const resultInput = document.getElementById('resultInput');
    const resultSend = document.getElementById('resultSendBtn');
    const doResultSend = () => {
        const v = resultInput.value.trim();
        if (!v || App.busy) return;
        resultInput.value = '';
        handleUserText(v);
    };
    resultSend.addEventListener('click', doResultSend);
    resultInput.addEventListener('keydown', e => { if (e.key === 'Enter') doResultSend(); });

    // 5-tab nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const tab = item.dataset.tab;
            // 「使用說明」是 a href 直接跳頁，不攔截
            if (tab === 'guide') return;
            e.preventDefault();
            goTab(tab);
        });
    });
}

/* ═════════════════════════════════════════════
   View 切換
   ═════════════════════════════════════════════ */
function showView(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const map = { home: 'homeScreen', result: 'resultScreen', sos: 'sosScreen' };
    const el = document.getElementById(map[name]);
    if (el) el.classList.add('active');
}

function backToHome() {
    showView('home');
    document.getElementById('chatContainer').innerHTML = '';
    App.ctx = { flow: 'idle', formStep: 0, formData: {} };
    updateNav('home');
}
window.backToHome = backToHome;

function updateNav(tab) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
}

function goTab(tab) {
    if (tab === 'home') return backToHome();
    if (tab === 'checklist') {
        showView('result');
        document.getElementById('chatContainer').innerHTML = '';
        App.ctx = { flow: 'idle', formStep: 0, formData: {} };
        setTimeout(startForm, 200);
        updateNav('checklist');
        return;
    }
    if (tab === 'sop') {
        showView('result');
        document.getElementById('chatContainer').innerHTML = '';
        App.ctx = { flow: 'idle', formStep: 0, formData: {} };
        setTimeout(showSOPListFlow, 200);
        updateNav('sop');
        return;
    }
    if (tab === 'emergency') {
        showEmergencyView();
        updateNav('emergency');
        return;
    }
}

/* ═════════════════════════════════════════════
   進入結果頁的入口
   ═════════════════════════════════════════════ */
function enterResultWithText(text) {
    showView('result');
    updateNav('home');
    setTimeout(() => handleUserText(text), 80);
}

function enterResultByLevel(lv) {
    showView('result');
    updateNav('home');
    document.getElementById('chatContainer').innerHTML = '';
    App.ctx = { flow: 'idle', formStep: 0, formData: {} };
    const lvLabel = { green: '🟢 綠燈・日常普遍', yellow: '🟡 黃燈・突發狀況', red: '🔴 紅燈・嚴重急症' }[lv];
    addUserMsg(lvLabel);
    showLevelQA(lv, null);
}

function enterResultByCategory(cat) {
    showView('result');
    updateNav('home');
    document.getElementById('chatContainer').innerHTML = '';
    App.ctx = { flow: 'idle', formStep: 0, formData: {} };
    addUserMsg(`📂 ${cat}`);
    showCategoryQA(cat, null);
}

function showCategoryQA(cat, ageKey) {
    botThink(() => {
        const all = getAllQA().filter(q => q.category === cat);
        const filtered = ageKey ? all.filter(q => ageMatches(q.age, ageKey)) : all;
        const list = filtered.slice(0, 10);
        const ageLabel = getAgeLabel(ageKey);

        if (list.length === 0) {
            addBotMsg(`「${esc(cat)}${ageLabel ? ' · ' + esc(ageLabel) : ''}」目前沒有對應 QA 😢<br>換月齡看看：`);
            appendBotElement(renderAgeFilterChips({
                current: ageKey,
                onPick: k => { addUserMsg('🎯 縮小到 ' + (k ? getAgeLabel(k) : '全部月齡')); showCategoryQA(cat, k); },
            }));
            return;
        }

        const head = ageKey
            ? `🎯 <strong>${esc(cat)}</strong> · ${esc(ageLabel)} 共 <strong>${filtered.length}</strong> 題，列出前 ${list.length} 題：`
            : `📂 <strong>${esc(cat)}</strong> 共 <strong>${filtered.length}</strong> 題，先列前 ${list.length} 題；可選月齡縮範圍 👇`;
        addBotMsg(head);
        list.forEach(q => {
            const el = appendBotElement(renderQAMini(q));
            if (el) bindMiniClick(el, q);
        });
        appendBotElement(renderAgeFilterChips({
            current: ageKey,
            onPick: k => { addUserMsg('🎯 縮小到 ' + (k ? getAgeLabel(k) : '全部月齡')); showCategoryQA(cat, k); },
        }));
        const kwHtml = renderKeywordChips(list, { title: cat });
        if (kwHtml) appendBotElement(kwHtml);
    });
}

function showLevelQA(lv, ageKey) {
    const lvLabel = { green: '🟢 綠燈・日常普遍', yellow: '🟡 黃燈・突發狀況', red: '🔴 紅燈・嚴重急症' }[lv];
    botThink(() => {
        const allList = (App.data.qa[lv] || []).map(q => ({ ...q, level: lv }));
        const filtered = ageKey ? allList.filter(q => ageMatches(q.age, ageKey)) : allList;
        const list = filtered.slice(0, 8);
        const ageLabel = getAgeLabel(ageKey);

        if (list.length === 0) {
            addBotMsg(`「${esc(lvLabel)} · ${esc(ageLabel)}」沒有對應 QA 😢<br>換一個月齡試試：`);
            appendBotElement(renderAgeFilterChips({
                current: ageKey,
                onPick: k => { addUserMsg('🎯 縮小到 ' + (k ? getAgeLabel(k) : '全部月齡')); showLevelQA(lv, k); },
            }));
            return;
        }

        const head = ageKey
            ? `🎯 <strong>${esc(lvLabel)}</strong> · ${esc(ageLabel)} 共 <strong>${filtered.length}</strong> 題，列出前 ${list.length} 題：`
            : `<strong>${esc(lvLabel)}</strong> 共 <strong>${filtered.length}</strong> 題，先列前 ${list.length} 題；可選月齡縮小範圍 👇`;
        addBotMsg(head);
        list.forEach(q => {
            const el = appendBotElement(renderQAMini(q));
            if (el) bindMiniClick(el, q);
        });
        appendBotElement(renderAgeFilterChips({
            current: ageKey,
            onPick: k => { addUserMsg('🎯 縮小到 ' + (k ? getAgeLabel(k) : '全部月齡')); showLevelQA(lv, k); },
        }));
        const kwHtml = renderKeywordChips(list, { title: lvLabel });
        if (kwHtml) appendBotElement(kwHtml);
    });
}

/* ═════════════════════════════════════════════
   訊息渲染
   ═════════════════════════════════════════════ */
function addUserMsg(text) {
    const html = `
        <div class="msg-avatar user-avatar">👩</div>
        <div class="msg-wrap">
            <div class="msg-bubble">${esc(text)}</div>
            <div class="msg-time">${nowTimeStr()}</div>
        </div>`;
    appendMessage('user', html);
}

function addBotMsg(html) {
    const full = `
        <div class="msg-avatar"><img src="img/xiaohengbao.png" alt="小亨堡"></div>
        <div class="msg-wrap">
            <div class="msg-bubble">${html}</div>
        </div>`;
    return appendMessage('bot', full);
}

function appendBotElement(html) {
    const c = document.getElementById('chatContainer');
    const botMsgs = c.querySelectorAll('.message.bot');
    let wrap = botMsgs.length ? botMsgs[botMsgs.length - 1].querySelector('.msg-wrap') : null;
    if (!wrap) {
        const msg = document.createElement('div');
        msg.className = 'message bot';
        msg.innerHTML = `
            <div class="msg-avatar"><img src="img/xiaohengbao.png" alt="小亨堡"></div>
            <div class="msg-wrap"></div>`;
        c.appendChild(msg);
        wrap = msg.querySelector('.msg-wrap');
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = (html || '').trim();
    let lastEl = null;
    while (tmp.firstChild) {
        lastEl = tmp.firstChild;
        wrap.appendChild(lastEl);
    }
    requestAnimationFrame(scrollChatBottom);
    return lastEl;
}

function renderQuickReplies(items) {
    if (!items || !items.length) return '';
    App.qrGroupId = (App.qrGroupId || 0) + 1;
    const gid = App.qrGroupId;
    const btns = items.map((it, i) => {
        const cls = 'qr-btn' + (it.danger ? ' danger' : '') + (it.ghost ? ' ghost' : '');
        const ic  = it.icon ? `<span class="qr-ic">${it.icon}</span>` : '';
        return `<button class="${cls}" data-gid="${gid}" data-i="${i}">${ic}${esc(it.label)}</button>`;
    }).join('');
    setTimeout(() => bindQRButtons(gid, items), 0);
    return `<div class="quick-replies" data-gid="${gid}">${btns}</div>`;
}

function bindQRButtons(gid, items) {
    document.querySelectorAll(`.quick-replies[data-gid="${gid}"] .qr-btn`).forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('disabled')) return;
            const i = parseInt(btn.dataset.i, 10);
            const item = items[i];
            const group = btn.closest('.quick-replies');
            group.querySelectorAll('.qr-btn').forEach(b => b.classList.add('disabled'));
            btn.classList.remove('disabled');
            if (typeof item.action === 'function') item.action();
        });
    });
}

function appendMessage(cls, innerHTML) {
    const c = document.getElementById('chatContainer');
    const div = document.createElement('div');
    div.className = 'message ' + cls;
    div.innerHTML = innerHTML;
    c.appendChild(div);
    requestAnimationFrame(scrollChatBottom);
    return div;
}

function showTyping() {
    const html = `
        <div class="msg-avatar"><img src="img/xiaohengbao.png" alt="小亨堡"></div>
        <div class="msg-wrap">
            <div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>
        </div>`;
    return appendMessage('bot', html);
}

function botThink(cb, ms = 380) {
    App.busy = true;
    const t = showTyping();
    setTimeout(() => {
        if (t && t.parentNode) t.parentNode.removeChild(t);
        cb();
        App.busy = false;
    }, ms);
}

function scrollChatBottom() {
    const c = document.getElementById('chatContainer');
    if (c) c.scrollTop = c.scrollHeight;
}

/* ═════════════════════════════════════════════
   QA 詳情卡（恢復上版完整四段 + 標籤行 + 動作按鈕）
   ═════════════════════════════════════════════ */
function renderQADetail(qa) {
    const lvL = { green: '🟢 綠燈・日常', yellow: '🟡 黃燈・突發', red: '🔴 紅燈・急症' }[qa.level];
    const headEmoji = guessHeadEmoji(qa);
    return `
        <div class="qa-detail" data-qa-id="${qa.level}:${qa.id}">
            <div class="qa-detail-head lv-${qa.level}">
                <div class="qa-detail-tags-row">
                    <span class="lv-badge"><span class="dot"></span>${lvL}</span>
                    ${qa.category ? `<span class="lv-badge cat">${esc(qa.category)}</span>` : ''}
                    ${qa.age ? `<span class="lv-badge age">適用 ${esc(qa.age)}</span>` : ''}
                </div>
                <h4>${esc(qa.q)} <span class="heading-emoji">${headEmoji}</span></h4>
            </div>
            <div class="qa-section">
                <div class="qa-section-h"><i class="fas fa-circle-info"></i> 是什麼 / 標準簡答</div>
                <div class="qa-section-body">${esc(qa.short)}</div>
            </div>
            ${qa.home ? `
                <div class="qa-section">
                    <div class="qa-section-h"><i class="fas fa-house-medical"></i> 居家做法（步驟）</div>
                    <div class="qa-section-body">${esc(qa.home)}</div>
                </div>` : ''}
            ${qa.redflag ? `
                <div class="qa-section danger">
                    <div class="qa-section-h"><i class="fas fa-triangle-exclamation"></i> 何時要就醫（紅旗）</div>
                    <div class="qa-section-body">${esc(qa.redflag)}</div>
                </div>` : ''}
            ${qa.reply ? `
                <div class="qa-section">
                    <div class="qa-section-h"><i class="fas fa-comment-medical"></i> 管理員建議回覆</div>
                    <div class="qa-section-body">${esc(qa.reply)}</div>
                </div>` : ''}
            <div class="qa-actions">
                ${qa.reply ? `<button class="qa-act primary" data-act="copy-reply"><i class="fas fa-copy"></i> 複製回覆模板</button>` : ''}
                <button class="qa-act ${qa.reply ? 'ghost' : 'primary'}" data-act="copy-full"><i class="fas fa-share-nodes"></i> 複製完整 QA</button>
            </div>
        </div>`;
}

function buildQAShareText(qa) {
    const lvL = { green: '🟢 綠燈・日常', yellow: '🟡 黃燈・突發', red: '🔴 紅燈・急症' }[qa.level];
    const parts = [
        `【${lvL}】${qa.category} · 適用 ${qa.age || '全'}`,
        `Q：${qa.q}`,
        '',
        '▌標準簡答',
        qa.short,
    ];
    if (qa.home) parts.push('', '▌居家做法', qa.home);
    if (qa.redflag) parts.push('', '▌紅旗 / 何時就醫', qa.redflag);
    if (qa.reply) parts.push('', '▌管理員建議回覆', qa.reply);
    parts.push('', '— 來源：小亨堡QA');
    return parts.join('\n');
}

/* QA 簡卡（用於列表）*/
function renderQAMini(q) {
    const lvL = { green: '🟢 綠燈', yellow: '🟡 黃燈', red: '🔴 紅燈' }[q.level];
    return `
        <div class="qa-card-mini ${q.level}" data-level="${q.level}" data-id="${q.id}">
            <div class="qcm-top">
                <span class="qcm-tag lv-${q.level}">${lvL}</span>
                ${q.category ? `<span class="qcm-tag cat">${esc(q.category)}</span>` : ''}
                ${q.age ? `<span class="qcm-tag age">${esc(q.age)}</span>` : ''}
            </div>
            <div class="qcm-q">${esc(q.q)}</div>
            <div class="qcm-short">${esc(q.short)}</div>
            <div class="qcm-cta"><i class="fas fa-arrow-right"></i> 點看完整建議</div>
        </div>`;
}

function bindMiniClick(el, qa) {
    el.addEventListener('click', () => openQA(qa));
}

function openQA(qa) {
    addUserMsg(`想看：${qa.q}`);
    botThink(() => {
        addBotMsg(`完整整理給你 👇`);
        const detailEl = appendBotElement(renderQADetail(qa));
        bindQAActions(detailEl, qa);
        const fbEl = appendBotElement(renderFeedbackBar());
        bindFeedback(fbEl);
        const kwHtml = renderKeywordChips([qa], { title: qa.category });
        if (kwHtml) appendBotElement(kwHtml);
    }, 350);
}

/* ═════════════════════════════════════════════
   關鍵字字卡（💭 還想看相關 QA）
   ═════════════════════════════════════════════ */
function renderKeywordChips(qaList, opts = {}) {
    const list = Array.isArray(qaList) ? qaList : [qaList];
    const seen = new Set();
    const exclude = new Set((opts.exclude || []).map(s => s.toLowerCase()));
    const kws = [];
    list.forEach(qa => {
        (qa.kw || '').split(/[,，、]/).forEach(k => {
            const t = k.trim();
            if (t && t.length >= 2 && !seen.has(t) && !exclude.has(t.toLowerCase())) {
                seen.add(t); kws.push(t);
            }
        });
    });
    // 同分類補充
    const all = getAllQA();
    list.forEach(qa => {
        if (kws.length >= 14) return;
        const sameCat = all.filter(x => x.category === qa.category && x.id !== qa.id).slice(0, 6);
        sameCat.forEach(q => {
            (q.kw || '').split(/[,，、]/).forEach(k => {
                const t = k.trim();
                if (t && t.length >= 2 && !seen.has(t) && !exclude.has(t.toLowerCase()) && kws.length < 14) {
                    seen.add(t); kws.push(t);
                }
            });
        });
    });
    if (!kws.length) return '';

    const gid = ++App.qrGroupId;
    const html = `
        <div class="kw-chips-block" data-gid="${gid}">
            <div class="kw-chips-h">💭 還想看 <strong>${esc(opts.title || '相關')}</strong> 的 QA？點關鍵字繼續：</div>
            <div class="kw-chips">
                ${kws.map((k, i) => `<button class="kw-chip" data-i="${i}"><i class="fas fa-magnifying-glass"></i>${esc(k)}</button>`).join('')}
            </div>
        </div>`;

    setTimeout(() => {
        document.querySelectorAll(`.kw-chips-block[data-gid="${gid}"] .kw-chip`).forEach(btn => {
            btn.addEventListener('click', () => {
                handleUserText(kws[parseInt(btn.dataset.i, 10)]);
            });
        });
    }, 0);
    return html;
}

/* ═════════════════════════════════════════════
   QA actions / Feedback 綁定
   ═════════════════════════════════════════════ */
function bindQAActions(scope, qa) {
    if (!scope) return;
    scope.querySelectorAll('.qa-act').forEach(btn => {
        btn.addEventListener('click', () => {
            const act = btn.dataset.act;
            if (act === 'copy-reply') {
                copyToClipboard(qa.reply || '').then(() => toast('回覆模板已複製'));
            } else if (act === 'copy-full') {
                copyToClipboard(buildQAShareText(qa)).then(() => toast('完整 QA 已複製'));
            }
        });
    });
}

function renderFeedbackBar() {
    return `
        <div class="feedback-bar">
            <div class="label">這個回答有幫助嗎？</div>
            <button class="fb-btn up" data-fb="up" aria-label="有幫助"><i class="far fa-thumbs-up"></i></button>
            <button class="fb-btn dn" data-fb="dn" aria-label="沒幫助"><i class="far fa-thumbs-down"></i></button>
        </div>`;
}

function bindFeedback(scope) {
    if (!scope) return;
    scope.querySelectorAll('.fb-btn').forEach(b => {
        b.addEventListener('click', () => {
            scope.querySelectorAll('.fb-btn').forEach(s => s.classList.remove('active'));
            b.classList.add('active');
            toast(b.dataset.fb === 'up' ? '謝謝你的回饋 ❤️' : '感謝回饋，我們會持續改進');
        });
    });
}

/* ═════════════════════════════════════════════
   處理使用者輸入
   ═════════════════════════════════════════════ */
function handleUserText(text, ageKey) {
    if (App.ctx.flow === 'form') return handleFormAnswer(text);
    if (!ageKey) addUserMsg(text);

    const flag = detectRedFlag(text);
    if (flag) {
        setTimeout(() => showSOSView(flag, text), 300);
        return;
    }

    botThink(() => {
        const matched = matchQAs(text);
        const filtered = ageKey ? matched.filter(q => ageMatches(q.age, ageKey)) : matched;
        const ageLabel = getAgeLabel(ageKey);

        if (filtered.length === 0) {
            addBotMsg(`找不到符合「${esc(text)}」${ageKey ? ` · ${esc(ageLabel)}` : ''} 的 QA 🤔<br>${ageKey ? '換月齡或試其他關鍵字：' : '試試其他關鍵字（發燒、吐奶、紅疹⋯）。'}`);
            appendBotElement(renderAgeFilterChips({
                current: ageKey,
                onPick: k => { addUserMsg('🎯 縮小到 ' + (k ? getAgeLabel(k) : '全部月齡')); handleUserText(text, k); },
            }));
            return;
        }

        const list = filtered.slice(0, 8);
        const headMsg = ageKey
            ? `🎯 「${esc(text)}」 · ${esc(ageLabel)} 找到 <strong>${filtered.length}</strong> 題，列出前 ${list.length} 題；點題目看完整建議 👇`
            : `為「${esc(text)}」找到 <strong>${filtered.length}</strong> 題，先列前 ${list.length} 題；可選月齡縮範圍，點題目看完整建議 👇`;
        addBotMsg(headMsg);
        list.forEach(q => {
            const el = appendBotElement(renderQAMini(q));
            if (el) bindMiniClick(el, q);
        });
        // 月齡縮小
        appendBotElement(renderAgeFilterChips({
            current: ageKey,
            onPick: k => { addUserMsg('🎯 縮小到 ' + (k ? getAgeLabel(k) : '全部月齡')); handleUserText(text, k); },
        }));
        // 字卡列表（💭 還想看相關 QA）
        const kwHtml = renderKeywordChips(filtered.slice(0, 3), { title: text });
        if (kwHtml) appendBotElement(kwHtml);
    }, 500);
}

/* ═════════════════════════════════════════════
   紅旗偵測 + SOS View
   ═════════════════════════════════════════════ */
function detectRedFlag(text) {
    const t = (text || '').toLowerCase().replace(/\s/g, '');
    for (const f of RED_FLAG_PATTERNS) {
        const hit = f.kw.find(k => t.includes(k.toLowerCase().replace(/\s/g, '')));
        if (hit) return { hit, note: f.note };
    }
    return null;
}

function showSOSView(flag, userInput) {
    showView('sos');
    updateNav('home');
    const root = document.getElementById('sosBody');
    const kwHTML = RED_FLAG_DISPLAY.map(kw => `<button class="sos-kw-chip" data-kw="${esc(kw)}">${esc(kw)}</button>`).join('');
    root.innerHTML = `
        <div class="sos-warn">
            <div class="sos-warn-icon"><i class="fas fa-exclamation"></i></div>
            <div class="sos-warn-text">我偵測到你提到「<strong>${esc(flag.hit)}</strong>」<br>是紅燈急症徵兆！</div>
        </div>
        <div class="sos-card">
            <div class="sos-card-mascot"><img src="img/xiaohengbao.png" alt="小亨堡"></div>
            <div class="sos-card-info">
                <h4>紅燈急症徵兆</h4>
                <div class="kw">關鍵字「${esc(flag.hit)}」</div>
                <div class="note">${esc(flag.note)}</div>
            </div>
        </div>
        <a class="sos-call-btn" href="tel:119">
            <i class="fas fa-phone-volume"></i>
            撥打 119
            <span class="sub">立即撥打救護車</span>
        </a>
        <div class="sos-keywords">
            <div class="section-h" style="padding:0;margin-bottom:10px;">
                <h3 style="font-size:0.95rem;">常見紅旗關鍵字</h3>
                <a class="more">查看全部 →</a>
            </div>
            <div class="sos-keywords-grid">${kwHTML}</div>
        </div>
        <div class="sos-steps">
            <h4>建議下一步</h4>
            <div class="sos-steps-list">
                <div class="sos-step"><div class="step-num">1</div>檢查寶寶意識與呼吸</div>
                <div class="sos-step"><div class="step-num">2</div>立刻撥打 119</div>
                <div class="sos-step"><div class="step-num">3</div>依現場狀況執行急救 SOP</div>
            </div>
            <div class="sos-steps-decor">🚑</div>
        </div>
    `;
    root.querySelectorAll('.sos-kw-chip').forEach(b => {
        b.addEventListener('click', () => {
            showView('result');
            handleUserText(b.dataset.kw);
        });
    });
}

function showEmergencyView() {
    showView('sos');
    const root = document.getElementById('sosBody');
    const emHTML = EMERGENCY.map(e => `
        <a class="qa-related-item" href="tel:${e.tel}" style="background:white;margin-bottom:6px;border-radius:12px;border:1px solid var(--border-light);padding:12px 14px;">
            <div class="dot" style="background:${e.urgent ? 'var(--sos)' : 'var(--green)'};"></div>
            <div class="text">
                <strong style="display:block;font-size:0.92rem;">${esc(e.name)}</strong>
                <span style="font-size:0.74rem;color:var(--text-light)">${esc(e.note)}</span>
            </div>
            <div class="arrow"><i class="fas fa-phone"></i> <strong style="font-size:0.85rem;">${esc(e.display || e.tel)}</strong></div>
        </a>
    `).join('');
    const hospHTML = HOSPITALS.map(h => `
        <a class="qa-related-item" href="tel:${h.tel}" style="background:white;margin-bottom:6px;border-radius:12px;border:1px solid var(--border-light);padding:12px 14px;">
            <div class="dot" style="background:var(--green);"></div>
            <div class="text">
                <strong style="display:block;font-size:0.92rem;">${esc(h.name)}</strong>
                <span style="font-size:0.74rem;color:var(--text-light)">${esc(h.note)}</span>
            </div>
            <div class="arrow"><i class="fas fa-phone"></i> <strong style="font-size:0.85rem;">${esc(h.display)}</strong></div>
        </a>
    `).join('');
    root.innerHTML = `
        <a class="sos-call-btn" href="tel:119" style="margin-top:18px;">
            <i class="fas fa-phone-volume"></i>
            撥打 119
            <span class="sub">立即撥打救護車</span>
        </a>
        <div class="sos-keywords">
            <div class="section-h" style="padding:0;margin-bottom:10px;">
                <h3 style="font-size:0.95rem;">緊急通報專線</h3>
            </div>
            <div style="display:flex;flex-direction:column;">${emHTML}</div>
        </div>
        <div class="sos-keywords">
            <div class="section-h" style="padding:0;margin-bottom:10px;">
                <h3 style="font-size:0.95rem;">兒童醫院 急診</h3>
            </div>
            <div style="display:flex;flex-direction:column;">${hospHTML}</div>
        </div>
    `;
}

/* ═════════════════════════════════════════════
   QA 比對引擎
   ═════════════════════════════════════════════ */
function getAllQA() {
    return [
        ...App.data.qa.green.map(q => ({ ...q, level: 'green' })),
        ...App.data.qa.yellow.map(q => ({ ...q, level: 'yellow' })),
        ...App.data.qa.red.map(q => ({ ...q, level: 'red' })),
    ];
}

function matchQAs(userText) {
    const t = (userText || '').toLowerCase();
    if (!t) return [];
    const tFlat = t.replace(/\s/g, '');
    const fragments = extractFragments(t);
    const pool = getAllQA();

    const scored = pool.map(q => {
        let score = 0;
        const qLow = (q.q || '').toLowerCase();
        const sLow = (q.short || '').toLowerCase();
        const cLow = (q.category || '').toLowerCase();
        const kws = (q.kw || '').split(/[,，、]/).map(k => k.trim()).filter(k => k.length >= 2);

        kws.forEach(k => {
            if (tFlat.includes(k.toLowerCase().replace(/\s/g, ''))) score += 10;
        });
        if (qLow.includes(tFlat) && tFlat.length >= 2) score += 5;
        if (sLow.replace(/\s/g, '').includes(tFlat) && tFlat.length >= 2) score += 2;
        if (tFlat.includes(cLow) && cLow.length >= 2) score += 3;
        fragments.forEach(frag => {
            if (qLow.includes(frag)) score += 1.5;
            if (sLow.includes(frag)) score += 0.5;
            kws.forEach(k => { if (k.toLowerCase().includes(frag)) score += 1; });
        });
        return { qa: q, score };
    });

    scored.sort((a, b) => {
        if (Math.abs(b.score - a.score) > 0.5) return b.score - a.score;
        const lvOrder = { red: 0, yellow: 1, green: 2 };
        return lvOrder[a.qa.level] - lvOrder[b.qa.level];
    });
    return scored.filter(s => s.score >= 2).map(s => s.qa);
}

function extractFragments(text) {
    const out = new Set();
    const cleaned = text.replace(/[^一-鿿a-zA-Z0-9]/g, '');
    for (let i = 0; i < cleaned.length - 1; i++) {
        const f2 = cleaned.substr(i, 2);
        if (/[一-鿿]/.test(f2)) out.add(f2);
        if (i < cleaned.length - 2) {
            const f3 = cleaned.substr(i, 3);
            if (/[一-鿿]/.test(f3)) out.add(f3);
        }
    }
    return Array.from(out);
}

/* ═════════════════════════════════════════════
   問診清單流程（求救卡）
   ═════════════════════════════════════════════ */
function startForm() {
    App.ctx.flow = 'form';
    App.ctx.formStep = 0;
    App.ctx.formData = {};
    botThink(() => {
        addBotMsg(`好的～我一題一題幫你準備<strong>求救卡</strong> 📋<br>共 ${FORM_QUESTIONS.length} 題，可點下方選項，<strong>也可以自己輸入喔</strong> ✍️<br>每題打「<strong>略過</strong>」或按略過鈕可跳過。`);
        askFormQuestion();
    });
}

function askFormQuestion() {
    const idx = App.ctx.formStep;
    if (idx >= FORM_QUESTIONS.length) return finishForm();
    const q = FORM_QUESTIONS[idx];
    botThink(() => {
        addBotMsg(`<strong>第 ${idx + 1} 題 / ${FORM_QUESTIONS.length}：</strong>${esc(q.ask)}<br><span style="color:var(--text-muted);font-size:0.78rem">${esc(q.hint)}</span>`);
        const qrs = (q.qr || []).map(v => ({ label: v, action: () => handleFormAnswer(v) }));
        qrs.push({ icon: '⏭', label: '略過', ghost: true, action: () => handleFormAnswer('') });
        appendBotElement(renderQuickReplies(qrs));
    }, 280);
}

function handleFormAnswer(text) {
    if (App.ctx.flow !== 'form') return;
    const idx = App.ctx.formStep;
    const q = FORM_QUESTIONS[idx];
    const v = (text || '').trim();
    addUserMsg(v ? v : '（略過）');
    App.ctx.formData[q.key] = v;
    App.ctx.formStep++;
    askFormQuestion();
}

function finishForm() {
    botThink(() => {
        const text = buildFormText();
        addBotMsg(`搞定 🎉 這是你的<strong>寶寶狀況求救卡</strong>：`);
        const html = `
            <div class="form-summary">
                <div class="form-summary-h">求救卡已產生（建議貼到社群／LINE）</div>
                <div class="form-summary-text">${esc(text)}</div>
                <div class="qa-actions">
                    <button class="qa-act primary" data-act="copy"><i class="fas fa-copy"></i> 複製到剪貼簿</button>
                    <button class="qa-act ghost" data-act="share"><i class="fas fa-share-nodes"></i> 系統分享</button>
                    <a class="qa-act ghost" href="tel:119" style="background:var(--sos);color:white;border-color:transparent;"><i class="fas fa-phone"></i> 撥 119</a>
                </div>
            </div>`;
        const el = appendBotElement(html);
        if (el) {
            el.querySelectorAll('[data-act]').forEach(b => {
                b.addEventListener('click', () => {
                    if (b.dataset.act === 'copy') copyToClipboard(text).then(() => toast('已複製到剪貼簿'));
                    else if (b.dataset.act === 'share') {
                        if (navigator.share) navigator.share({ title: '寶寶狀況求救卡', text }).catch(() => {});
                        else copyToClipboard(text).then(() => toast('已複製，可手動貼到群組'));
                    }
                });
            });
        }
        App.ctx.flow = 'idle';
    });
}

function buildFormText() {
    const labels = {
        age: '寶寶月齡', gender: '性別/體重', symptom: '主要症狀',
        start: '開始時間', temp: '體溫', spirit: '精神/活力',
        feeding: '喝奶/吃飯', action: '已做處置',
    };
    const lines = ['【寶寶狀況求救卡】'];
    FORM_QUESTIONS.forEach(q => {
        const v = App.ctx.formData[q.key];
        if (v) lines.push(`• ${labels[q.key]}：${v}`);
    });
    lines.push('', '— 麻煩社群媽媽 / 管理員協助判斷，謝謝！');
    return lines.join('\n');
}

/* ═════════════════════════════════════════════
   急救 SOP
   ═════════════════════════════════════════════ */
function showSOPListFlow() {
    botThink(() => {
        addBotMsg(`急救情境共 <strong>${App.data.sop.length}</strong> 條，點下面看完整步驟。<br><span style="color:var(--text-muted);font-size:0.78rem">操作中可開擴音撥 119，邊聽指示邊執行。</span>`);
        const list = App.data.sop.map(s => `
            <div class="qa-related-item" data-sop="${s.id}">
                <div class="dot" style="background:var(--sos);"></div>
                <div class="text">${esc(s.title)}</div>
                <div class="arrow"><i class="fas fa-chevron-right"></i></div>
            </div>
        `).join('');
        const wrap = appendBotElement(`<div class="qa-detail"><div class="qa-related" style="border-top:0">${list}</div></div>`);
        if (wrap) {
            wrap.querySelectorAll('[data-sop]').forEach(b => {
                b.addEventListener('click', () => showSOPDetail(parseInt(b.dataset.sop, 10)));
            });
        }
    });
}

function showSOPDetail(id) {
    const s = App.data.sop.find(x => x.id === id);
    if (!s) return;
    addUserMsg(s.title);
    botThink(() => {
        addBotMsg(`「${esc(s.title)}」<strong>逐步操作</strong>：`);
        const html = `
            <div class="qa-detail">
                <div class="qa-detail-head lv-red">
                    <div class="qa-detail-tags-row">
                        <span class="lv-badge"><span class="dot"></span>急救 SOP</span>
                    </div>
                    <h4>${esc(s.title)} <span class="heading-emoji">🚨</span></h4>
                </div>
                <div class="qa-section">
                    <div class="qa-section-body" style="line-height:1.85;">${esc(s.steps)}</div>
                </div>
                <div class="qa-actions">
                    <a class="qa-act primary" href="tel:119" style="background:var(--sos);"><i class="fas fa-phone-volume"></i> 撥 119</a>
                    <button class="qa-act ghost" data-act="other"><i class="fas fa-list"></i> 換另一條</button>
                </div>
            </div>`;
        const el = appendBotElement(html);
        if (el) {
            el.querySelector('[data-act="other"]')?.addEventListener('click', showSOPListFlow);
        }
    }, 380);
}
window.showSOPListFlow = showSOPListFlow;

/* ═════════════════════════════════════════════
   語音輸入（Web Speech API）
   ═════════════════════════════════════════════ */
function setupVoiceInput() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtns = document.querySelectorAll('.mic-btn');

    if (!SpeechRec) {
        micBtns.forEach(b => {
            b.addEventListener('click', () => toast('此瀏覽器不支援語音輸入'));
        });
        return;
    }

    const rec = new SpeechRec();
    rec.lang = 'zh-TW';
    rec.continuous = false;
    rec.interimResults = true;
    App.voiceRec = rec;

    micBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (App.voiceBtn === btn) {
                try { rec.stop(); } catch {}
                return;
            }
            // find related input
            const wrap = btn.closest('.search-input-row, .result-input-bar');
            const input = wrap?.querySelector('input');
            if (!input) return;
            App.voiceTarget = input;
            App.voiceBtn = btn;
            try {
                rec.start();
                btn.classList.add('recording');
                toast('開始聆聽... 請描述狀況');
            } catch (e) {
                toast('語音輸入啟動失敗');
                App.voiceBtn = null;
            }
        });
    });

    rec.onresult = (e) => {
        let text = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
        }
        if (App.voiceTarget) App.voiceTarget.value = text;
    };
    rec.onerror = (e) => {
        if (App.voiceBtn) App.voiceBtn.classList.remove('recording');
        App.voiceBtn = null;
        if (e.error === 'no-speech') toast('沒聽到聲音，請再試一次');
        else if (e.error === 'not-allowed') toast('請允許瀏覽器使用麥克風');
        else toast('語音識別失敗');
    };
    rec.onend = () => {
        if (App.voiceBtn) App.voiceBtn.classList.remove('recording');
        App.voiceBtn = null;
    };
}

/* ═════════════════════════════════════════════
   工具
   ═════════════════════════════════════════════ */
function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function nowTimeStr() {
    const d = new Date();
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const period = h < 12 ? '上午' : '下午';
    const hh = h % 12 || 12;
    return `${period} ${hh}:${m}`;
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); document.body.removeChild(ta); resolve(); }
        catch (e) { document.body.removeChild(ta); reject(e); }
    });
}

let toastTimer = null;
function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}
window.toast = toast;

/* DevTools 快捷：重看 welcome 畫面 */
window.resetWelcome = () => { localStorage.removeItem('xhb.welcomed'); location.reload(); };
console.log('%c🍔 小亨堡QA','color:#5DA67A;font-weight:900;font-size:14px','%c想重看引導畫面？在 console 打 resetWelcome()','color:#6B7A6E');
