// Reads the Bearer token, loads the user, and puts it on req.user.
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET } = require('../config');

async function auth(q, r, n) {
  try { const { id } = jwt.verify((q.headers.authorization || '').replace('Bearer ', ''), JWT_SECRET), u = await User.findById(id); if (!u || !u.active) throw 0; q.user = u; n(); }
  catch { r.status(401).json({ error: 'Please sign in again' }); }
}

module.exports = auth;
