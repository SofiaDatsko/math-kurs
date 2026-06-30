// ═══════════════════════════════════════════════════════
// НАЛАШТУВАННЯ FIREBASE
// ═══════════════════════════════════════════════════════
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db_cloud = firebase.firestore();

function toast(msg) {
    const t = document.getElementById('toast'); 
    if (t) {
        t.textContent = msg; 
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2800);
    }
}

const TEACHER_EMAIL = import.meta.env.VITE_TEACHER_EMAIL;

// ═══════════════════════════════════════════════════════
// БЛОК 1: ДАНІ ТА СХОВИЩЕ
// ═══════════════════════════════════════════════════════
const STORE_KEY = 'mathpro_v5';

const seed = {
    courses: [
        {
            id: 'c5', grade: 5, title: '5 клас', desc: 'Натуральні числа, дроби, основи геометрії', color: 0,
            topics: [{ id: 't5_1', title: 'Додавання і віднімання натуральних чисел', desc: 'Повторення дій з числами', presUrl: '', materials: [{title: 'Стор. 15 — №45', url: '#'}], questions: [{q: 'Сума 125 і 75?', qImg: '', opts: ['150', '200', '250', '190'], correct: 1}], unlocked: true, passed: false }]
        },
        { id: 'c6', grade: 6, title: '6 клас', desc: 'Подільність чисел, звичайні дроби', color: 1, topics: [{ id: 't6_1', title: 'Ознаки подільності', desc: 'Подільність на 2, 5 і 10', presUrl: '', materials: [{title: 'Стор. 30', url: '#'}], questions: [{q: 'Що ділиться на 5?', qImg: '', opts: ['123', '456', '785', '901'], correct: 2}], unlocked: true, passed: false }] },
        { id: 'c7', grade: 7, title: '7 клас', desc: 'Числа, відсотки, функції, геометрія', color: 2, topics: [{ id: 't7_1', title: 'Натуральні числа', desc: 'Дії з числами', presUrl: '', materials: [{title: 'Стор. 12', url: '#'}], questions: [{q: 'Яке число натуральне?', qImg: '', opts: ['0', '-5', '7', '3.14'], correct: 2}], unlocked: true, passed: false }] },
        { id: 'c8', grade: 8, title: '8 клас', desc: 'Алгебра, квадратні корені, рівняння', color: 3, topics: [{ id: 't8_1', title: 'Лінійні рівняння', desc: 'Рівняння першого степеня', presUrl: '', materials: [{title: 'Стор. 120', url: '#'}], questions: [{q: '2x + 4 = 10, x = ?', qImg: '', opts: ['2', '3', '4', '5'], correct: 1}], unlocked: true, passed: false }] },
        { id: 'c9', grade: 9, title: '9 клас', desc: 'Квадратична функція, прогресії', color: 4, topics: [{ id: 't9_1', title: 'Степені та корені', desc: 'Властивості степенів', presUrl: '', materials: [{title: 'Стор. 102', url: '#'}], questions: [{q: '2³ = ?', qImg: '', opts: ['6', '9', '8', '16'], correct: 2}], unlocked: true, passed: false }] },
        { id: 'c10', grade: 10, title: '10 клас', desc: 'Вступ до стереометрії, тригонометрія', color: 0, topics: [{ id: 't10_1', title: 'Радіанна міра кута', desc: 'Градуси та радіани', presUrl: '', materials: [{title: 'Повторити кути', url: '#'}], questions: [{q: 'Кут 180° це:', qImg: '', opts: ['π/2', 'π', '2π', '3π/2'], correct: 1}], unlocked: true, passed: false }] },
        { id: 'c11', grade: 11, title: '11 клас', desc: 'Похідна, інтеграл, комбінаторика', color: 1, topics: [{ id: 't11_1', title: 'Поняття похідної', desc: 'Зміст похідної', presUrl: '', materials: [{title: 'Таблиця похідних', url: '#'}], questions: [{q: 'Похідна x²:', qImg: '', opts: ['x', '2', '2x', 'x³'], correct: 2}], unlocked: true, passed: false }] }
    ]
};

