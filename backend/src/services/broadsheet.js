// The class broadsheet: pupils x subjects, with who may see which column's scores.
const { Stu, Sheet, User } = require('../models');
const { sid } = require('../lib/errors');
const { isM, isFT, isSubT } = require('../lib/permissions');

// Management sees everything. A subject teacher sees their own subject. A form teacher also sees
// other subjects once they are submitted (never another teacher's drafts).
const canSee = (user, cls, subject, status) =>
  isM(user) || isSubT(subject, user) || (isFT(cls, user) && ['submitted', 'approved'].includes(status));

async function broadsheet(cls, user) {
  const teacherIds = cls.subjects.map(s => s.teacher).filter(Boolean);
  const [pupils, sheets, teachers] = await Promise.all([
    Stu.find({ class: cls._id }).sort('name').select('name adm'),
    Sheet.find({ class: cls._id }),
    User.find({ _id: { $in: teacherIds } }).select('name'),
  ]);
  const sheetOf = new Map(sheets.map(x => [sid(x.subject), x]));
  const nameOf = new Map(teachers.map(t => [sid(t), t.name]));

  const subjects = cls.subjects.map(s => {
    const sheet = sheetOf.get(sid(s)) || {}, status = sheet.status || 'draft', visible = canSee(user, cls, s, status);
    return { id: s._id, name: s.name, teacher: s.teacher || null, teacherName: nameOf.get(sid(s.teacher)) || '', status, note: sheet.note || '',
      mine: sid(s.teacher) === sid(user), visible, rows: visible ? (sheet.rows || {}) : null };
  });
  return { class: { id: cls._id, name: cls.name, level: cls.level }, pupils, subjects };
}

module.exports = { broadsheet, canSee };
