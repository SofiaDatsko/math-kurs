const STORE_KEY = 'mathpro_v4';

const seed = {
    courses: [
        {
            id: 'c5', grade: 5, title: '5 клас', desc: 'Натуральні числа, дроби, основи геометрії', color: 0,
            topics: [
                {
                    id: 't5_1', title: 'Додавання і віднімання натуральних чисел', desc: 'Повторення та закріплення дій з числами', presUrl: '', 
                    hw: ['Стор. 15 — №45, №48', 'Повторити правила додавання у стовпчик'],
                    questions: [
                        {q: 'Чому дорівнює сума чисел 125 і 75?', opts: ['150', '200', '250', '190'], correct: 1},
                        {q: 'Яка цифра стоїть у розряді десятків числа 345?', opts: ['3', '4', '5', '0'], correct: 1}
                    ], unlocked: true, passed: false
                }
            ]
        },
        {
            id: 'c6', grade: 6, title: '6 клас', desc: 'Подільність чисел, звичайні дроби, відношення та пропорції', color: 1,
            topics: [
                {
                    id: 't6_1', title: 'Ознаки подільності на 2, 5 і 10', desc: 'Визначення подільності чисел без виконання ділення', presUrl: '', 
                    hw: ['Стор. 30 — №112, №115'],
                    questions: [
                        {q: 'Яке з чисел ділиться на 5 націло?', opts: ['123', '456', '785', '901'], correct: 2},
                        {q: 'Яке число є парним (ділиться на 2)?', opts: ['11', '22', '33', '55'], correct: 1}
                    ], unlocked: true, passed: false
                }
            ]
        },
        {
            id: 'c7', grade: 7, title: '7 клас', desc: 'Числа, відсотки, функції, геометрія', color: 2,
            topics: [
                {
                    id: 't7_1', title: 'Натуральні числа', desc: 'Дії з натуральними числами, ділення', presUrl: '', 
                    hw: ['Стор. 12 — вправи 1–10', 'Задача №3 зі збірника'],
                    questions: [
                        {q: 'Яке з чисел є натуральним?', opts: ['0', '-5', '7', '3.14'], correct: 2},
                        {q: '7 × 8 = ?', opts: ['54', '56', '58', '63'], correct: 1}
                    ], unlocked: true, passed: false
                }
            ]
        },
        {
            id: 'c8', grade: 8, title: '8 клас', desc: 'Алгебра, квадратні корені, рівняння', color: 3,
            topics: [
                {
                    id: 't8_1', title: 'Лінійні рівняння', desc: 'Рівняння першого степеня та їх властивості', presUrl: '', 
                    hw: ['Задачі стор. 120 №1-12'],
                    questions: [
                        {q: '2x + 4 = 10, x = ?', opts: ['2', '3', '4', '5'], correct: 1}
                    ], unlocked: true, passed: false
                }
            ]
        },
        {
            id: 'c9', grade: 9, title: '9 клас', desc: 'Квадратична функція, системи рівнянь, прогресії', color: 4,
            topics: [
                {
                    id: 't9_1', title: 'Степені та корені', desc: 'Властивості степенів з цілим показником', presUrl: '', 
                    hw: ['Вправи 1–15 стор. 102'],
                    questions: [
                        {q: 'Чому дорівнює 2 у 3-му степені (2³)?', opts: ['6', '9', '8', '16'], correct: 2}
                    ], unlocked: true, passed: false
                }
            ]
        },
        {
            id: 'c10', grade: 10, title: '10 клас', desc: 'Вступ до стереометрії, тригонометричні функції', color: 0,
            topics: [
                {
                    id: 't10_1', title: 'Радіанна міра кута', desc: 'Перехід від градусів до радіан і навпаки', presUrl: '', 
                    hw: ['Перевести кути 30°, 45°, 60° у радіани'],
                    questions: [
                        {q: 'Скільки радіан становить кут 180°?', opts: ['π/2', 'π', '2π', '3π/2'], correct: 1}
                    ], unlocked: true, passed: false
                }
            ]
        },
        {
            id: 'c11', grade: 11, title: '11 клас', desc: 'Похідна та її застосування, інтеграл, комбінаторика', color: 1,
            topics: [
                {
                    id: 't11_1', title: 'Поняття похідної функції', desc: 'Геометричний та фізичний зміст похідної', presUrl: '', 
                    hw: ['Знайти похідні простих степеневих функцій за таблицею'],
                    questions: [
                        {q: 'Похідна функції f(x) = x² дорівнює:', opts: ['x', '2', '2x', 'x³'], correct: 2}
                    ], unlocked: true, passed: false
                }
            ]
        }
    ]
};

export function loadDB() {
    try {
        const s = localStorage.getItem(STORE_KEY);
        return s ? JSON.parse(s) : JSON.parse(JSON.stringify(seed));
    } catch {
        return JSON.parse(JSON.stringify(seed));
    }
}

export function saveDB(db) {
    localStorage.setItem(STORE_KEY, JSON.stringify(db));
}

// Допоміжні функції для пошуку в базі даних
export function findCourse(db, id) {
    return db.courses.find(c => c.id === id);
}

export function findTopic(db, cid, tid) {
    const c = findCourse(db, cid);
    return c ? c.topics.find(t => t.id === tid) : null;
}

// Безпечне відображення тексту
export function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}