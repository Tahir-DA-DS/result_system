// Approve / Return / Unlock buttons for a sheet or class report. `call(action, note)` talks to the server.
import { h } from './dom.js';
import { run, toast } from './feedback.js';

export function reviewButtons(status, isAdmin, call, refresh) {
  const act = (label, action, cls, askReason) => h('button', { class: 'btn ' + cls, onclick: ev => run(ev.target, async () => {
    let note = '';
    if (askReason) { note = prompt(askReason) || ''; if (!note.trim()) return; }
    await call(action, note);
    toast(label + ' done');
    await refresh();
  }) }, label);
  if (status === 'submitted') return [act('Approve', 'approve', '', null), act('Return', 'return', 'danger', 'Reason for returning (the teacher will see this):')];
  if (status === 'approved' && isAdmin) return [act('Unlock', 'unlock', 'ghost', 'Reason for unlocking:')];
  return [];
}
