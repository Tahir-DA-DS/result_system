// Management: preview and print approved result sheets (one pupil or the whole class), download them, save term averages.
import { h, card, options, mount } from '../ui/dom.js';
import { run, toast } from '../ui/feedback.js';
import { Classes, Results } from '../api/endpoints.js';
import { readiness } from './approve/sheetReviews.js';
import { buildSheet } from '../print/sheet.js';
import { wrapForPreview, fitSheets } from '../print/preview.js';
import { downloadSheets } from '../print/download.js';
import { ensureSheetStyles } from '../print/styles.js';

let selectedClass = '', selectedPupil = 'all';

export async function render(root) {
  ensureSheetStyles();
  const classes = await Classes.list();
  if (!classes.length) return root.append(card('No classes yet.'));
  if (!classes.some(c => c._id === selectedClass)) selectedClass = classes[0]._id;

  const draw = async () => {
    const data = await Results.full(selectedClass);
    const pupils = data.pupils || [];
    if (selectedPupil !== 'all' && !pupils.some(p => p.id === selectedPupil)) selectedPupil = 'all';
    const shown = pupils.filter(p => selectedPupil === 'all' || p.id === selectedPupil);
    const makeSheets = () => shown.map(p => buildSheet(p, data.class, data.term));

    const classSel = h('select', { value: selectedClass, onchange: e => { selectedClass = e.target.value; selectedPupil = 'all'; draw(); } }, options(classes.map(c => [c._id, c.name])));
    const pupilSel = h('select', { value: selectedPupil, onchange: e => { selectedPupil = e.target.value; draw(); } },
      options([['all', `Whole class (${pupils.length})`], ...pupils.map(p => [p.id, p.name])]));
    const button = (label, cls, fn) => { const b = h('button', { class: 'btn ' + cls }, label); b.onclick = () => run(b, fn); return b; };

    const controls = card(h('div', { class: 'row' }, classSel, data.status.ready && pupilSel, h('a', { class: 'btn ghost', href: '#/mastersheet' }, 'Class broadsheet')), readiness(data.status),
      data.status.ready && [
        h('div', { class: 'row' },
          button('Print', '', async () => print()),
          button('Download file', 'ghost', () => downloadSheets(makeSheets(), `${data.class.name} results`)),
          button('Save term averages', 'ghost', async () => {
            if (!confirm("Save this term's averages for this class? They will appear on later terms' sheets.")) return;
            await Results.saveAverages(selectedClass); toast('Averages saved');
          })),
        h('p', { class: 'muted' }, `Position in class is ${data.term.pos === 'yes' ? 'ON' : 'off'} (change it in Approve, Term settings). To make a PDF, choose Print, then Save as PDF as the printer.`)]);
    controls.classList.add('noprint');

    const sheets = h('div', {}, wrapForPreview(makeSheets()));
    mount(root, controls, sheets);
    fitSheets(sheets);
    addEventListener('resize', () => fitSheets(sheets));
  };
  await draw();
}
