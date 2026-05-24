import { findCourse, esc } from '../store.js';

export function renderCourse(db, cid, onTopicSelect) {
    const c = findCourse(db, cid);
    if (!c) return;
    const done = c.topics.filter(t => t.passed).length;
    
    const container = document.getElementById('course-inner');
    container.innerHTML = `
        <div class="course-header">
            <div class="ch-left">
                <h2>${esc(c.title)}</h2>
                <p>${esc(c.desc)} • ${done} з ${c.topics.length} тем завершено</p>
            </div>
        </div>
        <div class="topics-list" id="topics-list-container"></div>`;
        
    const listContainer = container.querySelector('#topics-list-container');
    
    c.topics.forEach((t, i) => {
        const locked = !t.unlocked;
        const done2 = t.passed;
        
        const row = document.createElement('div');
        row.className = `topic-row ${locked ? 'locked' : ''} ${done2 ? 'done' : ''}`;
        row.innerHTML = `
            <div class="tr-num">${locked ? '🔒' : done2 ? '✓' : `${i + 1}`}</div>
            <div class="tr-body">
                <div class="tr-title">${esc(t.title)}</div>
                <div class="tr-meta"><span>📎 ${t.hw.length} завд.</span><span>❓ ${t.questions.length} питань</span></div>
            </div>
            <div class="tr-right">
                ${done2 ? '<span class="status-chip sc-done">Пройдено ✓</span>' : locked ? '<span class="status-chip sc-lock">Заблоковано</span>' : '<span class="status-chip sc-new">Почати →</span>'}
                ${!locked ? '<span class="tr-arrow">›</span>' : ''}
            </div>`;
            
        if (!locked) {
            row.onclick = () => onTopicSelect(cid, t.id);
        }
        listContainer.appendChild(row);
    });
}