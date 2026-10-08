// Staff accounts (admin creates and edits; management can list).
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { E, h, oid, sid } = require('../lib/errors');
const { need } = require('../lib/permissions');

const express = require('express');
const api = express.Router();

api.get('/users', need('admin', 'management'), h(async (q, r) => r.json(await User.find().select('-hash').sort('name'))));
api.post('/users', need('admin'), h(async (q, r) => {
  const { name, email, password, role } = q.body; if (String(password || '').length < 8) throw E(400, 'Password needs at least 8 characters');
  const u = await User.create({ name, email, role, hash: await bcrypt.hash(password, 10) }); r.status(201).json({ id: u._id, name: u.name, email: u.email, role: u.role });
}));
api.patch('/users/:id', need('admin'), h(async (q, r) => {
  const u = await User.findById(oid(q.params.id)); if (!u) throw E(404, 'User not found'); const { name, role, active, password } = q.body;
  if (sid(u) === sid(q.user) && (active === false || (role && role !== 'admin'))) throw E(400, 'You cannot demote or deactivate yourself');
  if (name) u.name = name; if (role) u.role = role; if (typeof active === 'boolean') u.active = active;
  if (password) { if (String(password).length < 8) throw E(400, 'Password needs at least 8 characters'); u.hash = await bcrypt.hash(password, 10); }
  await u.save(); r.json({ id: u._id, name: u.name, email: u.email, role: u.role, active: u.active });
}));

module.exports = api;
