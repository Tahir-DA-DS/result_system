// Close the current term: shows every class's readiness, then archives, saves averages and clears live data.
import { h, card } from '../../ui/dom.js';
import { run, toast } from '../../ui/feedback.js';
import { Term } from '../../api/endpoints.js';

export async function closeTermCard(refresh) {
  const info = await Term.closeCheck();
  if (!info.valid) {
    return card(h('h3', {}, 'Close term'), h('p', { class: 'warn' }, info.session && !info.term
      ? 'No term is open. If you have just closed the Third Term, start the new session below.'
      : 'Set the Term (First, Second or Third) and the Session in Approve > Term settings first.'));
  }

  const label = `${info.term} Term ${info.session}`;
  const notReady = info.classes.filter(c => !c.ready);
  const row = c => h('tr', {}, h('td', {}, c.name), h('td', {}, c.pupilCount),
    h('td', { class: c.ready ? '' : 'miss' }, c.ready ? '✅ ready' : `⏳ ${c.pendingSubjects} subject(s) not approved · class report ${c.classReport} · ${c.missingRemarks} remark(s) missing`));

  const close = h('button', { class: 'btn' + (notReady.length ? ' danger' : '') }, notReady.length ? 'Close anyway (archive as incomplete)' : `Close ${label}`);
  close.onclick = () => run(close, async () => {
    const warning = notReady.length ? `\n\n${notReady.length} class(es) are not ready and will be archived as incomplete.` : '';
    const typed = prompt(`This archives ${label} for every class, saves the averages, and CLEARS the live scores, reports and approvals.${warning}\n\nType CLOSE to continue.`);
    if (typed !== 'CLOSE') return;
    const res = await Term.close(notReady.length > 0);
    toast(`${label} closed. ` + (res.nextTerm ? `Now ${res.nextTerm} Term.` : 'Start the new session below.'));
    await refresh();
  });

  return card(h('h3', {}, `Close ${label}`),
    info.alreadyArchived && h('p', { class: 'warn' }, 'Some classes are already archived for this term (an earlier close did not finish). Closing again finishes it safely.'),
    h('div', { class: 'scroll' }, h('table', { class: 'tbl' },
      h('thead', {}, h('tr', {}, ['Class', 'Pupils', 'Status'].map(t => h('th', {}, t)))), h('tbody', {}, info.classes.map(row)))),
    h('div', { class: 'row' }, close),
    h('p', { class: 'muted' }, 'Archived results can be reprinted any time from the Archive tab.'));
}
