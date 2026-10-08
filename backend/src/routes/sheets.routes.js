// Score entry (subject teachers) and review (management).
const { Sheet, Stu } = require('../models');
const { E, h, oid, sid } = require('../lib/errors');
const { isM, isSubT, need } = require('../lib/permissions');
const { getClass, getSheet } = require('../services/lookup');
const review = require('../services/review');

const express = require('express');
const api = express.Router();

api.get('/classes/:id/sheets', h(async (q, r) => {
  const c = await getClass(q.params.id), all = await Sheet.find({ class: c._id });
  r.json(c.subjects.filter(s => isM(q.user) || isSubT(s, q.user)).map(s => { const x = all.find(y => sid(y.subject) === sid(s)) || {};
    return { subject: s._id, name: s.name, teacher: s.teacher, status: x.status || 'draft', note: x.note || '', rows: x.rows || {} }; }));
}));
api.put('/sheets/:c/:s', h(async (q, r) => {
  const c = await getClass(q.params.c), sub = c.subjects.id(oid(q.params.s)); if (!sub) throw E(404, 'Subject not found');
  if (!isSubT(sub, q.user)) throw E(403, 'This is not your subject');
  const sh = await getSheet(c._id, sub._id); if (!['draft', 'returned'].includes(sh.status)) throw E(409, 'This sheet is locked');
  const ids = new Set((await Stu.find({ class: c._id }).select('_id')).map(sid)), rows = {};
  for (const [k, v] of Object.entries(q.body.rows || {})) {
    if (!ids.has(k)) continue; const o = {};
    for (const [f, mx] of [['a', 20], ['b', 20], ['e', 60]]) if (v && v[f] !== undefined && v[f] !== null && v[f] !== '') {
      const n = Number(v[f]); if (!Number.isInteger(n) || n < 0 || n > mx) throw E(400, f.toUpperCase() + ' must be a whole number from 0 to ' + mx); o[f] = n; }
    if (Object.keys(o).length) rows[k] = o;
  }
  sh.rows = rows; sh.markModified('rows'); await sh.save(); r.json({ status: sh.status });
}));
api.post('/sheets/:c/:s/submit', h(async (q, r) => {
  const c = await getClass(q.params.c), sub = c.subjects.id(oid(q.params.s)); if (!sub) throw E(404, 'Subject not found');
  if (!isSubT(sub, q.user)) throw E(403, 'This is not your subject'); const sh = await getSheet(c._id, sub._id);
  if (!['draft', 'returned'].includes(sh.status)) throw E(409, 'Already submitted'); sh.status = 'submitted'; sh.log.push({ a: 'submit', by: q.user._id }); await sh.save(); r.json({ status: sh.status });
}));
api.post('/sheets/:c/:s/review', need('admin', 'management'), h(async (q, r) => {
  const c = await getClass(q.params.c); if (!c.subjects.id(oid(q.params.s))) throw E(404, 'Subject not found');
  r.json({ status: (await review(await getSheet(c._id, q.params.s), q)).status });
}));

module.exports = api;
