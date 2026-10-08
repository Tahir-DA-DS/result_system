// Reprint results from closed terms (exactly as they were when the term was closed).
import { h, card, options, mount } from '../ui/dom.js';
import { run } from '../ui/feedback.js';
import { Archive } from '../api/endpoints.js';
import { buildSheet } from '../print/sheet.js';
import { wrapForPreview, fitSheets } from '../print/preview.js';
import { downloadSheets } from '../print/download.js';
import { ensureSheetStyles } from '../print/styles.js';

let termIndex = 0, classId = '', pupilId = 'all';

export async function render(root) {
  ensureSheetStyles();
  const list = await Archive.list();
  if (!list.length) return root.append(card('Nothing is archived yet. Results appear here when a term is closed.'));
  if (termIndex >= list.length) termIndex = 0;

  const draw = async () => {
    const entry = list[termIndex];
    if (!entry.classes.some(c => c.id === classId)) classId = entry.classes[0].id;
    const data = await Archive.results(entry.session, entry.term, classId);
    if (pupilId !== 'all' && !data.pupils.some(p => p.id === pupilId)) pupilId = 'all';
    const makeSheets = () => data.pupils.filter(p => pupilId === 'all' || p.id === pupilId).map(p => buildSheet(p, data.class, data.term));

    const termSel = h('select', { value: String(termIndex), onchange: e => { termIndex = +e.target.value; classId = ''; pupilId = 'all'; draw(); } },
      options(list.map((t, i) => [String(i), `${t.term} Term ${t.session}`])));
    const classSel = h('select', { value: classId, onchange: e => { classId = e.target.value; pupilId = 'all'; draw(); } },
      options(entry.classes.map(c => [c.id, c.name + (c.complete ? '' : ' (incomplete)')])));
    const pupilSel = h('select', { value: pupilId, onchange: e => { pupilId = e.target.value; draw(); } },
      options([['all', `Whole class (${data.pupils.length})`], ...data.pupils.map(p => [p.id, p.name])]));
    const button = (label, cls, fn) => { const b = h('button', { class: 'btn ' + cls }, label); b.onclick = () => run(b, fn); return b; };

    const controls = card(h('div', { class: 'row' }, termSel, classSel, pupilSel),
      !data.complete && h('p', { class: 'warn' }, 'This class was archived before it was fully approved, so some marks or remarks may be missing.'),
      h('div', { class: 'row' }, button('Print', '', async () => print()),
        button('Download file', 'ghost', () => downloadSheets(makeSheets(), `${data.class.name} ${entry.term} Term ${entry.session}`))));
    controls.classList.add('noprint');

    const sheets = h('div', {}, wrapForPreview(makeSheets()));
    mount(root, controls, sheets);
    fitSheets(sheets);
    onresize = () => fitSheets(sheets);
  };
  await draw();
}
