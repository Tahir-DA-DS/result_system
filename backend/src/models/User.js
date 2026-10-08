const { Schema, model } = require('mongoose');

const User = model('User', new Schema({ name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  hash: { type: String, required: true }, role: { type: String, enum: ['admin', 'management', 'teacher'], default: 'teacher' }, active: { type: Boolean, default: true } }));

module.exports = User;
