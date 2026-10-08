// Readiness, print data and saving term averages.
const { Cfg, Stu } = require('../models');
const { SC } = require('../lib/constants');
const { E, h } = require('../lib/errors');
const { need } = require('../lib/permissions');
const { getClass } = require('../services/lookup');
const classStatus = require('../services/classStatus');
const { compute, termIdx } = require('../services/grading');

const express = require('express');
const api = express.Router();

api.get('/classes/:id/status', need('admin', 'management'), h(async (q, r) => r.json((await classStatus(await getClass(q.params.id))).st)));
// Per-pupil averages from whatever has been entered so far (used for suggested principal remarks).
api.get('/classes/:id/averages', need('admin', 'management'), h(async (q, r) => {
  const c = await getClass(q.params.id), s = await classStatus(c), term = ((await Cfg.findById('term')) || {}).v || {};
  r.json(compute(c, s.L, s.sheets, s.reps, term).map(p => ({ id: p.id, average: p.average })));
}));
api.get('/classes/:id/results', need('admin', 'management'), h(async (q, r) => {
  const c = await getClass(q.params.id), s = await classStatus(c), term = ((await Cfg.findById('term')) || {}).v || {};
  r.json({ status: s.st, term, scale: SC, class: { id: c._id, name: c.name, level: c.level }, pupils: s.st.ready ? compute(c, s.L, s.sheets, s.reps, term) : null });
}));
api.post('/classes/:id/save-averages', need('admin', 'management'), h(async (q, r) => {
  const c = await getClass(q.params.id), s = await classStatus(c), term = ((await Cfg.findById('term')) || {}).v || {}, ti = termIdx(term.term);
  if (!ti) throw E(400, 'Set the term to First, Second or Third first'); if (!s.st.ready) throw E(409, 'The class is not ready yet');
  for (const p of compute(c, s.L, s.sheets, s.reps, term)) if (p.average != null) await Stu.updateOne({ _id: p.id }, { $set: { ['avg.t' + ti]: p.average } });
  r.json({ ok: true });
}));

module.exports = api;
