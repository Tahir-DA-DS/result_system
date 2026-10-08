// Creates the first admin from .env when the database has no users.
const bcrypt = require('bcryptjs');
const { User } = require('./models');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('./config');

module.exports = async function seedAdmin() {
  if (await User.countDocuments() || !ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  await User.create({ name: 'Administrator', email: ADMIN_EMAIL, role: 'admin', hash: await bcrypt.hash(ADMIN_PASSWORD, 10) });
  console.log('First admin created:', ADMIN_EMAIL);
};