function loadDB() {
    try { 
        const s = localStorage.getItem(STORE_KEY); 
        let data = s ? JSON.parse(s) : JSON.parse(JSON.stringify(seed));
        data.courses.forEach(c => {
            c.topics.forEach(t => {
                if (t.hw && !t.materials) {
                    t.materials = t.hw.map(item => ({ title: item, url: '#' }));
                    delete t.hw;
                }
                if (!t.materials) t.materials = [];
                if (t.questions) {
                    t.questions.forEach(q => { if (q.qImg === undefined) q.qImg = ''; });
                }
            });
        });
        return data;
    }
    catch { return JSON.parse(JSON.stringify(seed)); }
}
function saveDB(data) { localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
function findCourse(id) { return db.courses.find(c => c.id === id); }
function findTopic(cid, tid) { const c = findCourse(cid); return c ? c.topics.find(t => t.id === tid) : null; }
function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ═══════════════════════════════════════════════════════
// БЛОК 2: АВТОРИЗАЦІЯ FIREBASE ТА РОУТИНГ
// ═══════════════════════════════════════════════════════
let currentUser = null; 
let db = loadDB();
let state = { page: 'home', courseId: null, topicId: null };
let testState = { answers: {}, solutions: {}, submitted: false };
let allowedCourses = {}; // Сюди підвантажуватимуться дозволені класи учня з Firestore
const LETTERS = ['А', 'Б', 'В', 'Г'];

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = {
            uid: user.uid,
            email: user.email,
            role: user.email === TEACHER_EMAIL ? 'teacher' : 'student'
        };
        
        let nameToShow = user.displayName || user.email.split('@')[0];
        document.getElementById('user-welcome-text').textContent = `Вітаємо, ${nameToShow}!`;
        document.getElementById('user-profile-block').style.display = 'flex';
        document.getElementById('auth-screen').style.display = 'none';
        
        // Спочатку витягуємо права доступу, потім ініціалізуємо інтерфейс
        fetchAccessRights().then(() => {
            setupInterfaceForRole();
        });
    } else {
        currentUser = null;
        document.getElementById('user-profile-block').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    }
});

// Завантаження лімітів доступу для поточного учня
function fetchAccessRights() {
    if (!currentUser || currentUser.role === 'teacher') {
        allowedCourses = {};
        return Promise.resolve();
    }
    return db_cloud.collection("course_access")
        .where("studentEmail", "==", currentUser.email)
        .get()
        .then(snapshot => {
            allowedCourses = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                allowedCourses[data.courseId] = data.status; // 'pending' або 'approved'
            });
        })
        .catch(err => console.error("Помилка завантаження прав доступу:", err));
}

function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => {
        if (err.code === 'auth/popup-blocked') { auth.signInWithRedirect(provider); } 
        else { alert('Помилка входу через Google: ' + err.message); }
    });
}

function handleEmailLogin() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!email || !password) return alert('Заповніть поля!');
    auth.signInWithEmailAndPassword(email, password).catch(err => alert('Помилка входу: ' + err.message));
}

function handleLogout() { auth.signOut().then(() => toast('Ви вийшли з системи')); }

function setupInterfaceForRole() {
    const adminBtn = document.getElementById('admin-toggle-btn');
    if (currentUser && currentUser.role === 'teacher') {
        adminBtn.style.display = 'block';
        adminBtn.onclick = toggleAdmin;
    } else {
        adminBtn.style.display = 'none';
        if (state.page === 'admin') goHome(); 
    }
    goHome();
}

function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function updateBreadcrumb() {
    const bc = document.getElementById('breadcrumb');
    let html = `<span class="bc-item ${state.page === 'home' ? 'current' : ''}" id="bc-home">Усі курси</span>`;
    if (state.courseId) {
        const c = findCourse(state.courseId);
        if (c) html += `<span class="bc-sep">›</span><span class="bc-item ${state.page === 'course' ? 'current' : ''}" id="bc-course">${c.title}</span>`;
    }
    if (state.topicId && state.courseId) {
        const t = findTopic(state.courseId, state.topicId);
        if (t) html += `<span class="bc-sep">›</span><span class="bc-item current">${t.title}</span>`;
    }
    bc.innerHTML = html;
    document.getElementById('bc-home').onclick = goHome;
    if (document.getElementById('bc-course')) document.getElementById('bc-course').onclick = () => goCourse(state.courseId);
}

function goHome() { state = { page: 'home', courseId: null, topicId: null }; renderHome(); showView('view-home'); updateBreadcrumb(); }
function goCourse(cid) { 
    // Захист: якщо студент не має доступу — не пускати всередину по прямому лінку
    if (currentUser.role === 'student' && allowedCourses[cid] !== 'approved') {
        toast('❌ Доступ до цього класу заблоковано!');
        goHome();
        return;
    }
    state = { page: 'course', courseId: cid, topicId: null }; 
    renderCourse(cid); 
    showView('view-course'); 
    updateBreadcrumb(); 
}
function goLesson(cid, tid) {
    if (currentUser.role === 'student' && allowedCourses[cid] !== 'approved') return goHome();
    state = { page: 'lesson', courseId: cid, topicId: tid }; 
    testState = { answers: {}, solutions: {}, submitted: false }; 
    renderLesson(cid, tid); 
    showView('view-lesson'); 
    updateBreadcrumb(); 
}

function toggleAdmin() {
    if (!currentUser || currentUser.role !== 'teacher') return;
    const isAdminOpen = document.getElementById('view-admin').classList.contains('active');
    if (isAdminOpen) { adminLayoutState = { section: 'courses', courseId: null, topicId: null }; goHome(); } 
    else { state.page = 'admin'; renderAdmin(); showView('view-admin'); updateBreadcrumb(); }
}

