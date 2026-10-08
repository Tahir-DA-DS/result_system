const { Schema, model } = require('mongoose');
const { ref } = require('./shared');

const Cls = model('Class', new Schema({ name: { type: String, required: true, trim: true }, level: { type: String, enum: ['nursery', 'primary', 'secondary'], required: true },
  order: Number, formTeacher: ref('User'), next: ref('Class'),   // next = class pupils move to (empty = graduates)
  subjects: [{ name: { type: String, required: true, trim: true }, teacher: ref('User') }] }));

module.exports = Cls;
