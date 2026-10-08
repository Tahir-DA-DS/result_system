// Everything under /api that needs a signed-in user. Add new route files here.
const express = require('express');
const auth = require('../middleware/auth');

const api = express.Router();
api.use(auth);
api.use(require('./account.routes'));
api.use(require('./users.routes'));
api.use(require('./classes.routes'));
api.use(require('./students.routes'));
api.use(require('./sheets.routes'));
api.use(require('./broadsheet.routes'));
api.use(require('./reports.routes'));
api.use(require('./term.routes'));
api.use(require('./archive.routes'));
api.use(require('./preview.routes'));
api.use(require('./history.routes'));
api.use(require('./promotion.routes'));
api.use(require('./results.routes'));
api.use(require('./backup.routes'));

module.exports = api;
