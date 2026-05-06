/* ═════════════════════════════════════════════
   小亨堡 · 寶寶照護 QA 諮詢 Bot
   Excel 是判斷基準（關鍵字 / 月齡 / 紅旗），UI 維持聊天介面
   ═════════════════════════════════════════════ */

const App = {
    data: null,
    busy: false,
    qrGroupId: 0,
    ctx: {
        flow: 'idle',     // idle | searching | qa-detail | sop-list | sop-detail | form
        category: null,   // {key, label, cats:[...]}
        age: null,        // <3M | 3-6M | 6-12M | 1-2Y | all
        formStep: 0,
        formData: {},
    },
};

/* ── 主分類（對應 Excel 中的 category 欄位） ── */
const CATEGORY_GROUPS = [
    { key: 'fever',    icon: '🌡️', label: '發燒 / 體溫', cats: ['發燒'] },
    { key: 'feed',     icon: '🍼', label: '餵食 / 吐奶', cats: ['餵食/腸胃', '哺餵'] },
    { key: 'food',     icon: '🌿', label: '副食品 / 營養', cats: ['副食品', '營養'] },
    { key: 'poop',     icon: '💩', label: '排便 / 腸胃', cats: ['排便', '腸胃'] },
    { key: 'sleep',    icon: '😴', label: '睡眠 / 哭鬧', cats: ['睡眠', '哭鬧/情緒', '睡眠/情緒/發展'] },
    { key: 'breath',   icon: '🤧', label: '呼吸 / 感冒', cats: ['呼吸道', '感染'] },
    { key: 'skin',     icon: '🩹', label: '皮膚 / 紅疹', cats: ['皮膚'] },
    { key: 'develop',  icon: '👶', label: '生長 / 發展', cats: ['發展', '生理', '口腔', '生活', '醫療', '媽媽', '眼'] },
    { key: 'accident', icon: '⚠️', label: '意外事件', cats: ['意外', '急症判斷'] },
];

/* ── 月齡選項 ── */
const AGE_OPTIONS = [
    { key: '<3M',   label: '< 3M（新生兒）' },
    { key: '3-6M',  label: '3 – 6M' },
    { key: '6-12M', label: '6 – 12M' },
    { key: '1-2Y',  label: '1 – 2Y' },
    { key: 'all',   label: '不分月齡' },
];

/* ── 紅旗關鍵字（觸發即時 SOS 警告） ── */
const RED_FLAG_PATTERNS = [
    { kw: ['嘴唇紫', '嘴唇發紫', '發紺', '臉色發白', '臉色蒼白'], note: '可能缺氧或循環異常', sop: 3 },
    { kw: ['不哭', '叫不醒', '不出聲', '昏迷', '昏厥', '失去意識', '無反應'], note: '意識改變或可能哽塞', sop: 1 },
    { kw: ['抽搐', '癲癇', '熱痙攣', '抽筋'], note: '抽搐處理 SOP', sop: 5 },
    { kw: ['噎到', '哽塞', '異物吞', '異物嗆', '吞下', '吃進'], note: '哽塞救命法', sop: 1 },
    { kw: ['誤食', '吃下藥', '吃了藥', '吞了電池', '吞磁鐵', '吞錢幣'], note: '毒物 / 異物吞入', sop: 7 },
    { kw: ['吐血', '便血', '血便', '吐黃綠', '吐膽汁'], note: '消化道出血或腸阻塞', sop: 9 },
    { kw: ['呼吸困難', '凹胸', '喘鳴', '無呼吸', '呼吸急促', '胸口凹'], note: '呼吸窘迫', sop: 3 },
    { kw: ['8小時沒尿', '8h沒尿', '一天沒尿', '24小時沒尿', '整天沒尿', '尿很少'], note: '嚴重脫水', sop: 11 },
    { kw: ['燙傷', '熱水燙', '湯燙', '油濺'], note: '燙傷處理', sop: 4 },
    { kw: ['撞到頭', '頭撞', '頭部撞到', '頭部摔', '從床上摔', '從沙發摔'], note: '頭部外傷觀察', sop: 6 },
    { kw: ['溺水', '掉到水', '泡水太久'], note: '溺水急救', sop: 13 },
    { kw: ['過敏腫', '嘴腫', '臉腫', '喘鳴', '蕁麻疹全身'], note: '嚴重過敏 / 過敏性休克', sop: 8 },
];

