// Form teacher (and management): the result sheets as they stand now, marked DRAFT. Nothing here can be printed as final.
import { h, card, options, mount } from '../ui/dom.js';
import { Classes, Preview } from '../api/endpoints.js';
import { session } from '../state/session.js';
import { isFormTeacher } from '../lib/access.js';
import { buildSheet } from '../print/sheet.js';
import { wrapForPreview, fitSheets } from '../print/preview.js';
import { ensureSheetStyles } from '../print/styles.js';

let selected = '', pupilId = 'all';

export async function render(root) {
  ensureSheetStyles();
  const me = session.user;
  const all = await Classes.list();
  const classes = me.role === 'teacher' ? all.filter(c => isFormTeacher(c, me.id)) : all;
  if (!classes.length) return root.append(card('You are not the form teacher of any class.'));
  if (!classes.some(c => c._id === selected)) selected = classes[0]._id;

  const draw = async () => {
    const data = await Preview.draft(selected);
    if (pupilId !== 'all' && !data.pupils.some(p => p.id === pupilId)) pupilId = 'all';
    const classSel = h('select', { value: selected, onchange: e => { selected = e.target.value; pupilId = 'all'; draw(); } }, options(classes.map(c => [c._id, c.name])));
    const pupilSel = h('select', { value: pupilId, onchange: e => { pupilId = e.target.value; draw(); } }, options([['all', `Whole class (${data.pupils.length})`], ...data.pupils.map(p => [p.id, p.name])]));
    const controls = card(h('div', { class: 'row' }, classSel, pupilSel, h('a', { class: 'btn ghost', href: '#/report' }, 'Back to class report')),
      h('p', { class: 'muted' }, "Preview only. Subjects that have not been submitted yet and the principal's remark are blank. Management prints the final sheets after approval."));
    controls.classList.add('noprint');
    const sheets = h('div', {}, wrapForPreview(data.pupils.filter(p => pupilId === 'all' || p.id === pupilId).map(p => buildSheet(p, data.class, data.term, { draft: true }))));
    mount(root, controls, sheets);
    fitSheets(sheets);
    onresize = () => fitSheets(sheets);
  };
  await draw();
}
