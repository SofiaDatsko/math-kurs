import { findCourse, findTopic, esc } from '../store.js';

// Локальний стан адмінки (яка вкладка зараз активна)
let adminState = {
    section: 'courses',
    courseId: null,
    topicId: null
};

const LETTERS = ['А', 'Б', 'В', 'Г'];

export function renderAdmin(db, save, toast, refreshApp) {
    const nav = document.getElementById('admin-nav');
    let html = `<div class="nav-section-label">Курси</div>`;

    db.courses.forEach(c => {
        const isCourseActive = adminState.section === 'course' && adminState.courseId === c.id;
        const isTopicActiveInThisCourse = adminState.courseId === c.id && (adminState.section === 'course' || adminState.section === 'topic');
        
        html += `<button class="nav-btn ${isCourseActive ? 'active' : ''}" id="adm-c-${c.id}"><span class="nav-dot"></span>${esc(c.title)}</button>`;

        if (isTopicActiveInThisCourse) {
            c.topics.forEach(t => {
                const isTopicActive = adminState.section === 'topic' && adminState.topicId === t.id;
                html += `<button class="nav-btn ${isTopicActive ? 'active' : ''}" style="padding-left:28px;font-size:.8rem" id="adm-t-${c.id}-${t.id}"><span class="nav-dot"></span>${esc(t.title)}</button>`;
            });
            html += `<button class="nav-btn add-btn" style="padding-left:28px;font-size:.78rem" id="adm-add-t-${c.id}">+ Нова тема</button>`;
        }
    });
    html += `<button class="nav-btn add-btn" id="adm-add-c">+ Новий курс</button>`;
    nav.innerHTML = html;

    // Прив'язуємо події на створені кнопки навігації адмінки
    db.courses.forEach(c => {
        document.getElementById(`adm-c-${c.id}`).onclick = () => {
            adminState = { section: 'course', courseId: c.id, topicId: null };
            renderAdmin(db, save, toast, refreshApp);
        };

        if (adminState.courseId === c.id && (adminState.section === 'course' || adminState.section === 'topic')) {
            c.topics.forEach(t => {
                document.getElementById(`adm-t-${c.id}-${t.id}`).onclick = () => {
                    adminState = { section: 'topic', courseId: c.id, topicId: t.id };
                    renderAdmin(db, save, toast, refreshApp);
                };
            });
            document.getElementById(`adm-add-t-${c.id}`).onclick = () => adminAddTopic(db, c.id, save, refreshApp);
        }
    });
    document.getElementById('adm-add-c').onclick = () => adminAddCourse(db, save, refreshApp);

    renderAdminContent(db, save, toast, refreshApp);
}

