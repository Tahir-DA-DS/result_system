const { Schema, model } = require('mongoose');
const { ref, Log, STATUS } = require('./shared');

const CRep = model('ClassReport', new Schema({ class: { ...ref('Class'), unique: true }, status: { type: String, enum: STATUS, default: 'draft' }, note: String, log: Log }));

module.exports = CRep;
