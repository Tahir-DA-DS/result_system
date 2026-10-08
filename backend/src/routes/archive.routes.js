// Close a term (admin) and reprint old results from the archive (admin, management).
const express = require('express');
const api = express.Router();
const { Archive } = require('../models');
const { E, h, oid } = require('../lib/errors');
const { need } = require('../lib/permissions');
const { closeCheck, closeTerm } = require('../services/termClose');

api.get('/term/close-check', need('admin'), h(async (q, r) => r.json(await closeCheck())));
api.post('/term/close', need('admin'), h(async (q, r) => r.json(await closeTerm(q.user, !!q.body.force))));

// Closed terms, newest first, each with the classes archived.
api.get('/archive', need('admin', 'management'), h(async (q, r) => {
  const docs = await Archive.find().select('session term termIndex class className complete createdAt').sort('-createdAt'), groups = new Map();
  for (const d of docs) {
    const key = d.session + '|' + d.term;
    if (!groups.has(key)) groups.set(key, { session: d.session, term: d.term, termIndex: d.termIndex, closedAt: d.createdAt, classes: [] });
    groups.get(key).classes.push({ id: d.class, name: d.className, complete: d.complete });
  }
  r.json([...groups.values()]);
}));

// Same shape as /classes/:id/results, so the same sheet builder prints it.
api.get('/archive/results', need('admin', 'management'), h(async (q, r) => {
  const d = await Archive.findOne({ session: String(q.query.session), term: String(q.query.term), class: oid(q.query.class) });
  if (!d) throw E(404, 'Not found in the archive');
  r.json({ term: d.settings, class: { id: d.class, name: d.className, level: d.level }, complete: d.complete, pupils: d.pupils });
}));

module.exports = api;
