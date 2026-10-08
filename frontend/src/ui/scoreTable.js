// All pupils' scores for one subject (CA1, CA2, Exam, total, grade) with a summary and flagged pupils highlighted.
import { h } from './dom.js';
import { totalOf, gradeOf } from '../lib/grading.js';
import { findFlags } from '../lib/flags.js';

export function scoreTable(pupils, rows) {
  const flags = findFlags(pupils, rows);
  const totals = pupils.map(p => totalOf(rows[p._id])).filter(t => t != null);
  const summary = totals.length
    ? `Entered ${totals.length}/${pupils.length} · Highest ${Math.max(...totals)} · Lowest ${Math.min(...totals)} · Average ${(totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1)}`
    : `Entered 0/${pupils.length}`;
  const flagged = pupils.filter(p => flags[p._id]);

  const cell = v => h('td', {}, v ?? h('span', { class: 'miss' }, '–'));
  return h('div', {},
    h('p', { class: 'muted' }, summary),
    flagged.length > 0 && h('p', { class: 'warn' }, 'Look at: ', flagged.map(p => `${p.name} (${flags[p._id].join(', ')})`).join('; ')),
    h('div', { class: 'scroll' }, h('table', { class: 'tbl' },
      h('thead', {}, h('tr', {}, ['Pupil', 'CA1', 'CA2', 'Exam', 'Total', 'Grade'].map(t => h('th', {}, t)))),
      h('tbody', {}, pupils.map((p, i) => {
        const r = rows[p._id] || {}, total = totalOf(r);
        return h('tr', { class: flags[p._id] ? 'flag' : '' }, h('td', {}, `${i + 1}. ${p.name}`), cell(r.a), cell(r.b), cell(r.e), h('td', {}, h('b', {}, total ?? '–')), h('td', {}, gradeOf(total)));
      })))));
}
