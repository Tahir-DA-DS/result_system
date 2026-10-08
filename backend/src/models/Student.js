const { Schema, model } = require('mongoose');
const { ref } = require('./shared');

const Stu = model('Student', new Schema({ name: { type: String, required: true, trim: true }, adm: { type: String, default: '', trim: true },
  class: { ...ref('Class'), index: true }, avg: { t1: Number, t2: Number, t3: Number },
  graduated: { type: Boolean, default: false }, lastClass: ref('Class'), leftSession: String }));

module.exports = Stu;
