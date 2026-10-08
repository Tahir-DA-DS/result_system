// Small helpers used everywhere.
const { Types } = require('mongoose');

const E = (status, message) => Object.assign(new Error(message), { status });   // throw E(404, 'Not found')
const h = fn => (q, r, next) => fn(q, r).catch(next);                           // wraps async route handlers
const sid = x => String((x && x._id) || x);                                     // id as string, from a doc or an id
const oid = id => { if (!Types.ObjectId.isValid(id)) throw E(400, 'Bad id'); return id; };
const str = (v, max = 300) => String(v ?? '').trim().slice(0, max);              // safe trimmed text

module.exports = { E, h, sid, oid, str };