// ═══════════════════════════════════════════════════════
// БЛОК 3: ВІДОБРАЖЕННЯ КУРСІВ З СИТЕМОЮ ЗАПИТІВ ДОСТУПУ
// ═══════════════════════════════════════════════════════
function renderHome() {
    const el = document.getElementById('home-inner'); 
    const CC = ['cc-c0', 'cc-c1', 'cc-c2', 'cc-c3', 'cc-c4'];
    
    el.innerHTML = `
        <div style="padding:48px 40px 0">
            <div class="page-title">Мої курси</div>
            <div class="page-sub">Надішліть запит викладачу, щоб відкрити доступ до матеріалів класу</div>
        </div>
        <div style="padding:24px 40px 48px">
            <div class="courses-grid" id="courses-grid-container"></div>
        </div>`;
        
    const grid = el.querySelector('#courses-grid-container');
    
    db.courses.forEach(c => {
        const total = c.topics.length; 
        const done = c.topics.filter(t => t.passed).length; 
        const pct = total ? Math.round(done / total * 100) : 0;
        
        const div = document.createElement('div');
        
        // Логіка визначення стану картки для Студента чи Вчителя
        let lockOverlayHtml = '';
        let isDisabled = false;
        
        if (currentUser && currentUser.role === 'student') {
            const status = allowedCourses[c.id];
            if (status === 'approved') {
                // Доступ відкрито постійно
                lockOverlayHtml = `<div style="position:absolute; top:12px; right:12px; background:rgba(34,197,94,0.9); color:white; padding:4px 10px; border-radius:20px; font-size:0.75rem; font-weight:700;">🔓 Доступ відкрито</div>`;
            } else if (status === 'pending') {
                // Запит надіслано, чекаємо
                isDisabled = true;
                lockOverlayHtml = `
                    <div style="position:absolute; inset:0; background:rgba(255,255,255,0.85); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center; border-radius:16px; z-index:2;">
                        <span style="font-size:2rem; margin-bottom:10px;">⏳</span>
                        <div style="font-weight:700; color:var(--ink1);">Запит надіслано</div>
                        <div style="font-size:0.8rem; color:var(--ink3); margin-top:4px;">Очікуйте на підтвердження вчителем</div>
                    </div>`;
            } else {
                // Доступ закрито, запиту ще немає
                isDisabled = true;
                lockOverlayHtml = `
                    <div style="position:absolute; inset:0; background:rgba(244,244,245,0.9); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center; border-radius:16px; z-index:2;">
                        <span style="font-size:2rem; margin-bottom:8px;">🔒</span>
                        <div style="font-weight:700; color:var(--ink2); font-size:0.95rem; margin-bottom:12px;">Курс заблоковано</div>
                        <button class="btn-primary request-access-btn" data-cid="${c.id}" data-title="${c.title}" style="padding:8px 16px; font-size:0.8rem; border-radius:8px; cursor:pointer;">Надіслати запит</button>
                    </div>`;
            }
        }
        
        div.className = `course-card ${CC[c.color % CC.length]}`;
        div.style.position = 'relative';
        div.innerHTML = `
            ${lockOverlayHtml}
            <div class="cc-banner"><div class="cc-grade-label">${c.grade}</div></div>
            <div class="cc-body">
                <div class="cc-title">${esc(c.title)}</div>
                <div class="cc-meta"><span>📚 ${total} тем</span><span>✓ ${done} пройдено</span></div>
                <div class="cc-progress"><div class="cc-progress-fill" style="width:${pct}%"></div></div>
                <div class="cc-prog-text"><span>${esc(c.desc)}</span><span>${pct}%</span></div>
            </div>`;
            
        if (!isDisabled) {
            div.onclick = () => goCourse(c.id);
        }
        grid.appendChild(div);
    });

    // Обробник кліку по кнопці «Надіслати запит»
    grid.onclick = (e) => {
        if (e.target.classList.contains('request-access-btn')) {
            e.stopPropagation();
            const cid = e.target.dataset.cid;
            const cTitle = e.target.dataset.title;
            requestAccess(cid, cTitle);
        }
    };
}

// Функція генерації запиту в Firestore
function requestAccess(courseId, courseTitle) {
    let studentName = auth.currentUser.displayName || currentUser.email.split('@')[0];
    db_cloud.collection("course_access").add({
        studentName: studentName,
        studentEmail: currentUser.email,
        courseId: courseId,
        courseTitle: courseTitle,
        status: 'pending',
        date: new Date().toLocaleString('uk-UA')
    })
    .then(() => {
        toast('✨ Запит успішно надіслано!');
        return fetchAccessRights(); // Перезавантажуємо масив прав
    })
    .then(() => renderHome())
    .catch(err => alert("Помилка відправки запиту: " + err.message));
}

