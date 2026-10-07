'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const { buildTimetable, listClasses } = require('../lib/timetable');
const { parseRenderedTimetable } = require('../lib/svgTimetable');
const { parseSubstitutions, entriesForClass, parseInfo } = require('../lib/substitutions');
const Core = require('../public/core');

const fx = (f) => fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8');
let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✓', name); } catch (e) { console.error('  ✗', name, '\n   ', e.message); process.exitCode = 1; }
}

const apiRaw = JSON.parse(fx('regulartt-sample.json'));
const tt = buildTimetable(apiRaw, '1F Technikum');
const svgTt = parseRenderedTimetable(fx('timetable-rendered.html'));

console.log('Plan lekcji');
test('finds class by full name, short name or id', () => {
  assert.equal(buildTimetable(apiRaw, '1F').class.name, '1F Technikum');
  assert.equal(buildTimetable(apiRaw, '1f technikum').class.id, '-184');
  assert.equal(buildTimetable(apiRaw, '-184').class.short, '1F');
  assert.throws(() => buildTimetable(apiRaw, '9XX'), /Nie znaleziono klasy/);
});
test('class list', () => assert.deepEqual(listClasses(apiRaw).map((c) => c.short), ['1F', '1G']));
test('periods with start/end', () => {
  assert.equal(tt.periods[0].start, '08:00');
  assert.equal(tt.periods[3].start, '10:40');
  assert.equal(tt.periods.length, 14);
});
test('Monday period 2 is physics in 206', () => {
  const l = tt.lessons.find((x) => x.day === 0 && x.from === 2);
  assert.equal(l.subject.name, 'Fizyka');
  assert.equal(l.teachers[0].name, 'Głogiak Henryk');
  assert.deepEqual(l.rooms, ['206']);
});
test('split groups and religion group', () => {
  const mon3 = tt.lessons.filter((x) => x.day === 0 && x.from === 3);
  assert.deepEqual(mon3.map((x) => x.groups[0]).sort(), ['1', '2']);
  const rel = tt.lessons.find((x) => x.subject.name === 'Religia');
  assert.deepEqual(rel.groups, ['rel']);
  assert.ok(tt.divisions.some((d) => d.groups.join() === '1,2'));
});
test('JSON route and drawn-SVG route give the same 46 lessons', () => {
  const k = (l) => [l.day, l.from, l.to, l.subject.name, (l.teachers[0] || {}).name, l.rooms.join('/'), l.groups.join('/')].join('|');
  assert.equal(svgTt.lessons.length, 46);
  assert.deepEqual(svgTt.lessons.map(k).sort(), tt.lessons.map(k).sort());
  assert.equal(svgTt.class.name, '1F Technikum');
});

test('school address in any form', () => {
  const { normalizeEdupage: n, schoolNameFromHtml } = require('../lib/edupage');
  assert.equal(n('mojaszkola'), 'mojaszkola');
  assert.equal(n('https://Moja-Szkola.edupage.org/timetable/?a=1'), 'moja-szkola');
  assert.equal(n('  przykladowa.edupage.org  '), 'przykladowa');
  assert.equal(n('http://example.com/'), null);
  assert.equal(n('dwa słowa'), null);
  assert.equal(n(''), null);
  assert.equal(schoolNameFromHtml(fx('substitution-page-2026-10-06.html')), 'Szkoła Przykładowa nr 1');
});