function renderAdminContent(db, save, toast, refreshApp) {
    const el = document.getElementById('admin-content');

    if (adminState.section === 'courses' || !adminState.courseId) {
        el.innerHTML = `<div class="admin-panel"><div class="ap-title">Виберіть курс або тему зліва</div><div class="empty-state"><div class="es-icon">📋</div><p>Тут з'явиться редактор</p></div></div>`;
        return;
    }

    if (adminState.section === 'course') {
        const c = findCourse(db, adminState.courseId);
        if (!c) return;

        el.innerHTML = `
            <div class="admin-panel">
                <div class="ap-title">Редагувати курс: ${esc(c.title)}</div>
                <div class="form-row">
                    <div class="field"><label>Назва курсу</label><input id="ac-title" value="${esc(c.title)}"/></div>
                    <div class="field"><label>Клас (число)</label><input id="ac-grade" type="number" value="${c.grade}" min="5" max="12"/></div>
                </div>
                <div class="field"><label>Опис</label><input id="ac-desc" value="${esc(c.desc)}"/></div>
                <div class="field"><label>Колір (0–4)</label><select id="ac-color">
                    ${[0, 1, 2, 3, 4].map(i => `<option value="${i}" ${c.color === i ? 'selected' : ''}>Варіант ${i + 1}</option>`).join('')}
                </select></div>
                <div class="form-actions">
                    <button class="btn-primary" id="as-course-save">💾 Зберегти</button>
                    <button class="btn-danger" id="as-course-del">Видалити курс</button>
                </div>
            </div>`;

        document.getElementById('as-course-save').onclick = () => saveCourse(db, save, toast, refreshApp);
        document.getElementById('as-course-del').onclick = () => deleteCourse(db, save, toast, refreshApp);
        return;
    }

    if (adminState.section === 'topic') {
        const t = findTopic(db, adminState.courseId, adminState.topicId);
        if (!t) return;

        const qEditors = t.questions.map((q, qi) => buildQEditor(q, qi)).join('');

        el.innerHTML = `
            <div class="admin-panel">
                <div class="ap-title">Тема: ${esc(t.title)}</div>
                <div class="form-row">
                    <div class="field"><label>Назва теми</label><input id="at-title" value="${esc(t.title)}"/></div>
                    <div class="field"><label>Короткий опис</label><input id="at-desc" value="${esc(t.desc)}"/></div>
                </div>
                <div class="field"><label>Посилання на презентацію (Google Slides embed URL або Canva)</label><input id="at-pres" placeholder="https://docs.google.com/presentation/d/.../embed" value="${esc(t.presUrl)}"/></div>
                <div class="field"><label>Домашні завдання (кожен рядок — окреме завдання)</label><textarea id="at-hw">${t.hw.join('\n')}</textarea></div>
                <div class="form-row">
                    <div class="field"><label>Статус</label>
                        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:.85rem;padding:10px 0">
                            <input type="checkbox" id="at-unlocked" ${t.unlocked ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent2)"> Тема відкрита для учнів
                        </label>
                    </div>
                    <div class="field"><label>Прогрес</label>
                        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:.85rem;padding:10px 0">
                            <input type="checkbox" id="at-passed" ${t.passed ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--green)"> Тест вже пройдено
                        </label>
                    </div>
                </div>
                <hr class="sep"/>
                <div class="field"><label>Питання тесту</label>
                    <div id="qed-list">${qEditors}</div>
                    <button class="add-q-btn" id="as-add-q-btn">+ Додати питання</button>
                </div>
                <div class="form-actions">
                    <button class="btn-primary" id="as-topic-save">💾 Зберегти тему</button>
                    <button class="btn-secondary" id="as-topic-del">Видалити тему</button>
                </div>
            </div>`;

        // Вішаємо кліки для видалення окремих питань у списку
        t.questions.forEach((_, qi) => {
            document.getElementById(`qed-del-${qi}`).onclick = () => adminRemoveQ(db, qi, save, toast, refreshApp);
        });

        document.getElementById('as-add-q-btn').onclick = () => adminAddQuestion(db, save, toast, refreshApp);
        document.getElementById('as-topic-save').onclick = () => saveTopic(db, save, toast, refreshApp);
        document.getElementById('as-topic-del').onclick = () => adminDeleteTopic(db, save, toast, refreshApp);
    }
}

function buildQEditor(q, qi) {
    return `
        <div class="q-editor-block" id="qed-${qi}">
            <div class="qe-header">
                <span class="qe-num">Питання ${qi + 1}</span>
                <button class="qe-del" id="qed-del-${qi}" title="Видалити">✕</button>
            </div>
            <input class="field" style="width:100%;background:var(--bg);border:1.5px solid var(--border);color:var(--ink);padding:9px 12px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.85rem" id="qt-${qi}" value="${esc(q.q)}" placeholder="Текст питання"/>
            <div class="opts-grid">
                ${q.opts.map((o, oi) => `
                    <div class="opt-row">
                        <input type="radio" class="correct-radio" name="cr-${qi}" value="${oi}" ${q.correct === oi ? 'checked' : ''} title="Правильна відповідь">
                        <span class="opt-label">${LETTERS[oi]}</span>
                        <input type="text" class="field" style="flex:1;background:var(--bg);border:1.5px solid var(--border);color:var(--ink);padding:7px 10px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.8rem" id="qo-${qi}-${oi}" value="${esc(o)}" placeholder="Варіант ${LETTERS[oi]}"/>
                    </div>`).join('')}
            </div>
        </div>`;
}

