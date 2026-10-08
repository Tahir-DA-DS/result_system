// All environment settings live here. Nothing else reads process.env.
require('dotenv').config();
const { MONGODB_URI, JWT_SECRET, FRONTEND_URL = '', PORT = 3000, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGODB_URI || !JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('Set MONGODB_URI and a JWT_SECRET of at least 32 characters.');
  process.exit(1);
}

module.exports = {
  MONGODB_URI, JWT_SECRET, PORT, ADMIN_EMAIL, ADMIN_PASSWORD,
  FRONTEND_ORIGINS: FRONTEND_URL.split(',').map(s => s.trim()).filter(Boolean),
};
