const { Schema, model } = require('mongoose');
const { ref } = require('./shared');

// A frozen copy of one class's results for one term (exactly what the result sheets show), kept after the term is closed.
const schema = new Schema({
  session: String, term: String, termIndex: Number, class: ref('Class'), className: String, level: String,
  settings: Schema.Types.Mixed,    // term settings at the time (dates, times open ...)
  pupils: Schema.Types.Mixed,      // same shape as GET /classes/:id/results
  complete: Boolean,               // false if the term was closed with this class not fully approved
  history: Schema.Types.Mixed,     // who submitted / approved / returned / unlocked what, kept after the live logs are cleared
  closedBy: ref('User'),
}, { timestamps: true, minimize: false });
schema.index({ session: 1, term: 1, class: 1 }, { unique: true });

module.exports = model('Archive', schema);
