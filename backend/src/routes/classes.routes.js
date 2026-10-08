// Classes and their subjects (subjects keep permanent ids).
const { Cls, Sheet, Stu, CRep } = require('../models');
const { DEF, PRE } = require('../lib/constants');
const { E, h, sid } = require('../lib/errors');
const { need } = require('../lib/permissions');
const { getClass } = require('../services/lookup');

const express = require('express');
const api = express.Router();

api.get('/classes', h(async (q, r) => r.json(await Cls.find().sort('order name'))));
api.post('/classes/seed-defaults', need('admin'), h(async (q, r) => {
  if (await Cls.countDocuments()) throw E(409, 'Classes already exist'); let o = 0;
  for (const [l, ...ns] of PRE) for (const n of ns) await Cls.create({ name: n, level: l, order: o++, subjects: DEF[l].map(name => ({ name })) });
  const all = await Cls.find().sort('order name');   // default promotion chain: each class moves to the next one
  for (let i = 0; i < all.length; i++) { all[i].next = all[i + 1] ? all[i + 1]._id : null; await all[i].save(); }
  r.json({ ok: true });
}));
api.post('/classes', need('admin'), h(async (q, r) => {
  const { name, level } = q.body; r.status(201).json(await Cls.create({ name, level, order: await Cls.countDocuments(), subjects: (DEF[level] || []).map(name => ({ name })) }));
}));
api.patch('/classes/:id', need('admin'), h(async (q, r) => {
  const c = await getClass(q.params.id), { name, formTeacher, subjects } = q.body;
  if (name) c.name = name; if (formTeacher !== undefined) c.formTeacher = formTeacher || null;
  if (q.body.next !== undefined) { if (sid(q.body.next) === sid(c)) throw E(400, 'A class cannot promote to itself'); c.next = q.body.next || null; }
  if (Array.isArray(subjects)) {
    const keep = new Set(subjects.map(s => s._id).filter(Boolean).map(String)), gone = c.subjects.filter(s => !keep.has(sid(s))).map(s => s._id);
    c.subjects = subjects.map(s => ({ ...(s._id ? { _id: s._id } : {}), name: s.name, teacher: s.teacher || null }));
    if (gone.length) await Sheet.deleteMany({ class: c._id, subject: { $in: gone } });
  }
  await c.save(); r.json(c);
}));
api.delete('/classes/:id', need('admin'), h(async (q, r) => {
  const c = await getClass(q.params.id); if (await Stu.countDocuments({ class: c._id })) throw E(409, 'Remove or move the pupils first');
  await Promise.all([Sheet.deleteMany({ class: c._id }), CRep.deleteMany({ class: c._id }), c.deleteOne()]); r.json({ ok: true });
}));

module.exports = api;
