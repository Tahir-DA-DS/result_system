// Is the class ready? Review each subject sheet and the class report.
import { h, card } from '../../ui/dom.js';
import { scoreTable } from '../../ui/scoreTable.js';
import { statusTag } from '../../ui/statusTag.js';
import { reviewButtons } from '../../ui/reviewButtons.js';
import { Sheets, Reports } from '../../api/endpoints.js';

export function readiness(s) {
  return h('div', {},
    h('p', {}, h('b', {}, s.ready ? '✅ Ready to print' : '⏳ Not ready yet')),
    h('p', { class: 'muted' }, `${s.pendingSubjects.length} subject sheet(s) not approved · class report: ${s.classReport} · ${s.missingPrincipalRemarks.length} principal remark(s) missing`));
}

export function sheetReviews({ cls, sheets, names, pupils, isAdmin, refresh }) {
  return card(h('h3', {}, 'Subject sheets'), cls.subjects.map(subject => {
    const sheet = sheets.find(s => s.subject === subject._id) || { status: 'draft', rows: {} };
    const entered = Object.keys(sheet.rows || {}).length;
    return h('div', { class: 'subject' },
      h('div', { class: 'row' },
        h('div', { class: 'grow' }, h('b', {}, subject.name), h('br'), h('span', { class: 'muted' }, `${names[subject.teacher] || 'no teacher'} · ${entered}/${pupils.length} pupils`)),
        statusTag(sheet.status),
        reviewButtons(sheet.status, isAdmin, (action, note) => Sheets.review(cls._id, subject._id, action, note), refresh)),
      h('details', {}, h('summary', { class: 'muted' }, 'View all scores'), scoreTable(pupils, sheet.rows || {})));
  }));
}

export function classReportReview({ cls, status, isAdmin, refresh }) {
  return card(h('h3', {}, 'Class report (form teacher)'), h('div', { class: 'row' }, statusTag(status),
    reviewButtons(status, isAdmin, (action, note) => Reports.review(cls._id, action, note), refresh)));
}
