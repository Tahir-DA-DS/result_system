// Builds one pupil's result sheet as DOM. Data comes ready-calculated from the server (/classes/:id/results).
import { h } from '../ui/dom.js';
import { borderElement } from './border.js';

const BEHAVIOUR = ['Attentiveness', 'Honesty', 'Neatness', 'Cooperation with others', 'Attitude to Academic work'];
const SCALE = [['A', '70-100', 'Excellent'], ['B', '60-69', 'Very Good'], ['C', '50-59', 'Good'], ['D', '40-49', 'Credit'], ['E', '30-39', 'Fair'], ['F', 'Below 30', 'Poor']];
const MIN_ROWS = { nursery: 17, primary: 19, secondary: 17 };   // blank rows are added up to this, like the paper sheets
const COLS = [23, 8, 8, 8, 9, 9, 9, 9, 17];

const ordinal = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'));
const line = (label, value) => h('div', {}, h('span', {}, label), h('span', { class: 'fill' }, value ?? ''));
const info = (flex, label, value) => h('span', { style: `flex:${flex}` }, label, h('span', { class: 'l fill' }, value ?? ''));
const sup = (n, s) => [n, h('sup', {}, s)];

export function buildSheet(pupil, cls, term, { draft = false } = {}) {
  const secondary = cls.level === 'secondary';
  const rep = pupil.report;

  const body = Array.from({ length: Math.max(MIN_ROWS[cls.level] || 17, pupil.rows.length) }, (_, i) => {
    const r = pupil.rows[i];
    const scored = r && r.total != null;
    return h('tr', {}, h('td', {}, r?.subject || ''),
      scored ? [r.a, r.b, r.e, r.total, r.hi, r.lo, r.grade, r.remark].map(v => h('td', { class: 'f' }, v ?? '')) : Array.from({ length: 8 }, () => h('td')));
  });

  const behaviour = BEHAVIOUR.map((label, i) => h('tr', {}, h('td', {}, label), [5, 4, 3, 2, 1].map(v => h('td', { class: 'f' }, rep.b[i] === v ? '✓' : ''))));

  const avgLine = h('div', { class: 'nb', style: 'gap:6mm' },
    h('span', {}, ...sup('1', 'st'), ' Term Average: ', h('span', { class: 'fill' }, pupil.terms[0] ?? '')),
    h('span', {}, ...sup('2', 'nd'), ' Term Average: ', h('span', { class: 'fill' }, pupil.terms[1] ?? '')),
    h('span', {}, ...sup('3', 'rd'), ' Term Average: ', h('span', { class: 'fill' }, pupil.terms[2] ?? '')));
  const footer = secondary
    ? [avgLine, line('Status:', rep.st), line("Manager's Remark:", rep.rem), line('Times School Open:', term.open), line('Times Pupil Attended:', rep.att), line("Principal's Remark:", rep.prin), line('Date:', term.date)]
    : [avgLine, line("Form Teacher's Remark:", rep.rem), line('Times School Open:', term.open), line('Days of Attendance:', rep.att),
       line((cls.level === 'nursery' ? "Head Teacher's" : "Principal's") + ' Remark:', rep.prin)];

  const termName = (term.term || '').replace(/\s*term$/i, '').toUpperCase();
  const th = (...kids) => h('th', {}, ...kids);

  return h('div', { class: 'sheet' },
    borderElement(), h('div', { class: 'lg wm' }), draft && h('div', { class: 'draftmark' }, 'DRAFT'),
    h('div', { class: 'in' },
      h('div', { class: 'hd' }, h('div', { class: 'lg hl', style: 'flex:0 0 27mm' }),
        h('div', {}, h('div', { class: 'nm' }, 'BRIGHT HILLS ACADEMY'), h('div', { class: 'sub' }, 'CRECHE, NURSERY, PRIMARY & SECONDARY SCHOOL'),
          h('div', { class: 'ad' }, 'Address: ', h('i', {}, '30 Hussein Mansur Crescent, APC 1 Quarters Suleja, Niger State'), h('br'),
            'Tel. ', h('i', {}, '+2348103668136, +2347013303424'), h('br'), 'Email Address: ', h('i', {}, 'academybrighthills@gmail.com'), h('br'),
            'MOTTO: ', h('i', {}, 'Grooming Talents for a Brighter Future')))),
      h('div', { class: 'ttl' }, `${termName} TERM RESULT SHEET ${term.session || ''} ${secondary ? 'ACADEMIC' : 'ACADEMY'} SESSION`),
      h('div', { class: 'inf' }, info(3, 'Name:', pupil.name.toUpperCase()), info(2, 'Admission number:', pupil.adm), info(1, 'CLASS:', cls.name)),
      h('div', { class: 'inf' }, info(1, 'Resumed Date:', term.resumed), info(1, 'Vacated:', term.vacated), info(1.2, 'Resumption Date:', term.resumption)),
      h('table', { class: 'gt' }, h('colgroup', {}, COLS.map(w => h('col', { style: `width:${w}%` }))),
        h('tr', {}, th('SUBJECTS'), th(...sup('1', 'st'), ' CA', h('br'), '20', h('br'), 'MARKS'), th(...sup('2', 'nd'), ' CA', h('br'), '20', h('br'), 'MARKS'),
          th('Exam', h('br'), '60', h('br'), 'MARKS'), th('TOTAL SCORES', h('br'), '100 MARKS'), th('HIGHEST SCORE'), th('LOWEST SCORE'), th('GRADES'), th('REMARKS')), body),
      h('div', { class: 'tot' },
        h('span', {}, 'Mark Obtainable = ', h('span', { class: 'fill' }, pupil.obtainable)),
        h('span', {}, 'Mark Obtained = ', h('span', { class: 'fill' }, pupil.obtained)),
        term.pos === 'yes' && pupil.position && h('span', {}, 'Position = ', h('span', { class: 'fill' }, `${ordinal(pupil.position)} of ${pupil.classSize}`)),
        h('span', {}, 'Average = ', h('span', { class: 'fill' }, pupil.average ?? ''))),
      h('div', { class: 'mid' },
        h('div', { class: 'beh' }, h('h4', {}, 'BEHAVIOUR/AFFECTIVE DOMAIN'), h('table', {}, h('tr', {}, th(), [5, 4, 3, 2, 1].map(v => h('th', { style: 'width:7mm' }, v))), behaviour)),
        h('div', { class: 'scl' }, h('h4', {}, 'SCALE'), h('table', {}, SCALE.map(s => h('tr', {}, h('td', {}, s[0]), h('td', {}, `(${s[1]})`), h('td', {}, s[2])))))),
      h('div', { class: 'ft' }, footer), h('div', { class: 'stamp' }, 'Sign/Stamp:')));
}
