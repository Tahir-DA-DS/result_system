// End of session: promote, repeat or release pupils, and start the new session.
const express = require('express');
const api = express.Router();
const { Cls, Stu, Cfg, Archive } = require('../models');
const { E, h, oid, sid, str } = require('../lib/errors');
const { need } = require('../lib/permissions');

const ACTIONS = ['promote', 'repeat', 'leave'];
const termSettings = async () => ((await Cfg.findById('term')) || {}).v || {};

// Sets every class's "promotes to" to the next class in order (the last one graduates).
api.post('/classes/auto-next', need('admin'), h(async (q, r) => {
  const all = await Cls.find().sort('order name');
  for (let i = 0; i < all.length; i++) { all[i].next = all[i + 1] ? all[i + 1]._id : null; await all[i].save(); }
  r.json({ ok: true });
}));

// Each class with its pupils and a default choice: "repeat" if their last Third Term status was Repeated, else "promote".
api.get('/promotion/preview', need('admin'), h(async (q, r) => {
  const classes = await Cls.find().sort('order name'), names = new Map(classes.map(c => [sid(c), c.name])), out = [];
  for (const c of classes) {
    const pupils = await Stu.find({ class: c._id }).sort('name').select('name');
    if (!pupils.length) continue;
    const last = await Archive.findOne({ class: c._id, termIndex: 3 }).sort('-createdAt');
    const status = new Map((last ? last.pupils : []).map(p => [p.id, p.report && p.report.st]));
    out.push({ id: c._id, name: c.name, next: c.next ? { id: c.next, name: names.get(sid(c.next)) || '?' } : null,
      pupils: pupils.map(p => ({ id: p._id, name: p.name, defaultAction: status.get(sid(p)) === 'Repeated' ? 'repeat' : 'promote' })) });
  }
  const term = await termSettings();
  r.json({ classes: out, termClosed: !term.term, session: term.session || '' });
}));

// body: { session: '2026/2027', moves: [{ student, action: 'promote' | 'repeat' | 'leave' }] }
api.post('/promotion/run', need('admin'), h(async (q, r) => {
  const term = await termSettings();
  if (term.term) throw E(409, 'Close the Third Term first');
  const session = str(q.body.session, 20);
  if (!session) throw E(400, 'Enter the new session, for example 2026/2027');
  const moves = q.body.moves || [];
  if (moves.some(m => !ACTIONS.includes(m.action))) throw E(400, 'Unknown action');

  const action = new Map(moves.map(m => [String(oid(m.student)), m.action]));
  const nextOf = new Map((await Cls.find()).map(c => [sid(c), c.next]));
  const counts = { promoted: 0, repeated: 0, left: 0 }, ops = [];
  for (const s of await Stu.find({ _id: { $in: [...action.keys()] } })) {
    const a = action.get(sid(s)), next = a === 'promote' ? nextOf.get(sid(s.class)) : null, filter = { _id: s._id }, unset = { avg: '' };   // new session: old term averages no longer apply
    if (a === 'repeat') { counts.repeated++; ops.push({ updateOne: { filter, update: { $unset: unset } } }); }
    else if (next) { counts.promoted++; ops.push({ updateOne: { filter, update: { $set: { class: next }, $unset: unset } } }); }
    else { counts.left++; ops.push({ updateOne: { filter, update: { $set: { class: null, graduated: true, lastClass: s.class, leftSession: term.session || '' }, $unset: unset } } }); }
  }
  if (ops.length) await Stu.bulkWrite(ops);
  await Cfg.findByIdAndUpdate('term', { v: { ...term, session, term: 'First' } }, { upsert: true });
  r.json(counts);
}));

module.exports = api;
