// Tests the term-closing logic against an in-memory fake of the database (no MongoDB needed). Run: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');

let db, failNextArchive;
const reset = () => {
  db = {
    classes: [{ _id: 'c1', name: 'JSS 1', level: 'secondary', subjects: [{ _id: 's1', name: 'Maths' }] },
              { _id: 'c2', name: 'JSS 2', level: 'secondary', subjects: [{ _id: 's2', name: 'English' }] }],
    students: [{ _id: 'p1', name: 'Ada', class: 'c1' }, { _id: 'p2', name: 'Bola', class: 'c1' }, { _id: 'p3', name: 'Chi', class: 'c2' }],
    sheets: [{ class: 'c1', subject: 's1', status: 'approved', rows: { p1: { a: 20, b: 20, e: 50 }, p2: { a: 10, b: 10, e: 30 } },
               log: [{ a: 'submit', by: 't1', at: new Date('2026-03-01') }, { a: 'approve', by: 'admin1', at: new Date('2026-03-02'), n: '' }] },
             { class: 'c2', subject: 's2', status: 'draft', rows: { p3: { a: 5 } } }],
    reps: [{ student: 'p1', class: 'c1', prin: 'Well done', st: 'Promoted' }, { student: 'p2', class: 'c1', prin: 'Fair', st: 'Repeated' }],
    classReps: [{ class: 'c1', status: 'approved' }],
    archive: [], term: { term: 'First', session: '2025/2026', open: '90', date: '1 Apr', pos: 'yes' }, avg: {},
  };
  failNextArchive = false;
};
const sid = x => String((x && x._id) || x);
const list = arr => Object.assign(Promise.resolve(arr), { sort: () => Promise.resolve(arr) });
const fakes = {
  Cls: { find: () => list(db.classes) },
  Stu: {
    find: f => list(db.students.filter(s => sid(s.class) === sid(f.class))),
    updateOne: async (f, u) => { for (const [k, v] of Object.entries(u.$set)) (db.avg[f._id] ??= {})[k.replace('avg.', '')] = v; },
  },
  Sheet: { find: f => Promise.resolve(db.sheets.filter(x => x.class === f.class)), deleteMany: async () => { db.sheets = []; } },
  Rep: { find: f => Promise.resolve(db.reps.filter(x => x.class === f.class)), deleteMany: async () => { db.reps = []; } },
  CRep: { findOne: async f => db.classReps.find(x => x.class === f.class) || null, deleteMany: async () => { db.classReps = []; } },
  Cfg: { findById: async () => ({ v: db.term }), findByIdAndUpdate: async (id, u) => { db.term = u.v; } },
  Archive: {
    countDocuments: async f => db.archive.filter(a => a.session === f.session && a.term === f.term).length,
    exists: async f => db.archive.find(a => a.session === f.session && a.term === f.term && a.class === f.class) || null,
    create: async doc => { if (failNextArchive) { failNextArchive = false; throw new Error('disk full'); } db.archive.push(doc); },
  },
};
const load = Module._load;
Module._load = function (request, parent, ...rest) { return request === '../models' ? fakes : load.call(this, request, parent, ...rest); };
const { closeTerm, closeCheck } = require('../src/services/termClose');
const user = { _id: 'admin1' };

test('closing is blocked, and nothing is deleted, while a class is not ready', async () => {
  reset();
  await assert.rejects(closeTerm(user, false), e => e.status === 409 && e.details.join() === 'JSS 2');
  assert.equal(db.archive.length, 0); assert.equal(db.sheets.length, 2); assert.equal(db.reps.length, 2); assert.equal(db.term.term, 'First');
});

test('forced close archives every class, saves averages, clears live data and moves to Second Term', async () => {
  reset();
  const res = await closeTerm(user, true);
  assert.equal(res.nextTerm, 'Second'); assert.equal(res.archivedClasses, 2); assert.equal(db.archive.length, 2);
});

test('a fully approved class is archived as complete with its principal remarks and status', async () => {
  reset();
  await closeTerm(user, true);
  const c1 = db.archive.find(a => a.class === 'c1');
  assert.equal(c1.complete, true);
  assert.equal(c1.pupils.find(p => p.id === 'p1').report.prin, 'Well done');
  assert.equal(c1.pupils.find(p => p.id === 'p2').report.st, 'Repeated');
  assert.equal(db.archive.find(a => a.class === 'c2').complete, false);
});

test('the approval history is kept in the archive after live logs are cleared', async () => {
  reset();
  await closeTerm(user, true);
  const h = db.archive.find(a => a.class === 'c1').history;
  assert.deepEqual(h.map(e => [e.action, e.subject, e.class]), [['submit', 'Maths', 'JSS 1'], ['approve', 'Maths', 'JSS 1']]);
});

test('averages are saved for the term, live data is cleared, and the next term starts clean', async () => {
  reset();
  await closeTerm(user, true);
  assert.equal(db.avg.p1.t1, 90); assert.equal(db.avg.p2.t1, 50);
  assert.deepEqual([db.sheets.length, db.reps.length, db.classReps.length], [0, 0, 0]);
  assert.deepEqual(db.term, { session: '2025/2026', term: 'Second', pos: 'yes', open: '', resumed: '', vacated: '', resumption: '', date: '' });
});

test('a failure part-way is safe to retry: archived classes are skipped, nothing is lost or duplicated', async () => {
  reset();
  db.sheets[1].status = 'approved'; db.classReps.push({ class: 'c2', status: 'approved' }); db.reps.push({ student: 'p3', class: 'c2', prin: 'Ok' });
  failNextArchive = false;
  const original = fakes.Archive.create; let calls = 0;
  fakes.Archive.create = async doc => { if (++calls === 2) throw new Error('network'); return original(doc); };
  await assert.rejects(closeTerm(user, false), /network/);
  assert.equal(db.archive.length, 1); assert.equal(db.sheets.length, 2, 'live data must survive a failed close');
  fakes.Archive.create = original;
  const res = await closeTerm(user, false);
  assert.equal(res.archivedClasses, 1); assert.equal(db.archive.length, 2); assert.equal(db.sheets.length, 0); assert.equal(db.term.term, 'Second');
});

test('Third Term closes into "no term", waiting for the new session', async () => {
  reset(); db.term.term = 'Third';
  assert.equal((await closeTerm(user, true)).nextTerm, '');
  assert.equal(db.term.term, '');
});

test('closing needs a valid term and session', async () => {
  reset(); db.term = { term: '', session: '' };
  await assert.rejects(closeTerm(user, true), e => e.status === 400);
  assert.equal((await closeCheck()).valid, false);
});
