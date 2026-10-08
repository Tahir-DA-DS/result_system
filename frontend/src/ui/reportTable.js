// Overview of every pupil's class report so the form teacher can check it before submitting.
import { h } from './dom.js';
import { missingFields } from '../lib/reportCheck.js';

const SHORT = ['Attent.', 'Honesty', 'Neat', 'Coop.', 'Attitude'];

export function reportTable(pupils, reports, level) {
  const secondary = level === 'secondary';
  const cell = (value, missing) => h('td', { class: missing ? 'miss' : '' }, missing ? '—' : value);
  return h('div', { class: 'scroll' }, h('table', { class: 'tbl' },
    h('thead', {}, h('tr', {}, ['Pupil', ...SHORT, 'Days', 'Remark', secondary && 'Status'].filter(Boolean).map(t => h('th', {}, t)))),
    h('tbody', {}, pupils.map(p => {
      const rep = reports[p._id] || {}, b = rep.b || [], gaps = missingFields(rep, level);
      return h('tr', { class: gaps.length ? 'flag' : '' }, h('td', {}, p.name),
        SHORT.map((_, i) => cell(b[i], !b[i])), cell(rep.att, rep.att === '' || rep.att == null),
        h('td', { class: rep.rem ? '' : 'miss' }, rep.rem || '—'), secondary && cell(rep.st, !rep.st));
    }))));
}
