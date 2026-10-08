// Form teacher class reports and principal remarks.
const { Stu, Rep } = require('../models');
const { E, h, oid, sid, str } = require('../lib/errors');
const { isM, isFT, need } = require('../lib/permissions');
const { getClass, getCR } = require('../services/lookup');
const review = require('../services/review');

const express = require('express');
const api = express.Router();

api.get('/classes/:id/reports', h(async (q, r) => {
  const c = await getClass(q.params.id); if (!isFT(c, q.user) && !isM(q.user)) throw E(403, 'Not allowed');
  const cr = await getCR(c._id), reps = await Rep.find({ class: c._id }).lean();
  if (!isM(q.user)) reps.forEach(x => { delete x.prin; delete x.stlog; });
  r.json({ status: cr.status, note: cr.note || '', reports: reps });
}));
api.put('/reports/:student', h(async (q, r) => {
  const s = await Stu.findById(oid(q.params.student)); if (!s) throw E(404, 'Pupil not found'); const c = await getClass(s.class);
  if (!isFT(c, q.user)) throw E(403, 'Only the form teacher can edit this'); const cr = await getCR(c._id);
  if (!['draft', 'returned'].includes(cr.status)) throw E(409, 'The class report is locked');
  const { b, att, rem, st } = q.body, set = { class: c._id };
  if (b !== undefined) { if (!Array.isArray(b) || b.length !== 5 || b.some(v => !Number.isInteger(v) || v < 0 || v > 5)) throw E(400, 'Behaviour ratings must be five numbers from 0 to 5'); set.b = b; }
  if (att !== undefined && att !== '') { if (!Number.isInteger(att) || att < 0 || att > 400) throw E(400, 'Days attended must be a whole number'); set.att = att; }
  if (rem !== undefined) set.rem = str(rem);
  if (st !== undefined) { if (c.level !== 'secondary') throw E(400, 'Status applies to secondary classes only'); set.st = st; }
  r.json(await Rep.findOneAndUpdate({ student: s._id }, { $set: set }, { upsert: true, new: true, runValidators: true }));
}));
api.post('/classes/:id/report/submit', h(async (q, r) => {
  const c = await getClass(q.params.id); if (!isFT(c, q.user)) throw E(403, 'Only the form teacher can submit'); const cr = await getCR(c._id);
  if (!['draft', 'returned'].includes(cr.status)) throw E(409, 'Already submitted'); cr.status = 'submitted'; cr.log.push({ a: 'submit', by: q.user._id }); await cr.save(); r.json({ status: cr.status });
}));
api.post('/classes/:id/report/review', need('admin', 'management'), h(async (q, r) => r.json({ status: (await review(await getCR((await getClass(q.params.id))._id), q)).status })));
api.put('/classes/:id/principal', need('admin', 'management'), h(async (q, r) => {
  const c = await getClass(q.params.id), ids = new Set((await Stu.find({ class: c._id }).select('_id')).map(sid));
  for (const it of (q.body.items || []).slice(0, 500)) {
    if (!ids.has(String(it.student))) continue; const cur = await Rep.findOne({ student: it.student }), set = { class: c._id }, push = {};
    if (it.prin !== undefined) set.prin = str(it.prin);
    if (it.st !== undefined && c.level === 'secondary' && (cur ? cur.st : '') !== it.st) { set.st = it.st; push.stlog = { by: q.user._id, from: cur ? cur.st : '', to: it.st }; }
    await Rep.findOneAndUpdate({ student: it.student }, { $set: set, ...(push.stlog ? { $push: push } : {}) }, { upsert: true, runValidators: true });
  }
  r.json({ ok: true });
}));

module.exports = api;
