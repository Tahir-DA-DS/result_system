// Signed-in user: profile and own password.
const bcrypt = require('bcryptjs');
const { E, h } = require('../lib/errors');

const express = require('express');
const api = express.Router();

api.get('/me', (q, r) => r.json({ id: q.user._id, name: q.user.name, email: q.user.email, role: q.user.role }));
api.post('/me/password', h(async (q, r) => {
  const { current, password } = q.body; if (!(await bcrypt.compare(String(current || ''), q.user.hash))) throw E(400, 'Current password is wrong');
  if (String(password || '').length < 8) throw E(400, 'Use at least 8 characters'); q.user.hash = await bcrypt.hash(password, 10); await q.user.save(); r.json({ ok: true });
}));

module.exports = api;
