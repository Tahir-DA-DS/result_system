// Admin: pupils per class. Add one, paste a list, edit or remove.
import { h, card, options, mount } from '../ui/dom.js';
import { run, toast } from '../ui/feedback.js';
import { Classes, Students } from '../api/endpoints.js';

let selected = '';

export async function render(root) {
  const classes = await Classes.list();
  if (!classes.length) return root.append(card('Create classes first (Classes tab).'));
  if (!classes.some(c => c._id === selected)) selected = classes[0]._id;

  const draw = async () => {
    const pupils = await Students.list(selected);
    const pick = h('select', { value: selected, onchange: e => { selected = e.target.value; draw(); } }, options(classes.map(c => [c._id, c.name])));
    mount(root, card(pick), addCard(draw), listCard(pupils, draw));
  };
  await draw();
}

function addCard(redraw) {
  const name = h('input', { placeholder: 'Full name' });
  const adm = h('input', { placeholder: 'Admission no.' });
  const bulk = h('textarea', { rows: 4, placeholder: 'David Steven, BHA/20/0014\nMary John, BHA/20/0015' });
  const addOne = h('button', { class: 'btn' }, 'Add');
  addOne.onclick = () => run(addOne, async () => { await Students.add(selected, [{ name: name.value, adm: adm.value }]); await redraw(); });
  const addAll = h('button', { class: 'btn ghost' }, 'Add all');
  addAll.onclick = () => run(addAll, async () => {
    const list = bulk.value.split('\n').map(l => l.split(',').map(s => s.trim())).filter(p => p[0]).map(([name, adm]) => ({ name, adm: adm || '' }));
    if (!list.length) return;
    await Students.add(selected, list);
    toast(`${list.length} pupils added`);
    await redraw();
  });
  return card(h('h3', {}, 'Add pupils'), h('div', { class: 'row' }, name, adm, addOne),
    h('p', { class: 'muted' }, 'Or paste a list, one pupil per line: Name, Admission number'), bulk, h('div', { class: 'row' }, addAll));
}

function listCard(pupils, redraw) {
  return card(h('h3', {}, `${pupils.length} pupils`), pupils.map((p, i) => h('div', { class: 'row' },
    h('div', { class: 'grow' }, `${i + 1}. `, h('b', {}, p.name), h('br'), h('span', { class: 'muted' }, p.adm || 'no admission number')),
    h('button', { class: 'btn ghost', onclick: ev => run(ev.target, async () => {
      const name = prompt('Full name:', p.name); if (name === null) return;
      const adm = prompt('Admission number:', p.adm); if (adm === null) return;
      await Students.update(p._id, { name, adm }); await redraw();
    }) }, 'Edit'),
    h('button', { class: 'btn danger', onclick: ev => run(ev.target, async () => { if (confirm(`Remove ${p.name}?`)) { await Students.remove(p._id); await redraw(); } }) }, 'Remove'))));
}
