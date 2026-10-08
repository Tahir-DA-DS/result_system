const { Schema, model } = require('mongoose');
const { ref } = require('./shared');

const Rep = model('Report', new Schema({ student: { ...ref('Student'), unique: true }, class: { ...ref('Class'), index: true }, b: { type: [Number], default: [0, 0, 0, 0, 0] },
  att: Number, rem: { type: String, default: '' }, prin: { type: String, default: '' }, st: { type: String, enum: ['', 'Promoted', 'Promoted on trial', 'Repeated'], default: '' },
  stlog: [{ by: ref('User'), from: String, to: String, at: { type: Date, default: Date.now } }] }));

module.exports = Rep;
