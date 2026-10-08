// Builds the Express app: security middleware, routes, error handling. No database or listen() here.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { FRONTEND_ORIGINS } = require('./config');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);
app.use(helmet(), cors({ origin: FRONTEND_ORIGINS }), express.json({ limit: '1mb' }));

app.use('/api', require('./routes/public.routes')); // health, login (no sign-in needed)
app.use('/api', require('./routes'));                // everything else requires sign-in
app.use((q, r) => r.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

module.exports = app;
