const { Schema, model } = require('mongoose');
const { ref, Log, STATUS } = require('./shared');

// One score sheet per class + subject. rows: { studentId: { a, b, e } }
const shSchema = new Schema({ class: ref('Class'), subject: Schema.Types.ObjectId, rows: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, enum: STATUS, default: 'draft' }, note: String, log: Log }, { minimize: false });
shSchema.index({ class: 1, subject: 1 }, { unique: true });
const Sheet = model('Sheet', shSchema);

module.exports = Sheet;
