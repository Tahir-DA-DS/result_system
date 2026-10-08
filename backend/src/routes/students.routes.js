// Pupils.
const { Stu, Rep } = require('../models');
const { E, h, oid, str } = require('../lib/errors');
const { need } = require('../lib/permissions');
const { getClass } = require('../services/lookup');

const express = require('express');
const api = express.Router();

api.get('/classes/:id/students', h(async (q, r) => r.json(await Stu.find({ class: (await getClass(q.params.id))._id }).sort('name'))));
api.post('/students', need('admin'), h(async (q, r) => {
  const c = await getClass(q.body.class), list = (q.body.students || []).filter(s => str(s.name)).slice(0, 500);
  r.status(201).json(await Stu.insertMany(list.map(s => ({ name: str(s.name, 120), adm: str(s.adm, 40), class: c._id }))));
}));
api.patch('/students/:id', need('admin'), h(async (q, r) => {
  const s = await Stu.findById(oid(q.params.id)); if (!s) throw E(404, 'Pupil not found'); const { name, adm } = q.body;
  if (name) s.name = name; if (adm !== undefined) s.adm = adm; if (q.body.class) s.class = (await getClass(q.body.class))._id; await s.save(); r.json(s);
}));
api.delete('/students/:id', need('admin'), h(async (q, r) => { await Rep.deleteOne({ student: oid(q.params.id) }); await Stu.deleteOne({ _id: q.params.id }); r.json({ ok: true }); }));

module.exports = api;
