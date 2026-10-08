// Class broadsheet (read) and "submit several subjects at once" (subject teachers).
const express = require('express');
const api = express.Router();
const { E, h, oid, sid } = require('../lib/errors');
const { isM, isFT, isSubT } = require('../lib/permissions');
const { getClass, getSheet } = require('../services/lookup');
const { broadsheet } = require('../services/broadsheet');

api.get('/classes/:id/broadsheet', h(async (q, r) => {
  const c = await getClass(q.params.id);
  const involved = isM(q.user) || isFT(c, q.user) || c.subjects.some(s => sid(s.teacher) === sid(q.user));
  if (!involved) throw E(403, 'Not allowed');
  r.json(await broadsheet(c, q.user));
}));

// body: { subjects: [subjectId, ...] }. Submits each one the user teaches and that is still draft or returned.
api.post('/classes/:id/submit-subjects', h(async (q, r) => {
  const c = await getClass(q.params.id), submitted = [], skipped = [];
  for (const id of (q.body.subjects || []).map(String).slice(0, 50)) {
    const sub = c.subjects.id(oid(id));
    if (!sub) { skipped.push({ id, reason: 'Subject not found' }); continue; }
    if (!isSubT(sub, q.user)) { skipped.push({ id, reason: 'Not your subject' }); continue; }
    const sheet = await getSheet(c._id, sub._id);
    if (!['draft', 'returned'].includes(sheet.status)) { skipped.push({ id, reason: 'Already ' + sheet.status }); continue; }
    sheet.status = 'submitted'; sheet.log.push({ a: 'submit', by: q.user._id }); await sheet.save(); submitted.push(id);
  }
  r.json({ submitted, skipped });
}));

module.exports = api;