function renderCourse(cid) {
    const c = findCourse(cid); if (!c) return; const done = c.topics.filter(t => t.passed).length;
    const container = document.getElementById('course-inner');
    container.innerHTML = `<div class="course-header"><div class="ch-left"><h2>${esc(c.title)}</h2><p>${esc(c.desc)} • ${done} з ${c.topics.length} тем завершено</p></div></div><div class="topics-list" id="topics-list-container"></div>`;
    const listContainer = container.querySelector('#topics-list-container');
    c.topics.forEach((t, i) => {
        const locked = !t.unlocked; const done2 = t.passed; const row = document.createElement('div');
        row.className = `topic-row ${locked ? 'locked' : ''} ${done2 ? 'done' : ''}`;
        row.innerHTML = `<div class="tr-num">${locked ? '🔒' : done2 ? '✓' : `${i + 1}`}</div><div class="tr-body"><div class="tr-title">${esc(t.title)}</div><div class="tr-meta"><span>📎 ${t.materials.length} мат.</span><span>❓ ${t.questions.length} питань</span></div></div><div class="tr-right">${done2 ? '<span class="status-chip sc-done">Пройдено ✓</span>' : locked ? '<span class="status-chip sc-lock">Заблоковано</span>' : '<span class="status-chip sc-new">Почати →</span>'}${!locked ? '<span class="tr-arrow">›</span>' : ''}</div>`;
        if (!locked) row.onclick = () => goLesson(cid, t.id);
        listContainer.appendChild(row);
    });
}

// ═══════════════════════════════════════════════════════
// БЛОК 4: ЕКРАН УРОКУ ТА ТЕСТУ
// ═══════════════════════════════════════════════════════
function renderLesson(cid, tid) {
    const t = findTopic(cid, tid); if (!t) return;
    const container = document.getElementById('lesson-inner'); 
    const matItems = t.materials.map(m => `<li class="hw-item"><span class="hw-dot"></span><a href="${m.url !== '#' ? m.url : '#'}" target="_blank" style="text-decoration:none; color:inherit;">${esc(m.title)}</a></li>`).join('');

    let presContent = `<div class="pres-empty"><div class="pe-icon">📊</div><p>Презентацію ще не додано.</p></div>`;
    if (t.presUrl && t.presUrl.trim() !== '') {
        if (t.presUrl.includes('<iframe')) {
            presContent = t.presUrl.replace(/width=".*?"/, 'width="100%"').replace(/height=".*?"/, 'height="450px"');
        } else {
            presContent = `<div style="text-align:center; padding:40px; background:var(--bg); border-radius:12px;"><a href="${esc(t.presUrl)}" target="_blank" class="btn-primary" style="padding:15px 30px; font-size:1.1rem; text-decoration:none; display:inline-block; border-radius:10px; cursor:pointer;">🖥 Відкрити презентацію в новому вікні</a></div>`;
        }
    }

    container.innerHTML = `
        <div style="margin-bottom:20px;display:flex;align-items:center;gap:12px">
            <button class="btn-secondary" id="lesson-back-btn" style="padding:8px 18px;font-size:.82rem">← Назад до курсу</button>
            <div style="font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800">${esc(t.title)}</div>
        </div>
        <div class="lesson-grid">
            <div>
                <div class="lesson-section">
                    <div class="ls-header"><div class="ls-icon ls-icon-pres">🖥</div><div class="ls-title">Презентація</div></div>
                    <div class="ls-body">${presContent}</div>
                </div>
                <div class="lesson-section">
                    <div class="ls-header"><div class="ls-icon ls-icon-hw">📎</div><div class="ls-title">Додаткові матеріали</div></div>
                    <div class="ls-body"><ul class="hw-list">${matItems || '<li style="color:var(--ink3)">Матеріалів поки немає</li>'}</ul></div>
                </div>
                <div class="lesson-section">
                    <div class="ls-header"><div class="ls-icon ls-icon-test">🧪</div><div class="ls-title">Тест для закріплення</div></div>
                    <div class="ls-body" id="test-container"></div>
                </div>
            </div>
            <div id="lesson-sb"></div>
        </div>`;
    
    container.querySelector('#lesson-back-btn').onclick = () => goCourse(cid);
    renderTestBlock(cid, tid); 
    renderSidebarBlock(t);
}

