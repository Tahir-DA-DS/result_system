// The class broadsheet: one row per pupil, one column per subject (totals), plus total, average and position.
import { h } from '../ui/dom.js';

const ordinal = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'));

export function buildMastersheet({ term, class: cls, subjects, pupils }) {
  const termName = (term.term || '').replace(/\s*term$/i, '');
  const stat = (label, key) => h('tr', {}, h('td', { class: 'name' }, label), subjects.map(s => h('td', {}, s[key] ?? '')), h('td', { colspan: 3 }));
  return h('div', { class: 'master' },
    h('h2', {}, `BRIGHT HILLS ACADEMY – ${cls.name} BROADSHEET`),
    h('p', { class: 'sub' }, `${termName} Term ${term.session || ''}`),
    h('table', {},
      h('thead', {}, h('tr', {}, h('th', {}, 'Pupil'), subjects.map(s => h('th', { class: 'rot' }, s.name)), h('th', {}, 'Total'), h('th', {}, 'Average'), h('th', {}, 'Position'))),
      h('tbody', {}, pupils.map((p, i) => h('tr', {}, h('td', { class: 'name' }, `${i + 1}. ${p.name}`), p.scores.map(v => h('td', {}, v ?? '')),
        h('td', {}, p.obtained), h('td', {}, p.average ?? ''), h('td', {}, p.position ? ordinal(p.position) : '')))),
      h('tfoot', {}, stat('Highest', 'highest'), stat('Lowest', 'lowest'), stat('Class average', 'average'))));
}
