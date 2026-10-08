// Draft result sheets (form teacher, management) and the class broadsheet (management).
const express = require('express');
const api = express.Router();
const { E, h } = require('../lib/errors');
const { isM, isFT, need } = require('../lib/permissions');
const { getClass } = require('../services/lookup');
const { draftResults, mastersheet } = require('../services/previews');

api.get('/classes/:id/preview', h(async (q, r) => {
  const c = await getClass(q.params.id);
  if (!isM(q.user) && !isFT(c, q.user)) throw E(403, 'Only the form teacher can preview the class sheets');
  r.json(await draftResults(c, q.user));
}));
api.get('/classes/:id/mastersheet', need('admin', 'management'), h(async (q, r) => r.json(await mastersheet(await getClass(q.params.id)))));

module.exports = api;