function renderTestBlock(cid, tid) {
    const t = findTopic(cid, tid); const testContainer = document.getElementById('test-container');
    if (!t.questions.length) { testContainer.innerHTML = '<p style="color:var(--ink3)">Тест ще не додано.</p>'; return; }
    
    const qs = t.questions.map((q, qi) => {
        const imgHtml = q.qImg && q.qImg.trim() !== '' ? `<div style="margin: 12px 0;"><img src="${esc(q.qImg)}" style="max-width:100%; max-height:280px; border-radius:8px; border:1px solid var(--border); object-fit:contain;"></div>` : '';
        return `
        <div class="q-block" id="qb-${qi}" style="border-bottom:1px solid var(--border); padding-bottom:20px; margin-bottom:20px;">
            <div class="q-text" style="font-weight:600;">${qi + 1}. ${esc(q.q)}</div>
            ${imgHtml}
            <div class="q-opts" style="margin-top:12px; display:grid; gap:8px;">
                ${q.opts.map((o, oi) => `<button class="opt-btn" id="ob-${qi}-${oi}" style="text-align:left;"><span class="opt-letter" style="margin-right:10px; font-weight:700;">${LETTERS[oi]}</span>${esc(o)}</button>`).join('')}
            </div>
            <div style="margin-top:14px; background:var(--bg); padding:10px; border-radius:8px;">
                <label style="font-size:0.8rem; display:block; margin-bottom:4px;">📎 Посилання на розв'язок (за бажанням):</label>
                <input type="text" class="field" id="qs-${qi}" placeholder="https://..." style="width:100%; padding:6px;" />
            </div>
        </div>`;
    }).join('');
    
    testContainer.innerHTML = `<div class="test-questions">${qs}</div><button class="submit-btn" id="test-submit" disabled style="width:100%; padding:14px;">Перевірити відповіді</button><div id="test-result"></div>`;
    
    t.questions.forEach((q, qi) => {
        q.opts.forEach((_, oi) => { document.getElementById(`ob-${qi}-${oi}`).onclick = () => pickOpt(qi, oi, t); });
        document.getElementById(`qs-${qi}`).oninput = (e) => { testState.solutions[qi] = e.target.value.trim(); };
    });
    document.getElementById('test-submit').onclick = () => submitTest(cid, tid);
}

function renderSidebarBlock(t) {
    const sb = document.getElementById('lesson-sb'); const checks = [{ label: 'Переглянути презентацію', done: !!t.presUrl }, { label: 'Ознайомитись з мат.', done: t.materials.length > 0 }, { label: 'Пройти тест (≥80%)', done: t.passed }];
    sb.innerHTML = `<div class="sb-card"><div class="sb-label">Прогрес уроку</div><div class="progress-donut-wrap"><div class="big-pct">${t.passed ? '100' : '0'}%</div></div></div><div class="sb-card"><div class="sb-label">Чеклист</div><ul class="checklist">${checks.map(c => `<li class="cl-item"><div class="cl-box ${c.done ? 'done' : 'todo'}">${c.done ? '✓' : '·'}</div><span>${c.label}</span></li>`).join('')}</ul></div>`;
}

function pickOpt(qi, oi, t) {
    if (testState.submitted) return;
    const prev = testState.answers[qi]; if (prev !== undefined) document.getElementById(`ob-${qi}-${prev}`).classList.remove('selected');
    testState.answers[qi] = oi; document.getElementById(`ob-${qi}-${oi}`).classList.add('selected');
    document.getElementById('test-submit').disabled = Object.keys(testState.answers).length < t.questions.length;
}

function submitTest(cid, tid) {
    if (testState.submitted) return; testState.submitted = true;
    const t = findTopic(cid, tid); const c = findCourse(cid); let correct = 0;
    
    t.questions.forEach((q, qi) => {
        const chosen = testState.answers[qi]; const solInput = document.getElementById(`qs-${qi}`); if (solInput) solInput.disabled = true;
        for (let oi = 0; oi < q.opts.length; oi++) {
            const btn = document.getElementById(`ob-${qi}-${oi}`); if (!btn) continue; btn.disabled = true;
            if (oi === q.correct) btn.classList.add('correct'); else if (oi === chosen) btn.classList.add('wrong');
        }
        if (chosen === q.correct) correct++;
    });
    
    const pct = Math.round((correct / t.questions.length) * 100); const pass = pct >= 80;
    document.getElementById('test-submit').style.display = 'none';
    document.getElementById('test-result').innerHTML = `<div class="result-card ${pass ? 'pass' : 'fail'}"><div class="res-score">${pct}%</div>${!pass ? `<button class="retry-btn" id="retry-btn">🔄 Спробувати ще раз</button>` : ''}</div>`;
    if (!pass) document.getElementById('retry-btn').onclick = () => { testState = { answers: {}, solutions: {}, submitted: false }; renderTestBlock(cid, tid); };
    
    if (pass && !t.passed) {
        t.passed = true; const idx = c.topics.findIndex(tp => tp.id === tid);
        if (idx >= 0 && idx + 1 < c.topics.length) c.topics[idx + 1].unlocked = true;
        saveDB(db); renderSidebarBlock(t);
    }

    if (currentUser && currentUser.role === 'student') {
        let studentName = auth.currentUser.displayName || currentUser.email.split('@')[0];
        let attachedSolutions = []; t.questions.forEach((_, qi) => { attachedSolutions.push(testState.solutions[qi] || "Не надано"); });

        db_cloud.collection("student_results").add({
            studentName: studentName,
            studentEmail: currentUser.email,
            courseTitle: c.title,
            topicTitle: t.title,
            score: pct,
            solutions: attachedSolutions,
            date: new Date().toLocaleString('uk-UA')
        });
    }
}

