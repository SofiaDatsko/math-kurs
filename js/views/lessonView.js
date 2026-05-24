import { findTopic, esc } from '../store.js';

// Локальний стан тесту для поточного відкритого уроку
let testState = {
    answers: {},
    submitted: false
};

const LETTERS = ['А', 'Б', 'В', 'Г'];

export function renderLesson(db, cid, tid, save, toast, goCourse) {
    const t = findTopic(db, cid, tid);
    if (!t) return;

    // Скидаємо стан тесту при кожному відкритті нового уроку
    testState = { answers: {}, submitted: false };

    const container = document.getElementById('lesson-inner');
    const hwItems = t.hw.map(h => `<li class="hw-item"><span class="hw-dot"></span>${esc(h)}</li>`).join('');

    container.innerHTML = `
        <div style="margin-bottom:20px;display:flex;align-items:center;gap:12px">
            <button class="btn-secondary" id="lesson-back-btn" style="padding:8px 18px;font-size:.82rem">← Назад до курсу</button>
            <div style="font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800">${esc(t.title)}</div>
        </div>
        <div class="lesson-grid">
            <div>
                <div class="lesson-section">
                    <div class="ls-header"><div class="ls-icon ls-icon-pres">🖥</div><div class="ls-title">Презентація</div></div>
                    <div class="ls-body">${t.presUrl
                        ? `<iframe class="pres-embed" src="${esc(t.presUrl)}" allowfullscreen></iframe>`
                        : `<div class="pres-empty"><div class="pe-icon">📊</div><p>Презентацію ще не додано.</p><p style="margin-top:4px;font-size:.78rem">Додайте посилання в адмін-панелі</p></div>`}</div>
                </div>
                <div class="lesson-section">
                    <div class="ls-header"><div class="ls-icon ls-icon-hw">📝</div><div class="ls-title">Домашнє завдання</div></div>
                    <div class="ls-body"><ul class="hw-list">${hwItems}</ul></div>
                </div>
                <div class="lesson-section">
                    <div class="ls-header">
                        <div class="ls-icon ls-icon-test">🧪</div>
                        <div class="ls-title">Тест для закріплення</div>
                        ${t.passed ? '<span class="status-chip sc-done" style="margin-left:auto">Пройдено ✓</span>' : ''}
                    </div>
                    <div class="ls-body" id="test-container"></div>
                </div>
            </div>
            <div id="lesson-sb"></div>
        </div>`;

    // Навігація назад
    container.querySelector('#lesson-back-btn').onclick = () => goCourse(cid);

    // Рендеримо підмодулі тесту та сайдбару
    renderTestBlock(db, cid, tid, save, toast);
    renderSidebarBlock(t);
}

function renderTestBlock(db, cid, tid, save, toast) {
    const t = findTopic(db, cid, tid);
    const testContainer = document.getElementById('test-container');
    if (!t.questions.length) {
        testContainer.innerHTML = '<p style="color:var(--ink3)">Тест ще не додано.</p>';
        return;
    }

    const qs = t.questions.map((q, qi) => `
        <div class="q-block" id="qb-${qi}">
            <div class="q-text">${qi + 1}. ${esc(q.q)}</div>
            <div class="q-opts">
                ${q.opts.map((o, oi) => `
                    <button class="opt-btn" id="ob-${qi}-${oi}">
                        <span class="opt-letter">${LETTERS[oi]}</span>${esc(o)}
                    </button>`).join('')}
            </div>
        </div>`).join('');

    testContainer.innerHTML = `
        <div class="test-questions">${qs}</div>
        <button class="submit-btn" id="test-submit" disabled>Перевірити відповіді</button>
        <div id="test-result"></div>`;

    // Навішуємо кліки на варіанти відповідей
    t.questions.forEach((q, qi) => {
        q.opts.forEach((_, oi) => {
            const btn = document.getElementById(`ob-${qi}-${oi}`);
            btn.onclick = () => pickOpt(qi, oi, t);
        });
    });

    // Навішуємо клік на кнопку перевірки
    const submitBtn = document.getElementById('test-submit');
    submitBtn.onclick = () => submitTest(db, cid, tid, save, toast);
}

