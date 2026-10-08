// Who may do what. Every role rule is in this file.
const { sid } = require('./errors');

const isM = u => u.role === 'admin' || u.role === 'management';
const isFT = (c, u) => u.role === 'admin' || sid(c.formTeacher) === sid(u);   // form teacher of class c
const isSubT = (s, u) => u.role === 'admin' || sid(s.teacher) === sid(u);     // teacher of subject s
const need = (...roles) => (q, r, n) => roles.includes(q.user.role) ? n() : r.status(403).json({ error: 'Not allowed' });

module.exports = { isM, isFT, isSubT, need };