/* ── 緊急通報 / 兒童急診 ── */
const EMERGENCY = [
    { name: '119 救護車',    tel: '119',        note: '生命緊急狀況、需要緊急醫療運送', urgent: true },
    { name: '110 警察',      tel: '110',        note: '意外事故、家庭暴力、人身安全' },
    { name: '113 保護專線',  tel: '113',        note: '兒少 / 家暴 / 性侵保護通報' },
    { name: '毒物諮詢 24h', tel: '0228717121', display: '02-2871-7121', note: '誤食藥物 / 清潔劑 / 植物 / 蛇蟲咬傷諮詢' },
];
const HOSPITALS = [
    { name: '台大兒童醫院 急診',     tel: '0223123456', display: '02-2312-3456', note: '台北市中正區' },
    { name: '林口長庚兒童醫院 急診', tel: '033281200',  display: '03-328-1200',  note: '桃園市龜山區' },
    { name: '馬偕兒童醫院 急診',     tel: '0225433535', display: '02-2543-3535', note: '台北市中山區' },
    { name: '台中榮總兒童醫學部',    tel: '0423592525', display: '04-2359-2525', note: '台中市西屯區' },
    { name: '高雄長庚兒童醫院 急診', tel: '077317123',  display: '07-731-7123',  note: '高雄市鳥松區' },
];

/* ── 問診清單（簡化 8 題版） ── */
const FORM_QUESTIONS = [
    { key: 'age',        ask: '寶寶現在幾個月？',                     hint: '例：8M、1Y3M（早產者註明矯正月齡）',  qr: ['<3M', '3M', '6M', '9M', '1Y', '1Y6M', '2Y'] },
    { key: 'gender',     ask: '性別＋體重？',                         hint: '例：女, 7.5kg',                     qr: ['男, 略過', '女, 略過'] },
    { key: 'symptom',    ask: '主要症狀是什麼？',                     hint: '可寫多個，例：發燒+咳嗽',              qr: ['發燒', '吐奶', '腹瀉', '紅疹', '咳嗽', '便祕'] },
    { key: 'start',      ask: '從什麼時候開始的？',                   hint: '例：今天早上、昨晚 8 點',              qr: ['1 小時內', '今天', '昨天', '2-3 天'] },
    { key: 'temp',       ask: '體溫多少？（沒發燒打「無」）',         hint: '例：38.5、無',                      qr: ['無', '37.5–38', '38–39', '39–40', '>40'] },
    { key: 'spirit',     ask: '精神 / 活力如何？',                    hint: '會玩會笑＝好；嗜睡無力＝差',          qr: ['很好', '尚可', '較差', '嗜睡叫不醒'] },
    { key: 'feeding',    ask: '喝奶 / 吃飯狀況？',                    hint: '比平常多/差不多/少多少%',             qr: ['正常', '少 30%', '少 50%', '幾乎不喝'] },
    { key: 'action',     ask: '已經做了什麼處置？',                   hint: '例：餵退燒藥、補水、看過診所',         qr: ['尚未處置', '已退燒', '已補水', '看過診所'] },
];

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
        alert('資料載入失敗，請重新整理頁面');
        return;
    }
    bindUI();
    showWelcome();
}

function bindUI() {
    document.getElementById('userInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') sendUserInput();
    });
    document.getElementById('sendBtn').addEventListener('click', sendUserInput);
    document.getElementById('sosOverlay').addEventListener('click', e => {
        if (e.target === document.getElementById('sosOverlay')) closeSOS();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeSOS();
    });
}

function sendUserInput() {
    const input = document.getElementById('userInput');
    const text = (input.value || '').trim();
    if (!text || App.busy) return;
    input.value = '';
    handleUserText(text);
}

/* ═════════════════════════════════════════════
   訊息渲染
   ═════════════════════════════════════════════ */
function addUserMsg(text) {
    const html = `
        <div class="msg-avatar user-avatar">👩</div>
        <div class="msg-wrap">
            <div class="msg-sender">媽咪</div>
            <div class="msg-bubble">${esc(text)}</div>
        </div>`;
    appendMessage('user', html);
}

function addBotMsg(html, opts = {}) {
    const wide = opts.wide ? ' wide' : '';
    const senderName = opts.sender || '小亨堡';
    const bubbleHTML = opts.noBubble
        ? html
        : `<div class="msg-bubble">${html}</div>`;
    const fullHTML = `
        <div class="msg-avatar bot-avatar"><img src="img/xiaohengbao.png" alt="小亨堡"></div>
        <div class="msg-wrap">
            <div class="msg-sender">${esc(senderName)}</div>
            ${bubbleHTML}
            ${opts.extra || ''}
        </div>`;
    return appendMessage('bot' + wide, fullHTML);
}

function appendMessage(cls, innerHTML) {
    const container = document.getElementById('chatContainer');
    const div = document.createElement('div');
    div.className = 'message ' + cls;
    div.innerHTML = innerHTML;
    container.appendChild(div);
    requestAnimationFrame(scrollChatToBottom);
    return div;
}

