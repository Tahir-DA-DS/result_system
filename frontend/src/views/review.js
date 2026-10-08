// Class broadsheet: pupils down the side, subjects across. Teachers submit their columns (one or all at once);
// management approves or returns each column; form teachers see submitted columns of other subjects.
import { h, card, options, mount } from '../ui/dom.js';
import { run, toast } from '../ui/feedback.js';
import { statusTag } from '../ui/statusTag.js';
import { reviewButtons } from '../ui/reviewButtons.js';
import { Classes, Broadsheet, Sheets } from '../api/endpoints.js';
import { session } from '../state/session.js';
import { teachesIn, isFormTeacher } from '../lib/access.js';
import { totalOf, gradeOf, isComplete } from '../lib/grading.js';

let selected = '';
const EDITABLE = ['draft', 'returned'];

export async function render(root) {
  const me = session.user, manager = me.role !== 'teacher';
  const all = await Classes.list();
  const classes = manager ? all : all.filter(c => teachesIn(c, me.id) || isFormTeacher(c, me.id));
  if (!classes.length) return root.append(card('No classes are assigned to you yet.'));
  if (!classes.some(c => c._id === selected)) selected = classes[0]._id;

  const draw = async () => {
    const { pupils, subjects } = await Broadsheet.get(selected);
    const incomplete = s => pupils.filter(p => !isComplete(s.rows[p._id])).length;
    const mine = subjects.filter(s => s.teacher === me.id && EDITABLE.includes(s.status));
    const button = (label, cls, fn) => { const b = h('button', { class: 'btn ' + cls }, label); b.onclick = () => run(b, fn); return b; };

    const submit = async list => {
      const gaps = list.reduce((sum, s) => sum + incomplete(s), 0);
      const text = `${list.map(s => s.name).join(', ')}\n\n` + (gaps ? `${gaps} pupil score(s) are incomplete. Submit anyway? ` : 'Submit to School Management? ') + 'You cannot edit after submitting.';
      if (!confirm(text)) return;
      const res = await Sheets.submitMany(selected, list.map(s => s.id));
      toast(`${res.submitted.length} submitted` + (res.skipped.length ? `, ${res.skipped.length} skipped` : ''));
      await draw();
    };

    const head = s => h('th', {},
      h('div', {}, h('b', {}, s.name)), h('div', { class: 'muted' }, s.teacherName || 'no teacher'), statusTag(s.status),
      s.visible && h('div', { class: 'muted' }, `${pupils.length - incomplete(s)}/${pupils.length} complete`),
      s.status === 'returned' && s.note && s.mine && h('div', { class: 'warn' }, 'Returned: ' + s.note),
      s.mine && EDITABLE.includes(s.status) && button('Submit', '', () => submit([s])),
      manager && reviewButtons(s.status, me.role === 'admin', (action, note) => Sheets.review(selected, s.id, action, note), draw));

    const cell = (s, p) => {
      if (!s.visible) return h('td', { class: 'hid', title: 'Visible once submitted' }, '·');
      const r = s.rows[p._id], t = totalOf(r);
      return h('td', { class: isComplete(r) ? '' : 'miss' }, t == null ? '–' : `${t} ${gradeOf(t)}`);
    };
    const average = s => {
      const t = s.visible ? pupils.map(p => totalOf(s.rows[p._id])).filter(v => v != null) : [];
      return h('td', {}, t.length ? (t.reduce((a, b) => a + b, 0) / t.length).toFixed(1) : '');
    };

    const classSel = h('select', { value: selected, onchange: e => { selected = e.target.value; draw(); } }, options(classes.map(c => [c._id, c.name])));
    mount(root,
      card(classSel),
      mine.length > 0 && card(button(`Submit all my subjects (${mine.length})`, '', () => submit(mine)),
        h('p', { class: 'muted' }, 'Subjects with incomplete scores are listed in the confirmation, so you can still go back and finish them.')),
      !manager && card(h('p', { class: 'muted' }, 'Scores for other subjects appear here once their teachers submit them.')),
      h('div', { class: 'card scroll' }, h('table', { class: 'tbl board' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Pupil'), subjects.map(head))),
        h('tbody', {}, pupils.map((p, i) => h('tr', {}, h('td', {}, `${i + 1}. ${p.name}`), subjects.map(s => cell(s, p))))),
        h('tfoot', {}, h('tr', {}, h('td', {}, 'Class average'), subjects.map(average))))));
  };
  await draw();
}
