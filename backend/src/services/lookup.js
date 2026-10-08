// Find-or-404 helpers and get-or-create for sheets and class reports.
const { Cls, Sheet, CRep } = require('../models');
const { E, oid } = require('../lib/errors');

async function getClass(id) { const c = await Cls.findById(oid(id)); if (!c) throw E(404, 'Class not found'); return c; }
const getSheet = (c, s) => Sheet.findOneAndUpdate({ class: c, subject: s }, { $setOnInsert: { status: 'draft', rows: {} } }, { upsert: true, new: true });
const getCR = c => CRep.findOneAndUpdate({ class: c }, { $setOnInsert: { status: 'draft' } }, { upsert: true, new: true });

module.exports = { getClass, getSheet, getCR };
