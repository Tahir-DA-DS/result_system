// Form teacher's class report: behaviour ratings, days attended, remark (and Status for secondary classes).
// A preview table of every pupil shows what is still missing before the report is submitted.
import { h, card, options, mount } from '../ui/dom.js';
import { run, toast } from '../ui/feedback.js';
import { statusTag } from '../ui/statusTag.js';
import { reportTable } from '../ui/reportTable.js';
import { Classes, Students, Reports } from '../api/endpoints.js';
import { session } from '../state/session.js';
import { isFormTeacher } from '../lib/access.js';
import { incompleteReports } from '../lib/reportCheck.js';

const BEHAVIOUR = ['Attentiveness', 'Honesty', 'Neatness', 'Cooperation', 'Attitude to work'];
const STATUSES = ['Promoted', 'Promoted on trial', 'Repeated'];
let selected = '';

export async function render(root) {
  const me = session.user;
  const all = await Classes.list();
  const classes = me.role === 'teacher' ? all.filter(c => isFormTeacher(c, me.id)) : all;
  if (!classes.length) return root.append(card('You are not the form teacher of any class.'));
  if (!classes.some(c => c._id === selected)) selected = classes[0]._id;

  const draw = async () => {
    const cls = classes.find(c => c._id === selected);
    const [pupils, data] = await Promise.all([Students.list(cls._id), Reports.forClass(cls._id)]);
    const reports = Object.fromEntries(data.reports.map(r => [r.student, { b: r.b || [0, 0, 0, 0, 0], att: r.att ?? '', rem: r.rem || '', st: r.st || '' }]));
    const editable = (me.role === 'admin' || isFormTeacher(cls, me.id)) && ['draft', 'returned'].includes(data.status);

    const preview = h('div');
    const refreshPreview = () => {
      const gaps = incompleteReports(pupils, reports, cls.level);
      mount(preview, h('p', { class: gaps.length ? 'warn' : 'muted' },
        gaps.length ? `${gaps.length} of ${pupils.length} pupil(s) incomplete: ${gaps.map(g => g.name).join(', ')}` : `All ${pupils.length} reports are complete.`),
      reportTable(pupils, reports, cls.level));
    };
    refreshPreview();

    const classSel = h('select', { value: cls._id, onchange: e => { selected = e.target.value; draw(); } }, options(classes.map(c => [c._id, c.name])));
    const submit = h('button', { class: 'btn' }, 'Submit class report to Management');
    submit.onclick = () => run(submit, async () => {
      const gaps = incompleteReports(pupils, reports, cls.level);
      const text = gaps.length ? `${gaps.length} pupil(s) have incomplete reports (${gaps.map(g => g.name).join(', ')}). Submit anyway? ` : 'Submit the class report to Management? ';
      if (!confirm(text + 'You cannot edit after submitting.')) return;
      await Reports.submit(cls._id); toast('Submitted'); await draw();
    });

    mount(root,
      card(h('div', { class: 'row' }, classSel, statusTag(data.status), h('a', { class: 'btn ghost', href: '#/preview' }, 'Preview result sheets'))),
      data.status === 'returned' && data.note && h('div', { class: 'card error' }, h('b', {}, 'Returned by management: '), data.note),
      card(h('details', { open: true }, h('summary', {}, 'Preview all pupils'), preview)),
      pupils.map(p => pupilCard(p, cls, reports[p._id] ??= { b: [0, 0, 0, 0, 0], att: '', rem: '', st: '' }, editable, refreshPreview)),
      editable ? card(submit, h('p', { class: 'muted' }, 'Changes save automatically. You cannot edit after submitting.')) : card(h('p', { class: 'muted' }, `Locked: ${data.status}.`)));
  };
  await draw();
}

function pupilCard(pupil, cls, rep, editable, refreshPreview) {
  const save = () => run(null, async () => {
    const data = { b: rep.b, rem: rep.rem };
    if (rep.att !== '') data.att = rep.att;
    if (cls.level === 'secondary') data.st = rep.st;
    await Reports.save(pupil._id, data);
  }).then(refreshPreview);
  const rating = (label, i) => h('label', { class: 'field' }, h('span', { class: 'muted' }, label),
    h('select', { value: String(rep.b[i]), disabled: !editable, onchange: e => { rep.b[i] = +e.target.value; save(); } },
      options([[0, '–'], ...[5, 4, 3, 2, 1].map(n => [n, String(n)])])));
  return card(h('b', {}, pupil.name),
    h('div', { class: 'row' }, BEHAVIOUR.map(rating)),
    h('div', { class: 'row' },
      h('input', { type: 'number', inputmode: 'numeric', min: 0, placeholder: 'Days attended', value: rep.att, disabled: !editable, onchange: e => { rep.att = e.target.value === '' ? '' : Math.max(0, Math.round(+e.target.value)); e.target.value = rep.att; save(); } }),
      h('input', { class: 'grow', placeholder: "Form teacher's remark", value: rep.rem, disabled: !editable, onchange: e => { rep.rem = e.target.value; save(); } }),
      cls.level === 'secondary' && h('select', { value: rep.st, disabled: !editable, onchange: e => { rep.st = e.target.value; save(); } }, options(STATUSES.map(s => [s, s]), 'Status…'))));
}
