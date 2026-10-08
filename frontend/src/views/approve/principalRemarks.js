// Principal's remark per pupil (management only), with suggestions, "same for all", and Status for secondary classes.
import { h, card, options } from '../../ui/dom.js';
import { run, toast } from '../../ui/feedback.js';
import { Reports } from '../../api/endpoints.js';
import { suggestRemark } from '../../lib/remarks.js';

const STATUSES = ['Promoted', 'Promoted on trial', 'Repeated'];

export function principalRemarks({ cls, pupils, reports, averages, refresh }) {
  const saved = Object.fromEntries(reports.map(r => [r.student, r]));
  const average = Object.fromEntries(averages.map(a => [a.id, a.average]));
  const save = items => Reports.principal(cls._id, items);

  const fill = h('button', { class: 'btn ghost' }, 'Fill suggestions');
  fill.onclick = () => run(fill, async () => {
    const items = pupils.filter(p => !saved[p._id]?.prin && average[p._id] != null).map(p => ({ student: p._id, prin: suggestRemark(average[p._id]) }));
    if (items.length) await save(items);
    toast(`${items.length} remark(s) filled`);
    await refresh();
  });
  const same = h('button', { class: 'btn ghost' }, 'Same remark for all');
  same.onclick = () => run(same, async () => {
    const text = prompt('Remark for every pupil in this class:');
    if (!text) return;
    await save(pupils.map(p => ({ student: p._id, prin: text })));
    await refresh();
  });

  return card(h('h3', {}, `Principal's remark${cls.level === 'secondary' ? ' and status' : ''}`), h('div', { class: 'row' }, fill, same),
    pupils.map(p => {
      const avg = average[p._id];
      return h('div', { class: 'pupil' }, h('b', {}, p.name), ' ', h('span', { class: 'muted' }, `average ${avg == null ? '–' : avg}`),
        h('div', { class: 'row' },
          h('input', { class: 'grow', value: saved[p._id]?.prin || '', placeholder: suggestRemark(avg) || "Principal's remark",
            onchange: e => run(null, async () => { await save([{ student: p._id, prin: e.target.value }]); toast('Saved'); }) }),
          cls.level === 'secondary' && h('select', { value: saved[p._id]?.st || '',
            onchange: e => run(null, async () => { await save([{ student: p._id, st: e.target.value }]); toast('Status saved'); }) }, options(STATUSES.map(s => [s, s]), 'Status…'))));
    }));
}
