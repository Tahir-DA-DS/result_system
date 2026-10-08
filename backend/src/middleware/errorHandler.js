// One place that turns thrown errors into JSON responses. Unexpected errors are logged with context.
module.exports = (e, q, r, next) => {
  const status = e.status || (e.name === 'ValidationError' || e.name === 'CastError' ? 400 : e.code === 11000 ? 409 : 500);
  if (status === 500) console.error(`[${new Date().toISOString()}] ${q.method} ${q.originalUrl} user=${q.user ? q.user._id : '-'}`, e);
  r.status(status).json({ error: status === 500 ? 'Server error' : e.code === 11000 ? 'That already exists' : e.message, details: e.details });
};
