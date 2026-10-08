// What is still missing on each pupil's class report?
export function missingFields(rep, level) {
  const missing = [];
  if (!rep || !Array.isArray(rep.b) || rep.b.some(v => !v)) missing.push('behaviour ratings');
  if (!rep || rep.att === '' || rep.att == null) missing.push('days attended');
  if (!rep || !rep.rem || !rep.rem.trim()) missing.push('remark');
  if (level === 'secondary' && !(rep && rep.st)) missing.push('status');
  return missing;
}

// [{ name, missing: [...] }] for every pupil whose report is not complete.
export const incompleteReports = (pupils, reports, level) =>
  pupils.map(p => ({ name: p.name, missing: missingFields(reports[p._id], level) })).filter(x => x.missing.length);