console.log('Zastępstwa');
const s06 = parseSubstitutions(fx('substitution-page-2026-10-06.html'));
const s05 = parseSubstitutions(fx('subst-api-2026-10-05.html'));
test('reads date and class sections from the saved page', () => {
  assert.equal(s06.date, '2026-10-06');
  assert.equal(s06.updatedAt, '2026-10-06T08:19');
  assert.ok(Object.keys(s06.classes).includes('1F'));
  assert.equal(Object.keys(s06.classes).length, 19);
});
test('1F on 06.10: maths room 006 → 207, same teacher', () => {
  const [e] = entriesForClass(s06, { name: '1F Technikum', short: '1F' });
  assert.equal(e.periodFrom, 3);
  assert.equal(e.roomFrom, '006');
  assert.equal(e.roomTo, '207');
  assert.deepEqual(e.teachers, ['Alicja Malinek']);
  assert.equal(e.cancelled, false);
});
test('cancelled lesson with group', () => {
  const [e] = s06.classes['1D'];
  assert.equal(e.cancelled, true);
  assert.deepEqual(e.groups, ['1']);
});
test('two-period substitution "4 - 5"', () => {
  const e = s06.classes['1D'][1];
  assert.equal(e.periodFrom, 4); assert.equal(e.periodTo, 5);
  assert.deepEqual(e.teacherFrom, ['Morelak Damian']); assert.deepEqual(e.teacherTo, ['Henryk Sosnak']);
});
test('subject change "(Psych) ➔ bio"', () => {
  const e = s06.classes['1A'][0];
  assert.equal(e.subjectFrom.short, 'Psych'); assert.equal(e.subject.short, 'bio');
  assert.deepEqual(e.notes, ['Biologia z lekcji 8']);
});
test('whole-day class absence', () => {
  assert.deepEqual(s06.absentClasses.map((x) => x.name), ['3C', '3D']);
  assert.equal(s06.classes['3C'][0].absent, true);
});
test('API variant: partial absence, multiple teachers, notes with commas', () => {
  assert.equal(s05.classes['1A'][1].absent, true);
  assert.deepEqual([s05.classes['1A'][1].periodFrom, s05.classes['1A'][1].periodTo], [5, 6]);
  assert.deepEqual(s05.classes['4C'][0].teachers, ['Oliwia Jabłonek-Mchowiak', 'Cezary Porzeczek']);
  assert.deepEqual(s05.classes['4G'][1].groups, ['3', '4']);
  assert.deepEqual(s05.classes['1G'][0].teachers, ['Oliwia Lipiec', 'Weronika Makowiak']);
  assert.deepEqual(s05.classes['1F'][0].notes, ['Religia z lekcji 7, na lekcji 7 będzie wf z p. Morelak']);
  assert.deepEqual(s05.classes['3A'][0].groups, ['g1']);
});
test('empty day', () => {
  const e = parseSubstitutions(fx('subst-api-empty.html'));
  assert.equal(e.empty, true); assert.equal(e.date, '2026-10-07');
});
test('tolerates different wording / arrows', () => {
  const e = parseInfo('9:40 - 10:25, 2: (jn) → wiai - Zastępstwo: (Jan Nowak) -> Anna Kowalska, Sala: (101) → 207, odwołana część', { from: 3, to: 3 }, [], {});
  assert.equal(e.start, '09:40');
  assert.deepEqual(e.groups, ['2']);
  assert.equal(e.subjectFrom.short, 'jn');
  assert.deepEqual(e.teacherTo, ['Anna Kowalska']);
  assert.equal(e.roomTo, '207');
});

test('real oddities: "+teacher", "(absent teacher)", "Nauczyciel: - X"', () => {
  const a = parseInfo('12:25-13:10, che - +Henryk Sosnak, Zastępstwa: (Wanda Koprek) ➔ Kacper Jaworek, Zmień salę lekcyjną: (206) ➔ sg, Wychowanie fizyczne z lekcji 8', { from: 6, to: 6 }, [], {});
  assert.deepEqual(a.teachersAdded, ['Henryk Sosnak']);
  assert.deepEqual(a.teacherTo, ['Kacper Jaworek']);
  assert.deepEqual(a.notes, ['Wychowanie fizyczne z lekcji 8']);
  const b = parseInfo('8:50-10:25, 1: ja - (Edyta Wierzbiak), Nauczyciel: Oliwia Jabłonek-Mchowiak, j. angielski z p. Jabłonek - Mchowiak według planu', { from: 2, to: 3 }, [], {});
  assert.deepEqual(b.teacherFrom, ['Edyta Wierzbiak']);
  assert.deepEqual(b.teachers, ['Oliwia Jabłonek-Mchowiak']);
  assert.equal(b.notes.length, 1);
  const c = parseInfo('8:00-8:45, jn - Nauczyciel: - Kasztelak Urszula Liliak, Zmień salę lekcyjną: (B) ➔ N1', { from: 1, to: 1 }, [], {});
  assert.deepEqual(c.teachers, ['Kasztelak Urszula Liliak']);
  const d = parseInfo('11:30-12:15, M2, M1: j_joz - Celina Orzeszek, Anulowano', { from: 5, to: 5, cancelledHint: true }, [], {});
  assert.deepEqual(d.groups, ['M2', 'M1']); assert.equal(d.cancelled, true);
  const e = parseInfo('9:40-10:25, s2: r_mat - Nauczyciele: Daria Konwalik, Halina Olszak, (Bez klasy 2A)', { from: 3, to: 3 }, [], {});
  assert.deepEqual(e.teachers, ['Daria Konwalik', 'Halina Olszak']); assert.deepEqual(e.notes, ['(Bez klasy 2A)']);
});

