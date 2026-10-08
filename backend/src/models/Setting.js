const { Schema, model } = require('mongoose');

const Cfg = model('Setting', new Schema({ _id: String, v: Schema.Types.Mixed }, { minimize: false }));

module.exports = Cfg;
