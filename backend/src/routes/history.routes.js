// Approval history (management, admin).
const express = require('express');
const api = express.Router();
const { h } = require('../lib/errors');
const { need } = require('../lib/permissions');
const { history } = require('../services/history');

api.get('/history', need('admin', 'management'), h(async (q, r) => r.json(await history())));

module.exports = api;
