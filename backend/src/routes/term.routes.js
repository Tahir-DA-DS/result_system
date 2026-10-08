// Term settings (term, session, dates, times open, position switch).
const { Cfg } = require('../models');
const { h, str } = require('../lib/errors');
const { need } = require('../lib/permissions');

const express = require('express');
const api = express.Router();

api.get('/term', h(async (q, r) => r.json(((await Cfg.findById('term')) || {}).v || {})));
api.put('/term', need('admin'), h(async (q, r) => {
  const v = {}; for (const k of ['term', 'session', 'open', 'resumed', 'vacated', 'resumption', 'date', 'pos']) v[k] = str(q.body[k], 60);
  await Cfg.findByIdAndUpdate('term', { v }, { upsert: true }); r.json(v);
}));

module.exports = api;
