// Admin: classes, form teachers, subjects and which teacher takes each subject.
import { h, card, field, options, mount } from '../ui/dom.js';
import { run, toast } from '../ui/feedback.js';
import { Classes, Users } from '../api/endpoints.js';

const LEVELS = [['nursery', 'Nursery'], ['primary', 'Primary'], ['secondary', 'Secondary']];
const open = new Set();   // remembers which classes are expanded across redraws

export async function render(root) {
  const draw = async () => {
    const [classes, users] = await Promise.all([Classes.list(), Users.list()]);
    const staff = users.filter(u => u.active).map(u => [u._id, u.name]);
    mount(root,
      !classes.length && card(h('h3', {}, 'Quick start'), h('p', { class: 'muted' }, 'Creates Nursery 1–3, Primary 1–6, JSS 1–3 and SS 1–3 with the subjects from your result sheets.'),
        button('Create default classes', async () => { await Classes.seedDefaults(); await draw(); })),
      classes.map(c => classCard(c, staff, draw, classes)),
      addClass(draw));
  };
  await draw();
}

function button(label, fn, cls = 'btn') {
  const b = h('button', { class: cls }, label);
  b.onclick = () => run(b, fn);
  return b;
}

function classCard(c, staff, redraw, allClasses) {
  const subjects = c.subjects.map(s => ({ _id: s._id, name: s.name, teacher: s.teacher || '' }));  // local copy being edited
  const formTeacher = h('select', { value: c.formTeacher || '' }, options(staff, '— none —'));
  const nextSel = h('select', { value: c.next || '' }, options(allClasses.filter(x => x._id !== c._id).map(x => [x._id, x.name]), '— graduates (leaves school) —'));
  const list = h('div');
  const drawSubjects = () => mount(list, subjects.map((s, i) => h('div', { class: 'row' },
    h('input', { class: 'grow', value: s.name, oninput: e => { s.name = e.target.value; } }),
    h('select', { value: s.teacher, onchange: e => { s.teacher = e.target.value; } }, options(staff, '— no teacher —')),
    h('button', { class: 'btn danger', onclick: () => { subjects.splice(i, 1); drawSubjects(); } }, '✕'))));
  drawSubjects();

  const newName = h('input', { placeholder: 'New subject' });
  const addSubject = h('button', { class: 'btn ghost', onclick: () => { if (newName.value.trim()) { subjects.push({ name: newName.value.trim(), teacher: '' }); newName.value = ''; drawSubjects(); } } }, 'Add subject');

  const details = h('details', { open: open.has(c._id), ontoggle: e => (e.target.open ? open.add(c._id) : open.delete(c._id)) },
    h('summary', {}, c.name, ' ', h('span', { class: 'tag' }, c.level), ' ', h('span', { class: 'muted' }, `${c.subjects.length} subjects`)),
    field('Form teacher', formTeacher), field('Promotes to (end of session)', nextSel), h('p', { class: 'muted' }, 'Subjects and their teachers'), list,
    h('div', { class: 'row' }, newName, addSubject),
    h('div', { class: 'row' },
      button('Save class', async () => { await Classes.update(c._id, { formTeacher: formTeacher.value, next: nextSel.value, subjects }); toast('Saved'); await redraw(); }),
      button('Delete class', async () => { if (confirm(`Delete ${c.name}?`)) { await Classes.remove(c._id); await redraw(); } }, 'btn danger')));
  return card(details);
}

function addClass(redraw) {
  const name = h('input', { placeholder: 'Class name, e.g. Primary 4B' });
  const level = h('select', {}, options(LEVELS));
  return card(h('h3', {}, 'Add class'), h('div', { class: 'row' }, name, level, button('Add', async () => { await Classes.create(name.value, level.value); await redraw(); })));
}
