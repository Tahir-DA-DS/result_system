// Admin: create staff accounts, set roles, deactivate, reset passwords.
import { h, card, field, options, mount } from '../ui/dom.js';
import { run, toast } from '../ui/feedback.js';
import { Users } from '../api/endpoints.js';
import { session } from '../state/session.js';

const ROLES = [['teacher', 'Teacher'], ['management', 'Management'], ['admin', 'Admin']];

export async function render(root) {
  const draw = async () => mount(root, addForm(draw), listCard(await Users.list(), draw));
  await draw();
}

function addForm(redraw) {
  const name = h('input', { placeholder: 'Full name' });
  const email = h('input', { type: 'email', placeholder: 'Email' });
  const password = h('input', { type: 'text', placeholder: 'Temporary password (8+ characters)' });
  const role = h('select', {}, options(ROLES));
  const add = h('button', { class: 'btn' }, 'Add staff');
  add.onclick = () => run(add, async () => {
    await Users.create({ name: name.value, email: email.value, password: password.value, role: role.value });
    toast('Staff added. Share the email and temporary password with them.');
    await redraw();
  });
  return card(h('h3', {}, 'Add staff'), field('Name', name), field('Email', email), field('Temporary password', password), field('Role', role), add);
}

function listCard(users, redraw) {
  return card(h('h3', {}, `Staff (${users.length})`), users.map(u => {
    const me = u._id === session.user.id;
    const role = h('select', { value: u.role, disabled: me, onchange: e => run(null, async () => { await Users.update(u._id, { role: e.target.value }); toast('Role updated'); }) }, options(ROLES));
    const toggle = h('button', { class: 'btn ghost', disabled: me, onclick: ev => run(ev.target, async () => { await Users.update(u._id, { active: !u.active }); await redraw(); }) }, u.active ? 'Deactivate' : 'Activate');
    const reset = h('button', { class: 'btn ghost', onclick: ev => run(ev.target, async () => {
      const password = prompt(`New temporary password for ${u.name} (8+ characters):`);
      if (password) { await Users.update(u._id, { password }); toast('Password reset'); }
    }) }, 'Reset password');
    return h('div', { class: 'row' + (u.active ? '' : ' off') }, h('div', { class: 'grow' }, h('b', {}, u.name), h('br'), h('span', { class: 'muted' }, u.email + (u.active ? '' : ' · inactive'))), role, toggle, reset);
  }));
}