function collectQuestions(t) {
    t.questions.forEach((_, qi) => {
        const txt = document.getElementById(`qt-${qi}`);
        if (txt) t.questions[qi].q = txt.value;
        for (let oi = 0; oi < 4; oi++) {
            const op = document.getElementById(`qo-${qi}-${oi}`);
            if (op) t.questions[qi].opts[oi] = op.value;
        }
        const radios = document.querySelectorAll(`input[name="cr-${qi}"]`);
        radios.forEach(r => {
            if (r.checked) t.questions[qi].correct = parseInt(r.value);
        });
    });
}

function adminAddQuestion(db, save, toast, refreshApp) {
    const t = findTopic(db, adminState.courseId, adminState.topicId);
    if (!t) return;
    collectQuestions(t);
    t.questions.push({ q: '', opts: ['', '', '', ''], correct: 0 });
    save(db);
    renderAdminContent(db, save, toast, refreshApp);
}

function adminRemoveQ(db, qi, save, toast, refreshApp) {
    const t = findTopic(db, adminState.courseId, adminState.topicId);
    if (!t) return;
    collectQuestions(t);
    t.questions.splice(qi, 1);
    save(db);
    renderAdminContent(db, save, toast, refreshApp);
}

function saveTopic(db, save, toast, refreshApp) {
    const t = findTopic(db, adminState.courseId, adminState.topicId);
    if (!t) return;
    t.title = document.getElementById('at-title').value.trim() || t.title;
    t.desc = document.getElementById('at-desc').value.trim();
    t.presUrl = document.getElementById('at-pres').value.trim();
    t.hw = document.getElementById('at-hw').value.split('\n').filter(l => l.trim());
    t.unlocked = document.getElementById('at-unlocked').checked;
    t.passed = document.getElementById('at-passed').checked;
    collectQuestions(t);
    save(db);
    toast('✓ Тему збережено!');
    renderAdmin(db, save, toast, refreshApp);
}

function adminDeleteTopic(db, save, toast, refreshApp) {
    if (!confirm('Видалити тему? Незворотна дія.')) return;
    const c = findCourse(db, adminState.courseId);
    if (!c) return;
    c.topics = c.topics.filter(t => t.id !== adminState.topicId);
    adminState.topicId = null;
    adminState.section = 'course';
    save(db);
    toast('Тему видалено');
    renderAdmin(db, save, toast, refreshApp);
}

function saveCourse(db, save, toast, refreshApp) {
    const c = findCourse(db, adminState.courseId);
    if (!c) return;
    c.title = document.getElementById('ac-title').value.trim() || c.title;
    c.grade = parseInt(document.getElementById('ac-grade').value) || c.grade;
    c.desc = document.getElementById('ac-desc').value.trim();
    c.color = parseInt(document.getElementById('ac-color').value);
    save(db);
    toast('✓ Курс збережено!');
    renderAdmin(db, save, toast, refreshApp);
}

function deleteCourse(db, save, toast, refreshApp) {
    if (!confirm('Видалити весь курс з усіма темами?')) return;
    db.courses = db.courses.filter(c => c.id !== adminState.courseId);
    adminState = { section: 'courses', courseId: null, topicId: null };
    save(db);
    toast('Курс видалено');
    renderAdmin(db, save, toast, refreshApp);
}

function adminAddCourse(db, save, refreshApp) {
    const id = 'c' + Date.now();
    db.courses.push({ id, grade: 10, title: 'Новий курс', desc: 'Опис', color: db.courses.length % 5, topics: [] });
    adminState = { section: 'course', courseId: id, topicId: null };
    save(db);
    renderAdmin(db, save, null, refreshApp);
}

// Функція скидання стану адмінки, якщо вчитель вийшов з неї
export function resetAdminState() {
    adminState = { section: 'courses', courseId: null, topicId: null };
}

function adminAddTopic(db, cid, save, refreshApp) {
    const c = findCourse(db, cid);
    if (!c) return;
    const id = 't' + Date.now();
    c.topics.push({ id, title: 'Нова тема', desc: 'Опис', presUrl: '', hw: ['Завдання 1'], questions: [{ q: 'Питання?', opts: ['А', 'Б', 'В', 'Г'], correct: 0 }], unlocked: false, passed: false });
    adminState = { section: 'topic', courseId: cid, topicId: id };
    save(db);
    renderAdmin(db, save, null, refreshApp);
}