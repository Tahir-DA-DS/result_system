// Management: the class broadsheet (all totals in one table), printable.
import { h, card, options, mount } from '../ui/dom.js';
import { run } from '../ui/feedback.js';
import { Classes, Mastersheet } from '../api/endpoints.js';
import { buildMastersheet } from '../print/mastersheet.js';
import { ensureSheetStyles } from '../print/styles.js';

let selected = '';

export async function render(root) {
  ensureSheetStyles();
  const classes = await Classes.list();
  if (!classes.length) return root.append(card('No classes yet.'));
  if (!classes.some(c => c._id === selected)) selected = classes[0]._id;

  const draw = async () => {
    const data = await Mastersheet.get(selected);
    const classSel = h('select', { value: selected, onchange: e => { selected = e.target.value; draw(); } }, options(classes.map(c => [c._id, c.name])));
    const printBtn = h('button', { class: 'btn' }, 'Print');
    printBtn.onclick = () => run(printBtn, async () => print());
    const controls = card(h('div', { class: 'row' }, classSel, printBtn, h('a', { class: 'btn ghost', href: '#/print' }, 'Back to result sheets')),
      h('p', { class: 'muted' }, 'Shows everything entered so far, including subjects not yet approved. For the best fit, choose Landscape in the print dialog.'));
    controls.classList.add('noprint');
    mount(root, controls, buildMastersheet(data));
  };
  await draw();
}
