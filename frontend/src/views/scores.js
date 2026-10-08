// Score entry: pick a class and subject, type CA1 / CA2 / Exam. Saves automatically; Submit locks it for review.
import { h, card, options, mount } from '../ui/dom.js';
import { run, toast } from '../ui/feedback.js';
import { statusTag } from '../ui/statusTag.js';
import { Classes, Students, Sheets } from '../api/endpoints.js';
import { session } from '../state/session.js';
import { teachesIn } from '../lib/access.js';
import { MAX, totalOf, gradeOf, isComplete } from '../lib/grading.js';

const pick = { classId: '', subjectId: '' };
let activeSaver = null;   // the sheet currently being edited, so it can be saved before switching

export async function render(root) {
  const me = session.user;
  const all = await Classes.list();
  const classes = me.role === 'teacher' ? all.filter(c => teachesIn(c, me.id)) : all;
  if (!classes.length) return root.append(card('No subjects are assigned to you yet. Ask the administrator to assign you in Classes.'));

  const area = h('div');
  const pickers = h('div', { class: 'card' });
  const draw = async () => {
    const cls = classes.find(c => c._id === pick.classId) || classes[0];
    pick.classId = cls._id;
    const subjects = cls.subjects.filter(s => me.role !== 'teacher' || s.teacher === me.id);
    const subject = subjects.find(s => s._id === pick.subjectId) || subjects[0];
    pick.subjectId = subject._id;

    const classSel = h('select', { value: cls._id, onchange: async e => { await activeSaver?.flush(); pick.classId = e.target.value; pick.subjectId = ''; draw(); } }, options(classes.map(c => [c._id, c.name])));
    const subjSel = h('select', { value: subject._id, onchange: async e => { await activeSaver?.flush(); pick.subjectId = e.target.value; draw(); } }, options(subjects.map(s => [s._id, s.name])));
    mount(pickers, h('div', { class: 'row' }, classSel, subjSel));
    mount(area, h('p', { class: 'muted' }, 'Loading…'));
    mount(area, await sheetCards(cls, subject, me, draw));
  };
  root.append(pickers, area);
  await draw();
}

async function sheetCards(cls, subject, me, redraw) {
  const [sheets, pupils] = await Promise.all([Sheets.forClass(cls._id), Students.list(cls._id)]);
  const sheet = sheets.find(s => s.subject === subject._id) || { status: 'draft', note: '', rows: {} };
  if (!pupils.length) return [card('No pupils in this class yet.')];

  const rows = structuredClone(sheet.rows || {});
  const editable = (me.role === 'admin' || subject.teacher === me.id) && ['draft', 'returned'].includes(sheet.status);
  const saveState = h('span', { class: 'muted' });
  const stats = h('div', { class: 'muted' });
  const saver = activeSaver = makeSaver(cls._id, subject._id, rows, saveState);

  const updateStats = () => {
    const totals = pupils.map(p => totalOf(rows[p._id])).filter(t => t != null);
    stats.textContent = totals.length
      ? `Entered ${totals.length}/${pupils.length} · Highest ${Math.max(...totals)} · Lowest ${Math.min(...totals)} · Average ${(totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1)}`
      : `Entered 0/${pupils.length}`;
  };

  const pupilRow = (p, i) => {
    const total = h('b'), grade = h('span', { class: 'tag' });
    const refresh = () => { const t = totalOf(rows[p._id]); total.textContent = t ?? '–'; grade.textContent = gradeOf(t); };
    const box = (key, label) => h('input', { type: 'number', inputmode: 'numeric', min: 0, max: MAX[key], placeholder: `${label} /${MAX[key]}`, value: rows[p._id]?.[key] ?? '', disabled: !editable,
      oninput: e => {
        let v = e.target.value;
        if (v !== '') { const n = Math.min(MAX[key], Math.max(0, Math.round(+v))); if (String(n) !== v) e.target.value = n; v = n; }
        rows[p._id] ??= {};
        if (v === '') delete rows[p._id][key]; else rows[p._id][key] = v;
        refresh(); updateStats(); saver.touch();
      } });
    refresh();
    return h('div', { class: 'pupil' }, h('b', {}, `${i + 1}. ${p.name}`), h('div', { class: 'nums' }, box('a', 'CA1'), box('b', 'CA2'), box('e', 'Exam'), h('div', { class: 'total' }, total, ' ', grade)));
  };

  const submit = h('button', { class: 'btn' }, 'Submit to Management');
  submit.onclick = () => run(submit, async () => {
    const missing = pupils.filter(p => !isComplete(rows[p._id])).length;
    if (!confirm((missing ? `${missing} pupil(s) have incomplete scores. Submit anyway? ` : 'Submit these scores to School Management? ') + 'You cannot edit after submitting.')) return;
    await saver.flush();
    await Sheets.submit(cls._id, subject._id);
    toast('Submitted');
    await redraw();
  });

  updateStats();
  return [
    sheet.status === 'returned' && sheet.note && h('div', { class: 'card error' }, h('b', {}, 'Returned by management: '), sheet.note),
    card(h('div', { class: 'row' }, h('b', {}, subject.name), statusTag(sheet.status), saveState), stats, pupils.map(pupilRow),
      editable ? [h('div', { class: 'row' }, submit), h('p', { class: 'muted' }, 'Scores save automatically. After you submit, you cannot edit them.')]
               : h('p', { class: 'muted' }, sheet.status === 'draft' ? 'You cannot edit this subject.' : `Locked: ${sheet.status}.`)),
  ].filter(Boolean);
}

// Saves 0.8 s after the last keystroke; flush() saves immediately (used before switching or submitting).
function makeSaver(classId, subjectId, rows, indicator) {
  let timer, dirty = false;
  const flush = async () => {
    clearTimeout(timer);
    if (!dirty) return;
    dirty = false;
    try { await Sheets.save(classId, subjectId, rows); indicator.textContent = 'Saved ✓'; }
    catch (e) { dirty = true; indicator.textContent = 'Not saved'; toast(e.message, 'error'); throw e; }
  };
  return { flush, touch() { dirty = true; indicator.textContent = 'Saving…'; clearTimeout(timer); timer = setTimeout(() => flush().catch(() => {}), 800); } };
}
