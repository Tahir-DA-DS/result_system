// Full JSON backup (admin). Includes the archive of closed terms, which cannot be rebuilt from anything else.
const express = require('express');
const api = express.Router();
const { User, Cls, Stu, Sheet, Rep, CRep, Cfg, Archive } = require('../models');
const { h } = require('../lib/errors');
const { need } = require('../lib/permissions');

api.get('/export', need('admin'), h(async (q, r) => {
  const [users, classes, students, sheets, reports, classReports, settings, archives] = await Promise.all([
    User.find().select('-hash'), Cls.find(), Stu.find(), Sheet.find(), Rep.find(), CRep.find(), Cfg.find(), Archive.find()]);
  r.json({ exportedAt: new Date(), users, classes, students, sheets, reports, classReports, settings, archives });
}));

module.exports = api;