function showTyping() {
    const html = `
        <div class="msg-avatar bot-avatar"><img src="img/xiaohengbao.png" alt="小亨堡"></div>
        <div class="msg-wrap">
            <div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>
        </div>`;
    return appendMessage('bot', html);
}

function removeNode(node) { if (node && node.parentNode) node.parentNode.removeChild(node); }

function scrollChatToBottom() {
    const c = document.getElementById('chatContainer');
    c.scrollTop = c.scrollHeight;
}

/* 模擬 bot 思考一下，再發訊息 */
function botThink(callback, ms = 420) {
    App.busy = true;
    const typing = showTyping();
    setTimeout(() => {
        removeNode(typing);
        callback();
        App.busy = false;
    }, ms);
}

/* ═════════════════════════════════════════════
   Quick Replies / Keyword Chips
   ═════════════════════════════════════════════ */
function renderQuickReplies(items) {
    if (!items || !items.length) return '';
    const gid = ++App.qrGroupId;
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
            // 標記整組為 disabled，記錄選中
            const group = btn.closest('.quick-replies');
            group.querySelectorAll('.qr-btn').forEach(b => b.classList.add('disabled'));
            btn.classList.remove('disabled');
            btn.style.opacity = '1';
            // 執行
            if (typeof item.action === 'function') item.action();
        });
    });
}

