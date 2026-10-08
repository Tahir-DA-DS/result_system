// Management: who submitted, approved, returned or unlocked what, and when (including closed terms).
import { h, card, options, mount } from '../ui/dom.js';
import { History } from '../api/endpoints.js';

const WORDS = { submit: 'submitted', approve: 'approved', return: 'returned', unlock: 'unlocked' };
let filter = '';

export async function render(root) {
  const events = await History.list();
  const classNames = [...new Set(events.map(e => e.class))].sort();
  const draw = () => {
    const shown = events.filter(e => !filter || e.class === filter);
    const pick = h('select', { value: filter, onchange: e => { filter = e.target.value; draw(); } }, options(classNames.map(c => [c, c]), 'All classes'));
    mount(root, card(pick), card(h('h3', {}, `${shown.length} event(s)`), shown.length === 0 && h('p', { class: 'muted' }, 'Nothing recorded yet.'),
      h('div', { class: 'scroll' }, h('table', { class: 'tbl' },
        h('thead', {}, h('tr', {}, ['When', 'Who', 'What', 'Class and subject', 'Reason'].map(t => h('th', {}, t)))),
        h('tbody', {}, shown.map(e => h('tr', {}, h('td', {}, new Date(e.at).toLocaleString()), h('td', {}, e.byName),
          h('td', {}, WORDS[e.action] || e.action), h('td', {}, `${e.class} · ${e.subject}${e.term ? ` (${e.term})` : ''}`), h('td', {}, e.note))))))));
  };
  draw();
}
