// New session: choose promote / repeat / leave for every pupil, then start the new session. Available after the Third Term is closed.
import { h, card, field, options } from '../../ui/dom.js';
import { run, toast } from '../../ui/feedback.js';
import { Classes, Promotion } from '../../api/endpoints.js';

const CHOICES = [['promote', 'Promote'], ['repeat', 'Repeat class'], ['leave', 'Leave school']];

export async function promotionCard(refresh) {
  const data = await Promotion.preview();
  if (!data.termClosed) return card(h('h3', {}, 'New session and promotion'), h('p', { class: 'muted' }, 'Available after the Third Term has been closed.'));

  const choice = {};   // pupil id -> action, starting from the suggested default ("repeat" if their status was Repeated)
  data.classes.forEach(c => c.pupils.forEach(p => { choice[p.id] = p.defaultAction; }));
  const session = h('input', { placeholder: 'New session, e.g. 2026/2027' });
  const missingNext = data.classes.filter(c => !c.next).length;

  const autoNext = h('button', { class: 'btn ghost' }, 'Set promotion order automatically');
  autoNext.onclick = () => run(autoNext, async () => { await Classes.autoNext(); await refresh(); });
  const start = h('button', { class: 'btn' }, 'Start new session');
  start.onclick = () => run(start, async () => {
    const counts = Object.values(choice).reduce((n, a) => ({ ...n, [a]: (n[a] || 0) + 1 }), {});
    const text = `Promote ${counts.promote || 0}, repeat ${counts.repeat || 0}, leave school ${counts.leave || 0}.\n\nThis moves the pupils and clears their old term averages. Continue?`;
    if (!session.value.trim() || !confirm(text)) return;
    const res = await Promotion.run(session.value.trim(), Object.entries(choice).map(([student, action]) => ({ student, action })));
    toast(`Done: ${res.promoted} promoted, ${res.repeated} repeating, ${res.left} left. First Term has started.`);
    await refresh();
  });

  return card(h('h3', {}, 'New session and promotion'),
    h('p', { class: 'muted' }, 'Pupils whose Third Term status was "Repeated" start as "Repeat class". Change any pupil below, then start the session.'),
    missingNext > 0 && h('p', { class: 'warn' }, `${missingNext} class(es) have no "promotes to" class, so their pupils would leave school. Set it on the Classes tab, or use the automatic order.`),
    h('div', { class: 'row' }, autoNext),
    data.classes.map(c => h('details', {},
      h('summary', {}, `${c.name} → ${c.next ? c.next.name : 'leaves school'} `, h('span', { class: 'muted' }, `${c.pupils.length} pupils`)),
      c.pupils.map(p => h('div', { class: 'row' }, h('div', { class: 'grow' }, p.name),
        h('select', { value: choice[p.id], onchange: e => { choice[p.id] = e.target.value; } }, options(CHOICES)))))),
    field('New session', session), h('div', { class: 'row' }, start));
}