console.log('Łączenie planu z zastępstwami');
const entries06 = entriesForClass(s06, { name: '1F Technikum', short: '1F' });
test('room change shows on Tuesday period 3', () => {
  const day = Core.mergeDay(tt, 1, entries06, {});
  const mat = day.find((l) => l.from === 3);
  assert.equal(mat.status, 'changed');
  assert.deepEqual(mat.changes.room, { from: '006', to: '207' });
  assert.equal(mat.changes.teacher, undefined, 'same teacher written in other order is not a change');
});
test('cancellation keeps the lesson, marked cancelled', () => {
  const e = parseInfo('14:05-14:50, edb - Jerzy Topolak, Anulowano', { from: 8, to: 8, cancelledHint: true }, ['remove'], {});
  const day = Core.mergeDay(tt, 2, [e], {});
  const edb = day.find((l) => l.from === 8);
  assert.equal(edb.subject.name, 'Edukacja dla bezpieczeństwa');
  assert.equal(edb.status, 'cancelled');
  assert.equal(day.filter((l) => l.from === 8).length, 1, 'no duplicate row');
});
test('group-specific change only hits that group', () => {
  const e = parseInfo('9:40-10:25, 1: sbd - Zastępstwa: (Feliks Leszczak) ➔ Marek Wiązek', { from: 3, to: 3 }, [], {});
  const day = Core.mergeDay(tt, 0, [e], {});
  const g1 = day.find((l) => l.from === 3 && l.groups[0] === '1');
  const g2 = day.find((l) => l.from === 3 && l.groups[0] === '2');
  assert.equal(g1.status, 'changed'); assert.deepEqual(g1.changes.teacher.to, ['Marek Wiązek']);
  assert.equal(g2.status, 'normal');
});
test('lesson not in plan is added', () => {
  const e = parseInfo('14:55-15:40, (jn) ➔ wiai - Zastępstwa: (Edward Cisak) ➔ Ignacy Paprotek', { from: 9, to: 9 }, [], { wiai: 'Witryny i aplikacje internetowe' });
  const day = Core.mergeDay(tt, 0, [e], {});
  const add = day.find((l) => l.from === 9);
  assert.equal(add.status, 'added'); assert.equal(add.subject.name, 'Witryny i aplikacje internetowe');
});
test('group filter hides the other group', () => {
  const div = tt.divisions.find((d) => d.groups.includes('1')).id;
  const day = Core.mergeDay(tt, 0, [], { groups: { [div]: '2' } });
  assert.ok(day.every((l) => !l.groups.includes('1')));
  assert.ok(day.some((l) => l.groups.includes('2')));
});

console.log('Przerwy i „teraz”');
const tueRows = Core.buildTimeline(Core.mergeDay(tt, 1, entries06, {}));
test('breaks between lessons', () => {
  const types = tueRows.map((r) => r.type + (r.type === 'slot' ? r.from : ''));
  assert.deepEqual(types.slice(0, 5), ['slot1', 'break', 'slot2', 'break', 'slot3']);
  const b = tueRows.find((r) => r.type === 'break' && r.start === '10:25');
  assert.equal(b.end, '10:40'); assert.equal(b.minutes, 15);
});
test('now = 09:50 → maths in room 207', () => {
  const st = Core.nowState(tueRows, Core.toMin('09:50'));
  assert.equal(st.type, 'lesson');
  const eff = Core.effective(st.items[0]);
  assert.equal(eff.subject.name, 'Matematyka'); assert.deepEqual(eff.rooms, ['207']);
});
test('now = 10:30 → break', () => assert.equal(Core.nowState(tueRows, Core.toMin('10:30')).type, 'break'));
test('now = 07:30 → before school', () => assert.equal(Core.nowState(tueRows, Core.toMin('07:30')).type, 'before'));
test('now = 17:37 → after school', () => assert.equal(Core.nowState(tueRows, Core.toMin('17:37')).type, 'after'));
test('end boundary: 08:45 is already a break', () => assert.equal(Core.nowState(tueRows, Core.toMin('08:45')).type, 'break'));
test('cancelled first lesson → school starts later', () => {
  const e = parseInfo('8:00-8:45, npr - Henryk Tatarak, Anulowano', { from: 1, to: 1, cancelledHint: true }, ['remove'], {});
  const rows = Core.buildTimeline(Core.mergeDay(tt, 1, [e], {}));
  const st = Core.nowState(rows, Core.toMin('08:10'));
  assert.equal(st.type, 'before'); assert.equal(st.next.start, '08:50');
});
test('week dates (Mon–Fri)', () => {
  assert.deepEqual(Core.weekDates(new Date(2026, 9, 6), 0), ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09']);
  assert.equal(Core.weekDates(new Date(2026, 9, 11), 0)[0], '2026-10-05');
});

console.log(`\n${passed} testów OK${process.exitCode ? ', są błędy' : ''}`);
