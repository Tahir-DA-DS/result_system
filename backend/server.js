// Entry point: connect to MongoDB, seed the first admin, start listening.
const dns = require('dns');

dns.setServers([
  '8.8.8.8',
  '1.1.1.1'
]);
const mongoose = require('mongoose');
const { MONGODB_URI, PORT } = require('./src/config');
const app = require('./src/app');
const seedAdmin = require('./src/bootstrap');

mongoose.connect(MONGODB_URI)
  .then(seedAdmin)
  .then(() => app.listen(PORT, () => console.log('API listening on', PORT)))
  .catch(e => { console.error('Startup failed:', e.message); process.exit(1); });
