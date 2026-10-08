// Things management should look at before approving a subject sheet.
import { totalOf, isComplete } from './grading.js';

// Returns { pupilId: ['incomplete', 'exam is 0', ...] } for pupils worth a second look.
export function findFlags(pupils, rows) {
  const totals = pupils.map(p => totalOf(rows[p._id])).filter(t => t != null);
  const mean = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  const flags = {};
  for (const p of pupils) {
    const r = rows[p._id], found = [], total = totalOf(r);
    if (!isComplete(r)) found.push('incomplete');
    if (r && r.e === 0) found.push('exam is 0');
    // only judge complete rows: a half-entered row is already flagged and its low total would be misleading
    if (isComplete(r) && totals.length >= 5 && Math.abs(total - mean) > 30) found.push('far from class average');
    if (found.length) flags[p._id] = found;
  }
  return flags;
}
