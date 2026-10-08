// Management: term settings, review submitted sheets and class report, write principal remarks, check readiness.
import { h, card, options, mount } from '../../ui/dom.js';
import { Classes, Users, Students, Sheets, Reports, Results, Term } from '../../api/endpoints.js';
import { session } from '../../state/session.js';
import { termSettings } from './termSettings.js';
import { readiness, sheetReviews, classReportReview } from './sheetReviews.js';
import { principalRemarks } from './principalRemarks.js';

let selected = '';

export async function render(root) {
  const isAdmin = session.user.role === 'admin';
  const [classes, users] = await Promise.all([Classes.list(), Users.list()]);
  if (!classes.length) return root.append(card('No classes yet.'));
  const names = Object.fromEntries(users.map(u => [u._id, u.name]));

  const draw = async () => {
    const cls = classes.find(c => c._id === selected) || classes[0];
    selected = cls._id;
    const [status, sheets, reportData, pupils, averages, term] = await Promise.all([
      Results.status(cls._id), Sheets.forClass(cls._id), Reports.forClass(cls._id), Students.list(cls._id), Results.averages(cls._id), Term.get()]);
    const classSel = h('select', { value: cls._id, onchange: e => { selected = e.target.value; draw(); } }, options(classes.map(c => [c._id, c.name])));
    mount(root,
      termSettings(term, isAdmin),
      card(classSel, readiness(status)),
      sheetReviews({ cls, sheets, names, pupils, isAdmin, refresh: draw }),
      classReportReview({ cls, status: reportData.status, isAdmin, refresh: draw }),
      principalRemarks({ cls, pupils, reports: reportData.reports, averages, refresh: draw }));
  };
  await draw();
}