// ═══════════════════════════════════════════════════════
// БЛОК 5: АДМІНКА (ДОДАНО ПАНЕЛЬ ПІДТВЕРДЖЕННЯ ЗАПИТІВ)
// ═══════════════════════════════════════════════════════
let adminLayoutState = { section: 'progress', courseId: null, topicId: null };

function renderAdmin() {
    const nav = document.getElementById('admin-nav'); if (!nav) return;
    
    let html = `<div class="nav-section-label">Аналітика</div>
    <button class="nav-btn ${adminLayoutState.section === 'progress' ? 'active' : ''}" data-action="go-progress"><span class="nav-dot"></span>📊 Прогрес учнів</button>
    <button class="nav-btn ${adminLayoutState.section === 'requests' ? 'active' : ''}" data-action="go-requests"><span class="nav-dot"></span>🔑 Запити доступу</button>
    <div class="nav-section-label" style="margin-top:20px;">Курси</div>`;
    
    db.courses.forEach(c => {
        const isCActive = adminLayoutState.section === 'course' && adminLayoutState.courseId === c.id;
        html += `<button class="nav-btn ${isCActive ? 'active' : ''}" data-action="edit-course" data-id="${c.id}"><span class="nav-dot"></span>${esc(c.title)}</button>`;
        if (adminLayoutState.courseId === c.id && (adminLayoutState.section === 'course' || adminLayoutState.section === 'topic')) {
            c.topics.forEach(t => {
                const isTActive = adminLayoutState.section === 'topic' && adminLayoutState.topicId === t.id;
                html += `<button class="nav-btn ${isTActive ? 'active' : ''}" style="padding-left:28px;font-size:.8rem" data-action="edit-topic" data-cid="${c.id}" data-tid="${t.id}"><span class="nav-dot"></span>${esc(t.title)}</button>`;
            });
            html += `<button class="nav-btn add-btn" style="padding-left:28px;font-size:.78rem" data-action="add-topic" data-id="${c.id}">+ Нова тема</button>`;
        }
    });
    html += `<button class="nav-btn add-btn" data-action="add-course">+ Новий курс</button>`; nav.innerHTML = html;

    nav.onclick = (e) => {
        const btn = e.target.closest('button'); if (!btn) return;
        const { action, id, cid, tid } = btn.dataset;
        if (action === 'go-progress') adminLayoutState = { section: 'progress', courseId: null, topicId: null };
        if (action === 'go-requests') adminLayoutState = { section: 'requests', courseId: null, topicId: null };
        if (action === 'edit-course') adminLayoutState = { section: 'course', courseId: id, topicId: null };
        if (action === 'edit-topic') adminLayoutState = { section: 'topic', courseId: cid, topicId: tid };

        if (action === 'add-course') {
            const newId = 'c_' + Date.now();
            const newCourse = { id: newId, grade: 0, title: 'Новий курс', desc: '', color: 0, topics: [] };
            db.courses.push(newCourse);
            saveDB(db);
            adminLayoutState = { section: 'course', courseId: newId, topicId: null };
        }

        if (action === 'add-topic') {
            const course = findCourse(id);
            if (course) {
                const newTid = 't_' + Date.now();
                const newTopic = { id: newTid, title: 'Нова тема', desc: '', presUrl: '', materials: [], questions: [], unlocked: true, passed: false };
                course.topics.push(newTopic);
                saveDB(db);
                adminLayoutState = { section: 'topic', courseId: course.id, topicId: newTid };
            }
        }

        renderAdmin();
        renderAdmin();
    };
    renderAdminContent();
}

