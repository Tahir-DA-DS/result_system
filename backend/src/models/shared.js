const { Schema } = require('mongoose');
const { STATUS } = require('../lib/constants');

const ref = n => ({ type: Schema.Types.ObjectId, ref: n });
const Log = [{ a: String, by: ref('User'), at: { type: Date, default: Date.now }, n: String }]; // approval history entries

module.exports = { ref, Log, STATUS };
