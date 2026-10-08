// Who submitted, approved, returned or unlocked what, and when. Live logs plus the copies kept in the archive.
const { Cls, Sheet, CRep, Archive, User } = require('../models');
const { sid } = require('../lib/errors');

// Events for one class: every entry in its sheets' logs and its class report's log.
const eventsFrom = (cls, sheets, cr) => [
  ...sheets.flatMap(sh => {
    const subject = cls.subjects.find(s => sid(s) === sid(sh.subject));
    return (sh.log || []).map(e => ({ at: e.at, action: e.a, by: sid(e.by), note: e.n || '', class: cls.name, subject: subject ? subject.name : 'Removed subject' }));
  }),
  ...((cr && cr.log) || []).map(e => ({ at: e.at, action: e.a, by: sid(e.by), note: e.n || '', class: cls.name, subject: 'Class report' })),
];

async function history(limit = 300) {
  const [classes, sheets, crs, archives, users] = await Promise.all([Cls.find(), Sheet.find(), CRep.find(), Archive.find().select('history session term'), User.find().select('name')]);
  const events = [];
  for (const c of classes) events.push(...eventsFrom(c, sheets.filter(x => sid(x.class) === sid(c)), crs.find(x => sid(x.class) === sid(c))));
  for (const a of archives) for (const e of a.history || []) events.push({ ...e, term: `${a.term} Term ${a.session}` });
  const names = new Map(users.map(u => [sid(u), u.name]));
  return events.map(e => ({ ...e, byName: names.get(e.by) || 'Unknown' })).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, limit);
}

module.exports = { eventsFrom, history };