function renderAdminContent() {
    const el = document.getElementById('admin-content');
    
    // Вкладка 1: Керування запитами доступу
    if (adminLayoutState.section === 'requests') {
        el.innerHTML = `
            <div class="admin-panel">
                <div class="ap-title">🔑 Керування доступами до класів</div>
                <p style="color:var(--ink3); font-size:0.85rem; margin-bottom:20px;">Запити студентів на активацію курсів. Підтвердження надається один раз.</p>
                <div style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.9rem; text-align:left;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border); color:var(--ink2);">
                                <th style="padding:12px 8px;">Учень</th>
                                <th style="padding:12px 8px;">Запитуваний клас</th>
                                <th style="padding:12px 8px;">Дата</th>
                                <th style="padding:12px 8px; text-align:center;">Дія</th>
                            </tr>
                        </thead>
                        <tbody id="requests-tbody">
                            <tr><td colspan="4" style="padding:24px; text-align:center; color:var(--ink3);">Вантажимо запити...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>`;
            
        db_cloud.collection("course_access").where("status", "==", "pending").get().then(snapshot => {
            const tbody = document.getElementById('requests-tbody');
            if (snapshot.empty) {
                tbody.innerHTML = `<tr><td colspan="4" style="padding:24px; text-align:center; color:var(--ink3);">Нових запитів на доступ немає.</td></tr>`;
                return;
            }
            let html = "";
            snapshot.forEach(doc => {
                const data = doc.data();
                html += `
                    <tr style="border-bottom:1px solid var(--border); height:50px;">
                        <td style="padding:8px; font-weight:500;">${esc(data.studentName)}<br><span style="font-size:0.75rem; color:var(--ink3); font-weight:400;">${esc(data.studentEmail)}</span></td>
                        <td style="padding:8px; font-weight:600; color:var(--accent);">${esc(data.courseTitle)}</td>
                        <td style="padding:8px; color:var(--ink3);">${esc(data.date)}</td>
                        <td style="padding:8px; text-align:center;">
                            <button class="btn-primary approve-access-btn" data-docid="${doc.id}" style="padding:4px 12px; font-size:0.8rem; background:var(--green); border-color:var(--green); border-radius:6px; cursor:pointer;">🔓 Надати доступ</button>
                        </td>
                    </tr>`;
            });
            tbody.innerHTML = html;
            
            tbody.onclick = (e) => {
                if (e.target.classList.contains('approve-access-btn')) {
                    const docId = e.target.dataset.docid;
                    db_cloud.collection("course_access").doc(docId).update({ status: 'approved' })
                        .then(() => { toast('Доступ успішно активовано!'); renderAdminContent(); });
                }
            };
        });
        return;
    }

    // Вкладка 2: Журнал прогресу
    if (adminLayoutState.section === 'progress') {
        el.innerHTML = `
            <div class="admin-panel">
                <div class="ap-title">📊 Журнал успішності учнів</div>
                <div style="overflow-x:auto; margin-top:15px;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.9rem; text-align:left;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border); color:var(--ink2);">
                                <th style="padding:12px 8px;">Учень</th>
                                <th style="padding:12px 8px;">Клас/Курс</th>
                                <th style="padding:12px 8px;">Тема</th>
                                <th style="padding:12px 8px; text-align:center;">Оцінка</th>
                                <th style="padding:12px 8px;">Прикріплені розв'язки</th>
                                <th style="padding:12px 8px;">Дата здачі</th>
                            </tr>
                        </thead>
                        <tbody id="cloud-results-tbody"></tbody>
                    </table>
                </div>
            </div>`;

        db_cloud.collection("student_results").orderBy("date", "desc").get().then((querySnapshot) => {
            const tbody = document.getElementById('cloud-results-tbody');
            if (querySnapshot.empty) { tbody.innerHTML = `<tr><td colspan="6" style="padding:24px; text-align:center; color:var(--ink3);">Дані відсутні.</td></tr>`; return; }
            let rowsHtml = "";
            querySnapshot.forEach((doc) => {
                const data = doc.data(); const badgeColor = data.score >= 80 ? 'var(--green)' : 'var(--accent)'; const bgBadge = data.score >= 80 ? '#f0fdf4' : '#fff4ed';
                let solLinksHtml = `<span style="color:var(--ink3); font-size:0.8rem;">Немає</span>`;
                if (data.solutions && Array.isArray(data.solutions)) {
                    solLinksHtml = data.solutions.map((sol, index) => (sol && sol !== "Не надано") ? `<a href="${esc(sol)}" target="_blank" style="display:inline-block; margin:2px; padding:2px 6px; background:#e0f2fe; color:#0369a1; border-radius:4px; text-decoration:none; font-size:0.78rem;">№${index+1} ↗</a>` : '').join('').trim();
                    if (solLinksHtml === '') solLinksHtml = `<span style="color:var(--ink3); font-size:0.8rem;">Немає</span>`;
                }
                rowsHtml += `<tr style="border-bottom:1px solid var(--border); height:50px;"><td style="padding:8px; font-weight:500;">${esc(data.studentName)}<br><span style="font-size:0.75rem; color:var(--ink3); font-weight:400;">${esc(data.studentEmail)}</span></td><td style="padding:8px; color:var(--ink2);">${esc(data.courseTitle)}</td><td style="padding:8px; color:var(--ink2);">${esc(data.topicTitle)}</td><td style="padding:8px; text-align:center;"><span style="padding:4px 10px; border-radius:12px; font-weight:700; background:${bgBadge}; color:${badgeColor}; border:1px solid ${badgeColor}30;">${data.score}%</span></td><td style="padding:8px;">${solLinksHtml}</td><td style="padding:8px; color:var(--ink3); font-size:0.8rem;">${esc(data.date)}</td></tr>`;
            });
            tbody.innerHTML = rowsHtml;
        });
        return;
    }

    // Редактори курсів / тем
    if (adminLayoutState.section === 'course') {
        const c = findCourse(adminLayoutState.courseId); if (!c) return;
        el.innerHTML = `<div class="admin-panel"><div class="ap-title">Редагувати курс: ${esc(c.title)}</div><div class="form-row"><div class="field"><label>Назва курсу</label><input id="ac-title" value="${esc(c.title)}"/></div><div class="field"><label>Клас (число)</label><input id="ac-grade" type="number" value="${c.grade}"/></div></div><div class="field"><label>Опис</label><input id="ac-desc" value="${esc(c.desc)}"/></div><div class="field"><label>Колір (0–4)</label><select id="ac-color">${[0,1,2,3,4].map(i => `<option value="${i}" ${c.color === i ? 'selected' : ''}>Варіант ${i + 1}</option>`).join('')}</select></div><div class="form-actions"><button class="btn-primary" id="as-course-save">💾 Зберегти</button></div></div>`;
        document.getElementById('as-course-save').onclick = () => { c.title = document.getElementById('ac-title').value.trim(); c.grade = parseInt(document.getElementById('ac-grade').value); c.desc = document.getElementById('ac-desc').value.trim(); c.color = parseInt(document.getElementById('ac-color').value); saveDB(db); toast('✓ Збережено!'); renderAdmin(); };
    }
    else if (adminLayoutState.section === 'topic') {
        const t = findTopic(adminLayoutState.courseId, adminLayoutState.topicId); if (!t) return;
        const qEditors = t.questions.map((q, qi) => buildQEditor(q, qi)).join(''); const matText = t.materials.map(m => `${m.title} | ${m.url}`).join('\n');
        el.innerHTML = `<div class="admin-panel"><div class="ap-title">Тема: ${esc(t.title)}</div><div class="form-row"><div class="field"><label>Назва теми</label><input id="at-title" value="${esc(t.title)}"/></div><div class="field"><label>Опис</label><input id="at-desc" value="${esc(t.desc)}"/></div></div><div class="field"><label>Презентація</label><input id="at-pres" value="${esc(t.presUrl)}"/></div><div class="field"><label>Матеріали</label><textarea id="at-materials" rows="4">${esc(matText)}</textarea></div><div class="field"><label>Питання</label><div id="qed-list">${qEditors}</div><button class="add-q-btn" id="as-add-q-btn">+ Додати питання</button></div><div class="form-actions"><button class="btn-primary" id="as-topic-save">💾 Зберегти тему</button></div></div>`;
        
        document.getElementById('as-add-q-btn').onclick = () => { collectQuestions(t); t.questions.push({q: '', qImg: '', opts: ['', '', '', ''], correct: 0}); saveDB(db); renderAdminContent(); };
        document.getElementById('as-topic-save').onclick = () => { t.title = document.getElementById('at-title').value.trim(); t.desc = document.getElementById('at-desc').value.trim(); t.presUrl = document.getElementById('at-pres').value.trim(); const rawMat = document.getElementById('at-materials').value; t.materials = rawMat.split('\n').filter(l => l.trim()).map(line => { const parts = line.split('|'); return { title: parts[0].trim(), url: parts[1] ? parts[1].trim() : '#' }; }); collectQuestions(t); saveDB(db); toast('✓ Збережено!'); renderAdmin(); };
    }
}

