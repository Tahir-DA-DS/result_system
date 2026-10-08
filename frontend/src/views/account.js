import { h, card, field } from '../ui/dom.js';
import { run, toast } from '../ui/feedback.js';
import { Auth } from '../api/endpoints.js';
import { session } from '../state/session.js';

export function render(root) {
  const current = h('input', { type: 'password', autocomplete: 'current-password' });
  const next = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'At least 8 characters' });
  const save = h('button', { class: 'btn' }, 'Change password');
  save.onclick = () => run(save, async () => {
    await Auth.changePassword(current.value, next.value);
    current.value = next.value = '';
    toast('Password changed');
  });
  root.append(card(h('h3', {}, session.user.name), h('p', { class: 'muted' }, `${session.user.email} · ${session.user.role}`),
    field('Current password', current), field('New password', next), save));
}
