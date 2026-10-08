// Marks, grades, averages, positions. All calculations for the result sheets happen here.
const { SC } = require('../lib/constants');
const { sid } = require('../lib/errors');

const gr = t => SC.find(s => t >= s[0]);   // [minimum, letter, remark] for a total
const tot = w => w && (w.a != null || w.b != null || w.e != null) ? (w.a || 0) + (w.b || 0) + (w.e || 0) : null;
const termIdx = t => /first/i.test(t || '') ? 1 : /second/i.test(t || '') ? 2 : /third/i.test(t || '') ? 3 : 0;
function compute(c, L, sheets, reps, term) {
  const sh = new Map(sheets.map(x => [sid(x.subject), x])), rp = new Map(reps.map(x => [sid(x.student), x])), ti = termIdx(term.term);
  const cols = c.subjects.map(s => { const rows = (sh.get(sid(s)) || {}).rows || {}, t = L.map(x => tot(rows[sid(x)])).filter(v => v != null);
    return { s, rows, hi: t.length ? Math.max(...t) : null, lo: t.length ? Math.min(...t) : null }; });
  const P = L.map(x => {
    let obt = 0, n = 0;
    const rows = cols.map(z => { const w = z.rows[sid(x)], t = tot(w); if (t == null) return { subject: z.s.name }; obt += t; n++; const g = gr(t);
      return { subject: z.s.name, a: w.a, b: w.b, e: w.e, total: t, hi: z.hi, lo: z.lo, grade: g[1], remark: g[2] }; });
    const rep = rp.get(sid(x)) || {}, avg = n ? +(obt / n).toFixed(1) : null, old = x.avg || {};
    return { id: sid(x), name: x.name, adm: x.adm, rows, obtainable: n * 100, obtained: obt, average: avg,
      report: { b: rep.b || [0, 0, 0, 0, 0], att: rep.att, rem: rep.rem || '', prin: rep.prin || '', st: rep.st || '' },
      terms: [1, 2, 3].map(k => k === ti ? avg : k < ti ? (old['t' + k] ?? null) : null) };
  });
  const rk = P.filter(p => p.average != null).map(p => p.average).sort((a, b) => b - a);
  P.forEach(p => { p.position = p.average == null ? null : rk.indexOf(p.average) + 1; p.classSize = P.length; });
  return P;
}

module.exports = { gr, tot, termIdx, compute };