function buildQEditor(q, qi) {
    return `<div class="q-editor-block" id="qed-${qi}" style="border:1px solid var(--border); padding:15px; border-radius:8px; margin-bottom:15px; background:#fff;"><div class="qe-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"><span class="qe-num" style="font-weight:700;">Питання ${qi + 1}</span><button class="qe-del" id="qed-del-${qi}" style="background:none; border:none; color:red; cursor:pointer;">✕</button></div><input class="field" style="width:100%; margin-bottom:8px;" id="qt-${qi}" value="${esc(q.q)}" placeholder="Текст питання"/><input class="field" style="width:100%; margin-bottom:12px; font-size:0.85rem;" id="qi-${qi}" value="${esc(q.qImg || '')}" placeholder="URL-посилання на картинку"/><div class="opts-grid" style="display:grid; gap:8px;">${q.opts.map((o, oi) => `<div class="opt-row" style="display:flex; align-items:center; gap:8px;"><input type="radio" name="cr-${qi}" value="${oi}" ${q.correct === oi ? 'checked' : ''}><span class="opt-label" style="font-weight:600;">${LETTERS[oi]}</span><input type="text" class="field" style="flex:1;" id="qo-${qi}-${oi}" value="${esc(o)}"/></div>`).join('')}</div></div>`;
}

function collectQuestions(t) {
    t.questions.forEach((_, qi) => {
        const txt = document.getElementById(`qt-${qi}`); if (txt) t.questions[qi].q = txt.value;
        const imgTxt = document.getElementById(`qi-${qi}`); if (imgTxt) t.questions[qi].qImg = imgTxt.value.trim();
        for (let oi = 0; oi < 4; oi++) { const op = document.getElementById(`qo-${qi}-${oi}`); if (op) t.questions[qi].opts[oi] = op.value; }
        const radios = document.querySelectorAll(`input[name="cr-${qi}"]`); radios.forEach(r => { if (r.checked) t.questions[qi].correct = parseInt(r.value); });
    });
}

function init() {
    document.getElementById('auth-google-btn').onclick = handleGoogleLogin;
    document.getElementById('auth-login-btn').onclick = handleEmailLogin;
    document.getElementById('auth-logout-btn').onclick = handleLogout;
}
window.onload = init;