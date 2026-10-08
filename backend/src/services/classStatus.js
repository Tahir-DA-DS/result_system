// Is a class ready to print? Lists what is still missing.
const { Stu, Sheet, Rep, CRep } = require('../models');
const { sid } = require('../lib/errors');

async function classStatus(c) {
  const [L, sheets, reps, cr] = await Promise.all([Stu.find({ class: c._id }).sort('name'), Sheet.find({ class: c._id }), Rep.find({ class: c._id }), CRep.findOne({ class: c._id })]);
  const sh = new Map(sheets.map(x => [sid(x.subject), x])), rp = new Map(reps.map(x => [sid(x.student), x]));
  const pend = c.subjects.filter(s => (sh.get(sid(s)) || {}).status !== 'approved').map(s => s.name);
  const miss = L.filter(x => !((rp.get(sid(x)) || {}).prin || '').trim()).map(x => x.name), crs = cr ? cr.status : 'draft';
  return { L, sheets, reps, cr, st: { ready: L.length > 0 && !pend.length && crs === 'approved' && !miss.length, pendingSubjects: pend, classReport: crs, missingPrincipalRemarks: miss, pupilCount: L.length } };
}

module.exports = classStatus;
