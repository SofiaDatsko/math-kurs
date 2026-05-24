import { esc } from '../store.js';

export function renderHome(db, onCourseSelect) {
    const el = document.getElementById('home-inner');
    const CC = ['cc-c0', 'cc-c1', 'cc-c2', 'cc-c3', 'cc-c4'];
    
    const cards = db.courses.map(c => {
        const total = c.topics.length;
        const done = c.topics.filter(t => t.passed).length;
        const pct = total ? Math.round(done / total * 100) : 0;
        
        // Створюємо елемент картки, щоб повісити на нього чисту подію кліку
        const div = document.createElement('div');
        div.className = `course-card ${CC[c.color % CC.length]}`;
        div.innerHTML = `
            <div class="cc-banner"><div class="cc-grade-label">${c.grade}</div></div>
            <div class="cc-body">
                <div class="cc-title">${esc(c.title)}</div>
                <div class="cc-meta"><span>📚 ${total} тем</span><span>✓ ${done} пройдено</span></div>
                <div class="cc-progress"><div class="cc-progress-fill" style="width:${pct}%"></div></div>
                <div class="cc-prog-text"><span>${esc(c.desc)}</span><span>${pct}%</span></div>
            </div>`;
        div.onclick = () => onCourseSelect(c.id);
        return div;
    });
    
    el.innerHTML = `
        <div style="padding:48px 40px 0">
            <div class="page-title">Мої курси</div>
            <div class="page-sub">Обери клас і розпочни навчання</div>
        </div>
        <div style="padding:24px 40px 48px"><div class="courses-grid" id="courses-grid-container"></div></div>`;
        
    const grid = el.querySelector('#courses-grid-container');
    cards.forEach(card => grid.appendChild(card));
}