function renderSidebarBlock(t) {
    const sb = document.getElementById('lesson-sb');
    const checks = [
        { label: 'Переглянути презентацію', done: !!t.presUrl },
        { label: 'Виконати домашнє завдання', done: false },
        { label: 'Пройти тест (≥80%)', done: t.passed },
    ];

    sb.innerHTML = `
        <div class="sb-card">
            <div class="sb-label">Прогрес уроку</div>
            <div class="progress-donut-wrap">
                <div class="big-pct">${t.passed ? '100' : '0'}%</div>
                <div class="big-pct-sub">${t.passed ? 'Завершено' : 'В процесі'}</div>
            </div>
        </div>
        <div class="sb-card">
            <div class="sb-label">Чеклист</div>
            <ul class="checklist">
                ${checks.map(c => `
                    <li class="cl-item">
                        <div class="cl-box ${c.done ? 'done' : 'todo'}">${c.done ? '✓' : '·'}</div>
                        <span class="cl-text ${c.done ? 'done' : ''}">${c.label}</span>
                    </li>`).join('')}
            </ul>
        </div>
        <div class="sb-card">
            <div class="sb-label">Підказка</div>
            <div class="tip-box">Для відкриття наступної теми потрібно набрати <strong>80%</strong> і вище у тесті. Відповідай уважно!</div>
        </div>`;
}

function pickOpt(qi, oi, t) {
    if (testState.submitted) return;
    
    const prev = testState.answers[qi];
    if (prev !== undefined) {
        const pb = document.getElementById(`ob-${qi}-${prev}`);
        if (pb) pb.classList.remove('selected');
    }
    
    testState.answers[qi] = oi;
    const btn = document.getElementById(`ob-${qi}-${oi}`);
    if (btn) btn.classList.add('selected');
    
    const sub = document.getElementById('test-submit');
    if (sub) sub.disabled = Object.keys(testState.answers).length < t.questions.length;
}

function submitTest(db, cid, tid, save, toast) {
    if (testState.submitted) return;
    testState.submitted = true;

    const t = findTopic(db, cid, tid);
    const c = db.courses.find(curr => curr.id === cid);
    let correct = 0;

    t.questions.forEach((q, qi) => {
        const chosen = testState.answers[qi];
        for (let oi = 0; oi < q.opts.length; oi++) {
            const btn = document.getElementById(`ob-${qi}-${oi}`);
            if (!btn) continue;
            btn.disabled = true;
            btn.classList.remove('selected');
            if (oi === q.correct) btn.classList.add('correct');
            else if (oi === chosen) btn.classList.add('wrong');
        }
        if (chosen === q.correct) correct++;
    });

    const pct = Math.round((correct / t.questions.length) * 100);
    const pass = pct >= 80;

    const sub = document.getElementById('test-submit');
    if (sub) sub.style.display = 'none';

    const res = document.getElementById('test-result');
    res.innerHTML = `
        <div class="result-card ${pass ? 'pass' : 'fail'}">
            <div class="res-score">${pct}%</div>
            <div class="res-sub">${correct} з ${t.questions.length} правильних ${pass ? ' · 🎉 Наступна тема відкрита!' : ' · Потрібно ≥80%'}</div>
            ${!pass ? `<button class="retry-btn" id="test-retry-btn">🔄 Спробувати ще раз</button>` : ''}
        </div>`;

    if (!pass) {
        document.getElementById('test-retry-btn').onclick = () => retryTest(db, cid, tid, save, toast);
    }

    if (pass && !t.passed) {
        t.passed = true;
        const idx = c.topics.findIndex(tp => tp.id === tid);
        if (idx >= 0 && idx + 1 < c.topics.length) {
            c.topics[idx + 1].unlocked = true;
            toast('🔓 Відкрита тема: ' + c.topics[idx + 1].title);
        } else {
            toast('🏆 Всі теми курсу завершено!');
        }
        save(db);
        renderSidebarBlock(t);
    }
}

function retryTest(db, cid, tid, save, toast) {
    testState = { answers: {}, submitted: false };
    renderTestBlock(db, cid, tid, save, toast);
}