function renderKeywordChips(qaOrList, opts = {}) {
    const list = Array.isArray(qaOrList) ? qaOrList : [qaOrList];
    const seen = new Set();
    const exclude = new Set((opts.exclude || []).map(s => s.toLowerCase()));
    const kws = [];
    // 從目前 QA 收 keywords
    list.forEach(qa => {
        (qa.kw || '').split(/[,，、]/).forEach(k => {
            const t = k.trim();
            if (t && t.length >= 2 && !seen.has(t) && !exclude.has(t.toLowerCase())) {
                seen.add(t); kws.push(t);
            }
        });
    });
    // 同分類補一些
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
            <div class="kw-chips-h">💭 還想看 <strong>${esc(opts.title || '其他相關')}</strong> 的 QA？點關鍵字繼續：</div>
            <div class="kw-chips">
                ${kws.map((k, i) => `<button class="kw-chip" data-gid="${gid}" data-i="${i}"><i class="fas fa-magnifying-glass"></i>${esc(k)}</button>`).join('')}
            </div>
        </div>`;
    setTimeout(() => {
        document.querySelectorAll(`.kw-chips-block[data-gid="${gid}"] .kw-chip`).forEach(btn => {
            btn.addEventListener('click', () => {
                const kw = kws[parseInt(btn.dataset.i, 10)];
                handleUserText(kw);
            });
        });
    }, 0);
    return html;
}

/* ═════════════════════════════════════════════
   開場 / 主選單
   ═════════════════════════════════════════════ */
function showWelcome() {
    const text = `嗨媽咪～我是 <strong>小亨堡</strong> 🍔💕<br>
帶寶寶的每一天都不容易，遇到突發狀況時的那種焦慮，我都懂 🤍<br>
別擔心，深呼吸一下，我會陪你一起釐清現在的情況、找出最合適的處理方向。<br><br>
你可以 <strong>直接描述寶寶現在的狀況</strong>（例：發燒 38.5、吐奶、紅疹一片片的），<br>
或從下方分類找答案。我會幫你看看屬於哪種情境——「<em>居家觀察就好</em>」、「<em>建議安排看診</em>」，或是「<em>需立即急診處置</em>」 🚦<br><br>
<em>⚠️ 溫馨提醒：本服務僅為居家照護之參考建議，不構成醫療診斷或處方；專業診療請洽兒科醫師，緊急狀況請立即就醫或撥打 119。</em><br><br>
準備好了嗎？我們從下方開始 👇`;
    addBotMsg(text, {
        extra: renderMainMenu(),
        wide: true,
    });
}

function renderMainMenu() {
    const cats = CATEGORY_GROUPS.map(g => ({
        icon: g.icon,
        label: g.label,
        action: () => handleCategorySelect(g.key),
    }));
    const tools = [
        { icon: '🆘', label: '急救 SOP', danger: true, action: showSOPListFlow },
        { icon: '📋', label: '填問診清單', action: startForm },
        { icon: '🏥', label: '緊急電話', danger: true, action: showSOS },
    ];
    return renderQuickReplies([...cats, ...tools]);
}

function showRootMenu() {
    App.ctx.flow = 'idle';
    App.ctx.category = null;
    App.ctx.age = null;
    addBotMsg(`回到主選單囉！再選一次想知道什麼 👇`, { extra: renderMainMenu(), wide: true });
}

/* ═════════════════════════════════════════════
   分類 / 月齡 流程
   ═════════════════════════════════════════════ */
function handleCategorySelect(key) {
    const grp = CATEGORY_GROUPS.find(g => g.key === key);
    if (!grp) return;
    addUserMsg(`${grp.icon} ${grp.label}`);
    App.ctx.category = grp;
    App.ctx.age = null;
    App.ctx.flow = 'searching';

    const total = countQAByCats(grp.cats);
    botThink(() => {
        addBotMsg(`好的～「<strong>${esc(grp.label)}</strong>」相關有 ${total} 題 📚<br>寶寶幾個月呢？我幫你縮小範圍：`, {
            extra: renderQuickReplies([
                ...AGE_OPTIONS.map(a => ({
                    label: a.label,
                    action: () => handleAgeSelect(a.key),
                })),
                { icon: '↩', label: '回主選單', ghost: true, action: () => { addUserMsg('回主選單'); showRootMenu(); } },
            ]),
            wide: true,
        });
    });
}

function handleAgeSelect(ageKey) {
    const ageOpt = AGE_OPTIONS.find(a => a.key === ageKey);
    addUserMsg(ageOpt ? ageOpt.label : ageKey);
    App.ctx.age = ageKey;

    const list = filterByCategoryAndAge(App.ctx.category.cats, ageKey).slice(0, 8);
    botThink(() => {
        if (list.length === 0) {
            addBotMsg(`這個月齡＋主題目前沒有對應 QA 😢<br>可以打字描述具體症狀，或換月齡：`, {
                extra: renderQuickReplies(AGE_OPTIONS.map(a => ({ label: a.label, action: () => handleAgeSelect(a.key) }))),
            });
            return;
        }
        const cards = list.map(q => renderQAMini(q)).join('');
        addBotMsg(`找到 <strong>${list.length}</strong> 題符合「${esc(App.ctx.category.label)} · ${esc(ageOpt.label)}」📋<br>點題目看完整建議：`, {
            extra: cards
                + renderQuickReplies([
                    { icon: '🔍', label: '直接輸入找其他', action: () => focusInput() },
                    { icon: '🔄', label: '換月齡', ghost: true, action: () => askAgeAgain() },
                    { icon: '↩', label: '主選單', ghost: true, action: () => { addUserMsg('回主選單'); showRootMenu(); } },
                ])
                + renderKeywordChips(list, { title: App.ctx.category.label }),
            wide: true,
        });
        attachQAMiniHandlers();
    });
}

function askAgeAgain() {
    addUserMsg('換月齡');
    App.ctx.age = null;
    addBotMsg(`好的，再選一次月齡：`, {
        extra: renderQuickReplies(AGE_OPTIONS.map(a => ({ label: a.label, action: () => handleAgeSelect(a.key) }))),
    });
}

function focusInput() {
    const inp = document.getElementById('userInput');
    inp.focus();
    addBotMsg(`好的～請在下方直接打字 👇 我會用<strong>關鍵字</strong>幫你找最相關的 QA。`);
}

/* ═════════════════════════════════════════════
   使用者輸入文字 → 比對 QA
   ═════════════════════════════════════════════ */
function handleUserText(text) {
    addUserMsg(text);
    if (App.ctx.flow === 'form') return handleFormAnswer(text);

    // 紅旗偵測
    const flag = detectRedFlag(text);
    if (flag) {
        botThink(() => {
            renderRedFlagWarning(flag, text);
            // 同時也找對應的紅燈/黃燈 QA
            const qas = matchQAs(text, { onlyLevels: ['red', 'yellow'] }).slice(0, 3);
            if (qas.length) {
                addBotMsg(`📚 我也整理了相關 QA 給你參考：`, {
                    extra: qas.map(q => renderQAMini(q)).join('') + renderKeywordChips(qas, { title: '相關急症' }),
                    wide: true,
                });
                attachQAMiniHandlers();
            }
        });
        return;
    }

    // 一般查詢
    const filterCats = App.ctx.category ? App.ctx.category.cats : null;
    const matched = matchQAs(text, { categories: filterCats });

    botThink(() => {
        if (matched.length === 0) {
            // 試一次不限分類
            const fallback = filterCats ? matchQAs(text, {}) : [];
            if (fallback.length) {
                addBotMsg(`目前分類「${esc(App.ctx.category.label)}」找不到，<br>但我在<strong>其他主題</strong>找到 ${fallback.length} 題相關：`, {
                    extra: fallback.slice(0, 5).map(q => renderQAMini(q)).join('')
                        + renderQuickReplies([{ icon: '↩', label: '回主選單', ghost: true, action: () => { addUserMsg('回主選單'); showRootMenu(); } }])
                        + renderKeywordChips(fallback.slice(0, 5)),
                    wide: true,
                });
                attachQAMiniHandlers();
                return;
            }
            addBotMsg(`找不到符合「${esc(text)}」的 QA 🤔<br>試試：<br>• 用更短的關鍵字（發燒、吐奶、紅疹...）<br>• 或從分類找：`, {
                extra: renderMainMenu(),
                wide: true,
            });
            return;
        }
        const top = matched.slice(0, 5);
        addBotMsg(`我幫你找到 <strong>${matched.length}</strong> 題相關，列出最符合的 ${top.length} 題 ✨<br>點題目看完整建議：`, {
            extra: top.map(q => renderQAMini(q)).join('') + renderKeywordChips(top, { title: text }),
            wide: true,
        });
        attachQAMiniHandlers();
    });
}

/* ═════════════════════════════════════════════
   QA 卡片：簡版 / 詳細
   ═════════════════════════════════════════════ */
function renderQAMini(q) {
    const lvL = { green: '🟢 綠燈', yellow: '🟡 黃燈', red: '🔴 紅燈' }[q.level];
    return `
        <div class="qa-card-mini ${q.level}" data-level="${q.level}" data-id="${q.id}">
            <div class="qcm-top">
                <span class="qcm-tag lv-${q.level}">${lvL}</span>
                <span class="qcm-tag cat">${esc(q.category)}</span>
                <span class="qcm-tag age">${esc(q.age || '全')}</span>
            </div>
            <div class="qcm-q">${esc(q.q)}</div>
            <div class="qcm-short">${esc(q.short)}</div>
            <div class="qcm-cta"><i class="fas fa-arrow-right"></i> 點看完整建議</div>
        </div>`;
}

function attachQAMiniHandlers() {
    document.querySelectorAll('.qa-card-mini:not(.bound)').forEach(card => {
        card.classList.add('bound');
        card.addEventListener('click', () => {
            const lv = card.dataset.level;
            const id = parseInt(card.dataset.id, 10);
            openQA(lv, id);
        });
    });
}

function openQA(level, id) {
    const q = App.data.qa[level].find(x => x.id === id);
    if (!q) return;
    addUserMsg(`想看：${q.q}`);
    botThink(() => {
        addBotMsg(`沒問題～我把這題完整整理給你 👇`, {
            extra: renderQADetail(q) + renderKeywordChips(q, { title: q.category }),
            wide: true,
        });
        bindQADetailActions(q);
    }, 350);
}

function renderQADetail(q) {
    const lvL = { green: '🟢 綠燈 · 日常', yellow: '🟡 黃燈 · 突發', red: '🔴 紅燈 · 急症' }[q.level];
    return `
        <div class="qa-detail" data-qa-id="${q.level}:${q.id}">
            <div class="qa-detail-head lv-${q.level}">
                <div class="qa-detail-tags">
                    <span class="qcm-tag lv-${q.level}">${lvL}</span>
                    <span class="qcm-tag cat">${esc(q.category)}</span>
                    <span class="qcm-tag age">適用 ${esc(q.age || '全')}</span>
                </div>
                <div class="qa-detail-q">${esc(q.q)}</div>
            </div>
            <div class="qa-section">
                <div class="qa-section-h"><i class="fas fa-circle-info"></i> 是什麼 / 標準簡答</div>
                <div class="qa-section-body">${esc(q.short)}</div>
            </div>
            <div class="qa-section">
                <div class="qa-section-h"><i class="fas fa-house-medical"></i> 居家做法（步驟）</div>
                <div class="qa-section-body">${esc(q.home)}</div>
            </div>
            <div class="qa-section danger">
                <div class="qa-section-h"><i class="fas fa-triangle-exclamation"></i> 何時要就醫（紅旗）</div>
                <div class="qa-section-body">${esc(q.redflag)}</div>
            </div>
            ${q.reply ? `
                <div class="qa-section">
                    <div class="qa-section-h"><i class="fas fa-comment-medical"></i> 管理員建議回覆</div>
                    <div class="qa-section-body">${esc(q.reply)}</div>
                </div>` : ''}
            <div class="qa-actions">
                ${q.reply ? `<button class="qa-act primary" data-act="copy-reply"><i class="fas fa-copy"></i> 複製回覆給社群</button>` : ''}
                <button class="qa-act ${q.reply ? 'ghost' : 'primary'}" data-act="copy-full"><i class="fas fa-share-nodes"></i> 複製完整 QA</button>
                <button class="qa-act ghost" data-act="form"><i class="fas fa-clipboard-list"></i> 填問診清單</button>
            </div>
        </div>`;
}

function bindQADetailActions(q) {
    document.querySelectorAll(`.qa-detail[data-qa-id="${q.level}:${q.id}"] .qa-act:not(.bound)`).forEach(btn => {
        btn.classList.add('bound');
        btn.addEventListener('click', () => {
            const act = btn.dataset.act;
            if (act === 'copy-reply') copyToClipboard(q.reply || '').then(() => toast('回覆模板已複製'));
            else if (act === 'copy-full') copyToClipboard(buildQAShareText(q)).then(() => toast('完整 QA 已複製'));
            else if (act === 'form') {
                addUserMsg('我要填問診清單');
                startForm();
            }
        });
    });
}

function buildQAShareText(q) {
    const lvL = { green: '🟢 綠燈 · 日常', yellow: '🟡 黃燈 · 突發', red: '🔴 紅燈 · 急症' }[q.level];
    const parts = [
        `【${lvL}】${q.category} · 適用 ${q.age || '全'}`,
        `Q：${q.q}`,
        '',
        '▌標準簡答',
        q.short,
        '',
        '▌居家做法',
        q.home,
        '',
        '▌紅旗 / 何時就醫',
        q.redflag,
    ];
    if (q.reply) parts.push('', '▌管理員建議回覆', q.reply);
    parts.push('', '— 來源：小亨堡 寶寶照護 QA v2');
    return parts.join('\n');
}

/* ═════════════════════════════════════════════
   紅旗 SOS 警告
   ═════════════════════════════════════════════ */
function detectRedFlag(text) {
    const t = (text || '').toLowerCase().replace(/\s/g, '');
    for (const f of RED_FLAG_PATTERNS) {
        const hit = f.kw.find(k => t.includes(k.toLowerCase().replace(/\s/g, '')));
        if (hit) return { hit, note: f.note, sop: f.sop };
    }
    return null;
}

function renderRedFlagWarning(flag, userText) {
    const html = `
        <div class="sos-warning">
            <div class="sos-warning-head">
                <div class="sos-warning-icon"><i class="fas fa-triangle-exclamation"></i></div>
                <div>
                    <h4>⚠️ 偵測到紅燈急症徵兆</h4>
                    <p>關鍵字：「${esc(flag.hit)}」 · ${esc(flag.note)}</p>
                </div>
            </div>
            <div class="sos-warning-body">
                <strong>不要在社群等待回覆，請立即：</strong><br>
                ① 確認寶寶呼吸與意識<br>
                ② 撥打 119 並開擴音（救護員會邊指導邊評估）<br>
                ③ 如已有急救 SOP 適用情境，立即操作
            </div>
            <div class="sos-warning-actions">
                <a class="sos-warn-btn call" href="tel:119"><i class="fas fa-phone-volume"></i> 撥 119</a>
                <button class="sos-warn-btn ghost" data-act="sop"><i class="fas fa-kit-medical"></i> 看急救 SOP</button>
                <button class="sos-warn-btn ghost" data-act="hosp"><i class="fas fa-hospital"></i> 兒童急診</button>
            </div>
        </div>`;
    addBotMsg(`⚠️ 我偵測到你提到的「<strong>${esc(flag.hit)}</strong>」是<strong>紅燈急症徵兆</strong>！`, {
        extra: html,
        wide: true,
    });
    // 綁按鈕
    setTimeout(() => {
        document.querySelectorAll('.sos-warning .sos-warn-btn[data-act]:not(.bound)').forEach(b => {
            b.classList.add('bound');
            b.addEventListener('click', () => {
                if (b.dataset.act === 'sop') {
                    if (flag.sop) showSOPDetail(flag.sop, true);
                    else showSOPListFlow();
                } else if (b.dataset.act === 'hosp') {
                    showSOS();
                }
            });
        });
    }, 0);
}

/* ═════════════════════════════════════════════
   SOP 急救
   ═════════════════════════════════════════════ */
function showSOPListFlow() {
    addUserMsg('🆘 急救 SOP');
    botThink(() => {
        const items = App.data.sop.map(s => ({
            icon: '🆘',
            label: s.title.replace(/^[🆘🍼👶💗🌡🔥🤝]+\s*/, '').slice(0, 16),
            action: () => showSOPDetail(s.id),
            danger: true,
        }));
        addBotMsg(`急救情境共 <strong>${App.data.sop.length}</strong> 條，你想看哪一條？<br><em>提醒：操作中可開擴音撥 119，邊聽指示邊執行。</em>`, {
            extra: renderQuickReplies([
                ...items,
                { icon: '↩', label: '回主選單', ghost: true, action: () => { addUserMsg('回主選單'); showRootMenu(); } },
            ]),
            wide: true,
        });
    });
}

function showSOPDetail(id, fromRedFlag = false) {
    const s = App.data.sop.find(x => x.id === id);
    if (!s) return;
    if (!fromRedFlag) addUserMsg(s.title);
    botThink(() => {
        const html = `
            <div class="sop-card">
                <div class="sop-head">
                    <div class="sop-num-icon">${s.id}</div>
                    <div class="sop-title-text">${esc(s.title)}</div>
                </div>
                <div class="sop-steps-text">${esc(s.steps)}</div>
                <div class="sop-actions">
                    <a class="qa-act primary" href="tel:119"><i class="fas fa-phone-volume"></i> 撥 119</a>
                    <button class="qa-act ghost" data-sop-act="copy"><i class="fas fa-copy"></i> 複製步驟</button>
                    <button class="qa-act ghost" data-sop-act="other"><i class="fas fa-list"></i> 換另一條</button>
                </div>
            </div>`;
        addBotMsg(`這是「${esc(s.title)}」的完整步驟，<strong>逐步操作</strong>：`, {
            extra: html + renderQuickReplies([
                { icon: '↩', label: '回主選單', ghost: true, action: () => { addUserMsg('回主選單'); showRootMenu(); } },
            ]),
            wide: true,
        });
        setTimeout(() => {
            document.querySelectorAll('.sop-card [data-sop-act]:not(.bound)').forEach(b => {
                b.classList.add('bound');
                b.addEventListener('click', () => {
                    if (b.dataset.sopAct === 'copy') copyToClipboard(`${s.title}\n\n${s.steps}`).then(() => toast('SOP 步驟已複製'));
                    else if (b.dataset.sopAct === 'other') showSOPListFlow();
                });
            });
        }, 0);
    }, 380);
}

/* ═════════════════════════════════════════════
   問診清單表單模式
   ═════════════════════════════════════════════ */
function startForm() {
    App.ctx.flow = 'form';
    App.ctx.formStep = 0;
    App.ctx.formData = {};
    botThink(() => {
        addBotMsg(`好的～我一題一題幫你準備<strong>求救卡</strong> 📋<br>共 ${FORM_QUESTIONS.length} 題，可直接打字或點下面選項。<br>每題打「<strong>略過</strong>」可跳過。`);
        askFormQuestion();
    });
}

function askFormQuestion() {
    const idx = App.ctx.formStep;
    if (idx >= FORM_QUESTIONS.length) return finishForm();
    const q = FORM_QUESTIONS[idx];
    botThink(() => {
        const qrs = (q.qr || []).map(v => ({ label: v, action: () => handleFormAnswer(v === '略過' ? '' : v) }));
        qrs.push({ icon: '⏭', label: '略過', ghost: true, action: () => handleFormAnswer('') });
        addBotMsg(`<strong>第 ${idx + 1} 題 / ${FORM_QUESTIONS.length}：</strong>${esc(q.ask)}<br><em>${esc(q.hint)}</em>`, {
            extra: renderQuickReplies(qrs),
        });
    }, 280);
}

function handleFormAnswer(text) {
    if (App.ctx.flow !== 'form') return;
    const idx = App.ctx.formStep;
    const q = FORM_QUESTIONS[idx];
    const v = (text || '').trim();
    if (v) addUserMsg(v); else addUserMsg('（略過）');
    App.ctx.formData[q.key] = v;
    App.ctx.formStep++;
    askFormQuestion();
}

function finishForm() {
    botThink(() => {
        const text = buildFormText();
        const html = `
            <div class="form-summary">
                <div class="form-summary-h"><i class="fas fa-circle-check"></i> 求救卡已產生（建議貼到社群／LINE）</div>
                <div class="form-summary-text" id="formSummaryText">${esc(text)}</div>
            </div>`;
        addBotMsg(`搞定 🎉 這是你的<strong>寶寶狀況求救卡</strong>：`, {
            extra: html + renderQuickReplies([
                { icon: '📋', label: '複製到剪貼簿', action: () => copyToClipboard(text).then(() => toast('已複製到剪貼簿')) },
                { icon: '📤', label: '系統分享', action: () => doShare(text) },
                { icon: '🆘', label: '撥 119', danger: true, action: () => location.href = 'tel:119' },
                { icon: '↩', label: '回主選單', ghost: true, action: () => { addUserMsg('回主選單'); showRootMenu(); } },
            ]),
            wide: true,
        });
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

function doShare(text) {
    if (navigator.share) navigator.share({ title: '寶寶狀況求救卡', text }).catch(() => {});
    else copyToClipboard(text).then(() => toast('已複製，可手動貼到群組'));
}

/* ═════════════════════════════════════════════
   SOS 緊急電話 Overlay
   ═════════════════════════════════════════════ */
function showSOS() {
    const root = document.getElementById('sosContent');
    root.innerHTML = `
        <div class="sos-section-label">🆘 緊急通報專線</div>
        ${EMERGENCY.map(e => `
            <a class="tel-card ${e.urgent ? 'urgent' : ''}" href="tel:${e.tel}">
                <div class="tel-info">
                    <h4>${esc(e.name)}</h4>
                    <p>${esc(e.note)}</p>
                </div>
                <div class="tel-call">
                    <i class="fas fa-phone-volume"></i>
                    <span>${esc(e.display || e.tel)}</span>
                </div>
            </a>`).join('')}
        <div class="sos-section-label" style="margin-top:6px;">🏥 五大兒童醫院急診</div>
        ${HOSPITALS.map(h => `
            <a class="tel-card" href="tel:${h.tel}">
                <div class="tel-info">
                    <h4>${esc(h.name)}</h4>
                    <p>${esc(h.note)}</p>
                </div>
                <div class="tel-call">
                    <i class="fas fa-phone-volume"></i>
                    <span>${esc(h.display)}</span>
                </div>
            </a>`).join('')}`;
    document.getElementById('sosOverlay').classList.add('open');
}
function closeSOS() { document.getElementById('sosOverlay').classList.remove('open'); }
window.showSOS = showSOS; window.closeSOS = closeSOS;

/* ═════════════════════════════════════════════
   重置對話
   ═════════════════════════════════════════════ */
function resetChat() {
    if (App.busy) return;
    App.ctx = { flow: 'idle', category: null, age: null, formStep: 0, formData: {} };
    document.getElementById('chatContainer').innerHTML = '';
    showWelcome();
    toast('對話已重置');
}
window.resetChat = resetChat;

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

function countQAByCats(cats) {
    return getAllQA().filter(q => cats.includes(q.category)).length;
}

function filterByCategoryAndAge(cats, ageKey) {
    const all = getAllQA().filter(q => cats.includes(q.category));
    if (ageKey === 'all' || !ageKey) return all;
    // age 字串相當多樣，做寬鬆比對
    return all.filter(q => ageMatches(q.age, ageKey));
}

function ageMatches(qaAge, key) {
    if (!qaAge) return true;
    const a = qaAge.replace(/\s/g, '');
    if (a.includes('全')) return true;
    if (key === '<3M')   return /<3M|0-3M|0-6M|0-2M|1M\+|新生兒/i.test(a);
    if (key === '3-6M')  return /3-6M|0-6M|3-4M|4M\+|3M\+|6M\+/i.test(a);
    if (key === '6-12M') return /6-12M|6-8M|6M\+|7-9M|8-12M|9-12M|9M\+/i.test(a);
    if (key === '1-2Y')  return /1Y|1-2Y|1\+|≥1Y|6M-5Y|6M-2Y|12M\+/i.test(a);
    return true;
}

function matchQAs(userText, opts = {}) {
    const t = (userText || '').toLowerCase();
    if (!t) return [];
    const tFlat = t.replace(/\s/g, '');

    let pool = getAllQA();
    if (opts.categories) pool = pool.filter(q => opts.categories.includes(q.category));
    if (opts.onlyLevels) pool = pool.filter(q => opts.onlyLevels.includes(q.level));

    const fragments = extractFragments(t);

    const scored = pool.map(q => {
        let score = 0;
        const qLow = (q.q || '').toLowerCase();
        const sLow = (q.short || '').toLowerCase();
        const cLow = (q.category || '').toLowerCase();
        const kws = (q.kw || '').split(/[,，、]/).map(k => k.trim()).filter(k => k.length >= 2);
        let kwHits = 0;

        // 1. user text 含 QA 關鍵字（最重要）
        kws.forEach(k => {
            if (tFlat.includes(k.toLowerCase().replace(/\s/g, ''))) {
                score += 10;
                kwHits++;
            }
        });
        // 2. user text 與 QA 問題互相包含
        if (qLow.includes(tFlat) && tFlat.length >= 2) score += 5;
        if (tFlat.includes(qLow.replace(/[^一-鿿a-z0-9]/gi, '').slice(0, 12)) && qLow.length >= 6) score += 3;
        // 3. user text 含 短答關鍵
        if (sLow.replace(/\s/g, '').includes(tFlat) && tFlat.length >= 2) score += 2;
        // 4. 類別關鍵字
        if (tFlat.includes(cLow) && cLow.length >= 2) score += 3;
        // 5. 中文片段比對
        fragments.forEach(frag => {
            if (qLow.includes(frag)) score += 1.5;
            if (sLow.includes(frag)) score += 0.5;
            kws.forEach(k => { if (k.toLowerCase().includes(frag)) score += 1; });
        });

        return { qa: q, score, kwHits };
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
   工具
   ═════════════════════════════════════════════ */
function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1900);
}
