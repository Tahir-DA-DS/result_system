// Approve / return / unlock a sheet or class report. Status rules and the history log live here.
const { E, str } = require('../lib/errors');

async function review(doc, q) {
  const { action } = q.body, note = str(q.body.note), to = { approve: 'approved', return: 'returned', unlock: 'returned' }[action];
  if (!to) throw E(400, 'Bad action');
  if ((action !== 'unlock' && doc.status !== 'submitted') || (action === 'unlock' && doc.status !== 'approved')) throw E(409, 'This cannot be ' + action + 'ed in its current status (' + doc.status + ')');
  if (action === 'unlock' && q.user.role !== 'admin') throw E(403, 'Only admins can unlock');
  if (action !== 'approve' && !note) throw E(400, 'A reason is required');
  doc.status = to; doc.note = action === 'approve' ? '' : note; doc.log.push({ a: action, by: q.user._id, n: note }); await doc.save(); return doc;
}

module.exports = review;
