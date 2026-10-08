// Read-only views built from live data: the draft result sheets (form teacher) and the class broadsheet (management).
const { Cfg } = require('../models');
const classStatus = require('./classStatus');
const { compute } = require('./grading');
const { canSee } = require('./broadsheet');
const { isM } = require('../lib/permissions');
const { sid } = require('../lib/errors');

const termSettings = async () => ((await Cfg.findById('term')) || {}).v || {};
const classInfo = c => ({ id: c._id, name: c.name, level: c.level });

// Result sheets as they would look now, using only the subjects this user may see. The principal's remark stays blank for non-management.
async function draftResults(cls, user) {
  const { L, sheets, reps } = await classStatus(cls), term = await termSettings();
  const visible = sheets.filter(sh => { const s = cls.subjects.find(x => sid(x) === sid(sh.subject)); return s && canSee(user, cls, s, sh.status); });
  const pupils = compute(cls, L, visible, reps, term);
  if (!isM(user)) pupils.forEach(p => { p.report.prin = ''; });
  return { term, class: classInfo(cls), draft: true, pupils };
}

// Pupils x subjects totals with obtained, average and position, plus each subject's highest, lowest and average.
async function mastersheet(cls) {
  const { L, sheets, reps } = await classStatus(cls), term = await termSettings();
  const pupils = compute(cls, L, sheets, reps, term);
  const subjects = cls.subjects.map((s, i) => {
    const totals = pupils.map(p => p.rows[i].total).filter(v => v != null);
    return { name: s.name, highest: totals.length ? Math.max(...totals) : null, lowest: totals.length ? Math.min(...totals) : null,
      average: totals.length ? +(totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1) : null };
  });
  return { term, class: classInfo(cls), subjects,
    pupils: pupils.map(p => ({ id: p.id, name: p.name, scores: p.rows.map(r => r.total ?? null), obtained: p.obtained, average: p.average, position: p.position })) };
}

module.exports = { draftResults, mastersheet };
