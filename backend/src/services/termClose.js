// Closing a term: archive every class's results, save averages for later terms, clear live data, move to the next term.
const { Cls, Stu, Sheet, Rep, CRep, Cfg, Archive } = require('../models');
const { E } = require('../lib/errors');
const classStatus = require('./classStatus');
const { compute, termIdx } = require('./grading');
const { eventsFrom } = require('./history');

const NEXT_TERM = ['', 'Second', 'Third', ''];   // indexed by the current term number; after Third, a new session starts
const currentTerm = async () => ((await Cfg.findById('term')) || {}).v || {};

// What closing would do: every class with pupils and whether it is ready.
async function closeCheck() {
  const term = await currentTerm(), ti = termIdx(term.term), classes = [];
  for (const c of await Cls.find().sort('order name')) {
    const s = await classStatus(c);
    if (!s.L.length) continue;
    classes.push({ id: c._id, name: c.name, pupilCount: s.L.length, ready: s.st.ready, pendingSubjects: s.st.pendingSubjects.length,
      classReport: s.st.classReport, missingRemarks: s.st.missingPrincipalRemarks.length });
  }
  const valid = !!ti && !!term.session;
  return { term: term.term || '', session: term.session || '', valid, alreadyArchived: valid && !!(await Archive.countDocuments({ session: term.session, term: term.term })), classes };
}

// Safe to run again after a failure: classes already archived are skipped, and clearing/advancing happens last.
async function closeTerm(user, force) {
  const term = await currentTerm(), ti = termIdx(term.term);
  if (!ti || !term.session) throw E(400, 'Set the Term (First, Second or Third) and Session in Term settings first');

  const jobs = [], notReady = [];
  for (const c of await Cls.find().sort('order name')) {
    if (await Archive.exists({ session: term.session, term: term.term, class: c._id })) continue;
    const s = await classStatus(c);
    if (!s.L.length) continue;
    jobs.push({ c, s });
    if (!s.st.ready) notReady.push(c.name);
  }
  if (notReady.length && !force) throw Object.assign(E(409, 'Some classes are not ready'), { details: notReady });

  for (const { c, s } of jobs) {
    const pupils = compute(c, s.L, s.sheets, s.reps, term);
    await Archive.create({ session: term.session, term: term.term, termIndex: ti, class: c._id, className: c.name, level: c.level,
      settings: term, pupils, complete: s.st.ready, history: eventsFrom(c, s.sheets, s.cr), closedBy: user._id });
    for (const p of pupils) if (p.average != null) await Stu.updateOne({ _id: p.id }, { $set: { ['avg.t' + ti]: p.average } });
  }

  await Promise.all([Sheet.deleteMany({}), CRep.deleteMany({}), Rep.deleteMany({})]);
  await Cfg.findByIdAndUpdate('term', { v: { session: term.session, term: NEXT_TERM[ti], pos: term.pos || '', open: '', resumed: '', vacated: '', resumption: '', date: '' } }, { upsert: true });
  return { closed: term.term, archivedClasses: jobs.length, nextTerm: NEXT_TERM[ti] };
}

module.exports = { closeCheck, closeTerm };
