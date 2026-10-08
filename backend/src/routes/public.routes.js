// No sign-in needed: health check (also wakes the free server) and login.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { User } = require('../models');
const { JWT_SECRET } = require('../config');
const { E, h, str } = require('../lib/errors');

const pub = express.Router();

pub.get('/health', (q, r) => r.json({ ok: true }));
pub.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many attempts. Try again later.' } }), h(async (q, r) => {
  const u = await User.findOne({ email: str(q.body.email, 200).toLowerCase() });
  if (!u || !u.active || !(await bcrypt.compare(String(q.body.password || ''), u.hash))) throw E(401, 'Wrong email or password');
  r.json({ token: jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: '12h' }), user: { id: u._id, name: u.name, email: u.email, role: u.role } });
}));

module.exports = pub;
